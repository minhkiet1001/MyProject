import React, { useEffect, useState, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  VideoCameraIcon,
  MicrophoneIcon,
  PhoneIcon,
  SpeakerWaveIcon,
  VideoCameraSlashIcon,
  XMarkIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/solid";
import Button from "../common/Button";
import {
  isValidAppId,
  isValidToken,
  getEffectiveAppId,
} from "../../utils/agoraUtils";

// Hàm kiểm tra tính hợp lệ của App ID
const isValidAppIdFormat = (appId) => {
  return typeof appId === "string" && appId.length > 10;
};

const VideoCallComponent = ({
  appId,
  channelName,
  token,
  uid,
  onCallEnd,
  role,
}) => {
  // Sử dụng App ID từ props hoặc fallback nếu không hợp lệ
  const effectiveAppId = getEffectiveAppId(appId);

  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [initializationComplete, setInitializationComplete] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const agoraEngineRef = useRef(null);
  const joinAttemptRef = useRef(null);

  // Initialize Agora client
  useEffect(() => {
    // Clear any previous initialization
    if (agoraEngineRef.current) {
      try {
        agoraEngineRef.current.removeAllListeners();
      } catch (e) {
        console.error("Error removing listeners:", e);
      }
      agoraEngineRef.current = null;
    }

    // Kiểm tra tính hợp lệ của App ID
    if (!isValidAppId(effectiveAppId)) {
      console.error("Invalid App ID format:", effectiveAppId);
      setError("App ID không hợp lệ. Vui lòng kiểm tra cấu hình.");
      setIsLoading(false);
      return;
    }

    // In ra giá trị App ID thực tế được sử dụng
    console.log("Using Agora App ID:", effectiveAppId);

    // Validate required props
    if (!effectiveAppId || !channelName || !token) {
      console.error("Missing required props:", {
        appId: effectiveAppId,
        channelName,
        token,
      });
      setError("Thiếu thông tin kết nối video. Vui lòng thử lại sau.");
      setIsLoading(false);
      return;
    }

    // Validate token format
    if (!isValidToken(token)) {
      setError("Token không hợp lệ. Vui lòng làm mới trang và thử lại.");
      setIsLoading(false);
      return;
    }

    console.log("Initializing Agora client with:", {
      appId: effectiveAppId,
      channelName,
      token: token ? token.substring(0, 10) + "..." : "missing",
      uid,
    });

    try {
      // Create Agora client
      const agoraEngine = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      agoraEngineRef.current = agoraEngine;

      // Set up event listeners
      agoraEngine.on("user-published", handleUserPublished);
      agoraEngine.on("user-unpublished", handleUserUnpublished);
      agoraEngine.on("user-joined", (user) => {
        console.log("Remote user joined:", user.uid);
      });
      agoraEngine.on("user-left", (user) => {
        console.log("Remote user left:", user.uid);
        setRemoteUsers((prevUsers) =>
          prevUsers.filter((u) => u.uid !== user.uid)
        );
      });
      agoraEngine.on("connection-state-change", (state, reason) => {
        console.log("Connection state changed to:", state, "Reason:", reason);

        if (state === "CONNECTED") {
          console.log("Successfully connected to Agora");
        } else if (state === "DISCONNECTED" || state === "FAILED") {
          console.error(`Connection ${state.toLowerCase()} due to ${reason}`);
          if (reason === "NETWORK_ERROR") {
            setError("Mất kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.");
          }
        }
      });

      setInitializationComplete(true);
    } catch (err) {
      console.error("Error initializing Agora client:", err);
      setError("Không thể khởi tạo kết nối video: " + err.message);
      setIsLoading(false);
    }
  }, [effectiveAppId, channelName, token, uid]);

  // Join channel when initialization is complete
  useEffect(() => {
    if (initializationComplete) {
      joinChannel();
    }

    return () => {
      // Cancel any pending join attempt
      if (joinAttemptRef.current) {
        clearTimeout(joinAttemptRef.current);
      }
    };
  }, [initializationComplete]);

  const joinChannel = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const agoraEngine = agoraEngineRef.current;

      if (!agoraEngine) {
        throw new Error("Agora client not initialized");
      }

      console.log(
        `Attempting to join channel: ${channelName} with uid: ${uid} and appId: ${effectiveAppId}`
      );

      // Join the channel
      await agoraEngine.join(effectiveAppId, channelName, token, uid);
      console.log("Successfully joined channel:", channelName);

      try {
        // Create and publish local tracks
        console.log("Creating microphone and camera tracks separately");

        // Create audio and video tracks separately for better error handling
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          AEC: true,
          AGC: true,
          ANS: true,
        });

        const videoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: {
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
            frameRate: 24,
          },
        });

        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);

        // Play local video track
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }

        // Publish local tracks
        console.log("Publishing local tracks");
        await agoraEngine.publish([audioTrack, videoTrack]);
        console.log("Published local tracks successfully");

        setIsJoined(true);
        setRetryCount(0);
      } catch (mediaError) {
        console.error("Error accessing media devices:", mediaError);
        // Even if we can't access media, we're still in the channel
        setError(
          "Không thể truy cập camera hoặc microphone. Vui lòng kiểm tra quyền truy cập thiết bị."
        );
        setIsJoined(true); // Still consider joined even without media
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error joining channel:", err);
      let errorMessage = "Không thể tham gia cuộc gọi: ";

      // Handle specific error cases
      if (err.message && err.message.includes("OPERATION_ABORTED")) {
        errorMessage += "Kết nối bị hủy. Vui lòng thử lại.";

        // Retry logic for OPERATION_ABORTED
        if (retryCount < 2) {
          console.log(`Retrying join (attempt ${retryCount + 1})...`);
          setRetryCount((prev) => prev + 1);

          // Wait a bit before retrying
          joinAttemptRef.current = setTimeout(() => {
            joinChannel();
          }, 2000);

          return;
        }
      } else if (err.message && err.message.includes("INVALID_TOKEN")) {
        errorMessage += "Token không hợp lệ hoặc đã hết hạn.";
      } else if (err.message && err.message.includes("NETWORK")) {
        errorMessage += "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.";
      } else {
        errorMessage += err.message;
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleUserPublished = async (user, mediaType) => {
    console.log("Remote user published:", user.uid, mediaType);

    const agoraEngine = agoraEngineRef.current;
    if (!agoraEngine) return;

    // Subscribe to the remote user
    try {
      await agoraEngine.subscribe(user, mediaType);
      console.log("Subscribed to remote user:", user.uid, mediaType);

      // If new user, add to remoteUsers state
      setRemoteUsers((prevUsers) => {
        if (!prevUsers.find((u) => u.uid === user.uid)) {
          return [...prevUsers, user];
        }
        return prevUsers;
      });

      // If mediaType is 'video', play the video
      if (mediaType === "video") {
        // Wait a bit to ensure DOM is ready
        setTimeout(() => {
          const remoteVideoDiv = document.getElementById(
            `remote-video-${user.uid}`
          );
          if (remoteVideoDiv && user.videoTrack) {
            user.videoTrack.play(remoteVideoDiv);
          }
        }, 100);
      }

      // If mediaType is 'audio', play the audio
      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.play();
      }
    } catch (error) {
      console.error("Error subscribing to remote user:", error);
    }
  };

  const handleUserUnpublished = (user, mediaType) => {
    console.log("Remote user unpublished:", user.uid, mediaType);
    // If the user unpublished video, we can stop playing it
    if (mediaType === "video" && user.videoTrack) {
      user.videoTrack.stop();
    }
  };

  const leaveChannel = async () => {
    try {
      console.log("Leaving channel...");

      // Cancel any pending join attempt
      if (joinAttemptRef.current) {
        clearTimeout(joinAttemptRef.current);
      }

      // Stop and close local tracks
      if (localAudioTrack) {
        localAudioTrack.close();
      }
      if (localVideoTrack) {
        localVideoTrack.close();
      }

      // Leave the channel
      if (agoraEngineRef.current) {
        await agoraEngineRef.current.leave();
        console.log("Left channel successfully");
      }

      setIsJoined(false);
      setRemoteUsers([]);
      setLocalAudioTrack(null);
      setLocalVideoTrack(null);

      if (onCallEnd) {
        onCallEnd(true); // Pass true to indicate successful call completion
      }
    } catch (err) {
      console.error("Error leaving channel:", err);
    }
  };

  const toggleVideo = async () => {
    if (!localVideoTrack) return;

    if (isVideoEnabled) {
      await localVideoTrack.setEnabled(false);
    } else {
      await localVideoTrack.setEnabled(true);
    }
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = async () => {
    if (!localAudioTrack) return;

    if (isAudioEnabled) {
      await localAudioTrack.setEnabled(false);
    } else {
      await localAudioTrack.setEnabled(true);
    }
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleSpeaker = () => {
    // In a real implementation, this would control the audio output device
    // For now, we'll just toggle the state
    setIsSpeakerEnabled(!isSpeakerEnabled);

    // Mute/unmute all remote audio tracks
    remoteUsers.forEach((user) => {
      if (user.audioTrack) {
        user.audioTrack.setVolume(isSpeakerEnabled ? 0 : 100);
      }
    });
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <div className="text-red-600 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="font-medium">Lỗi kết nối video</h3>
        </div>
        <p className="text-sm text-red-600">{error}</p>
        <div className="mt-4 flex justify-center space-x-3">
          <Button
            variant="primary"
            onClick={() => {
              setError(null);
              setIsLoading(true);
              setRetryCount(0);
              setTimeout(() => joinChannel(), 1000);
            }}
          >
            Thử lại
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (onCallEnd) onCallEnd(false); // Pass false to indicate call failed
            }}
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-pulse">
          <VideoCameraIcon className="h-12 w-12 text-blue-500" />
        </div>
        <p className="mt-4 text-gray-600">Đang kết nối cuộc gọi video...</p>
        {retryCount > 0 && (
          <p className="mt-2 text-sm text-gray-500">
            Đang thử kết nối lại (lần {retryCount}/2)...
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="video-call-container">
      {/* Video grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Local video */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <div
            ref={localVideoRef}
            id="local-video"
            className="w-full h-full"
          ></div>
          <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-60 text-white px-2 py-1 rounded text-sm">
            Bạn {!isVideoEnabled && "(Video đã tắt)"}
          </div>
        </div>

        {/* Remote videos */}
        {remoteUsers.length > 0 ? (
          remoteUsers.map((user) => (
            <div
              key={user.uid}
              className="relative bg-black rounded-lg overflow-hidden aspect-video"
            >
              <div
                id={`remote-video-${user.uid}`}
                className="w-full h-full"
              ></div>
              <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-60 text-white px-2 py-1 rounded text-sm">
                {role === "DOCTOR" ? "Bệnh nhân" : "Bác sĩ"}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center bg-gray-800 rounded-lg aspect-video">
            <div className="text-center text-gray-400">
              <VideoCameraIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              {role === "CUSTOMER" ? (
                <>
                  <p className="text-lg font-medium text-blue-400">
                    Đang chờ bác sĩ tham gia...
                  </p>
                  <p className="text-sm mt-2 max-w-xs mx-auto">
                    Bác sĩ sẽ sớm tham gia cuộc gọi. Vui lòng giữ kết nối và
                    không thoát khỏi cuộc gọi.
                  </p>
                </>
              ) : (
                <>
                  <p>Đang chờ bệnh nhân tham gia...</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4 mt-4">
        <Button
          variant="outline"
          className={`rounded-full p-4 ${
            isVideoEnabled ? "bg-gray-700" : "bg-red-600"
          } text-white`}
          onClick={toggleVideo}
        >
          {isVideoEnabled ? (
            <VideoCameraIcon className="h-6 w-6" />
          ) : (
            <VideoCameraSlashIcon className="h-6 w-6" />
          )}
        </Button>
        <Button
          variant="outline"
          className={`rounded-full p-4 ${
            isAudioEnabled ? "bg-gray-700" : "bg-red-600"
          } text-white`}
          onClick={toggleAudio}
        >
          {isAudioEnabled ? (
            <MicrophoneIcon className="h-6 w-6" />
          ) : (
            <div className="relative">
              <MicrophoneIcon className="h-6 w-6" />
              <XMarkIcon className="h-4 w-4 absolute -bottom-1 -right-1 text-red-500" />
            </div>
          )}
        </Button>
        <Button
          variant="outline"
          className={`rounded-full p-4 ${
            isSpeakerEnabled ? "bg-gray-700" : "bg-red-600"
          } text-white`}
          onClick={toggleSpeaker}
        >
          {isSpeakerEnabled ? (
            <SpeakerWaveIcon className="h-6 w-6" />
          ) : (
            <SpeakerXMarkIcon className="h-6 w-6" />
          )}
        </Button>
        <Button
          variant="danger"
          className="rounded-full p-4 bg-red-600 hover:bg-red-700"
          onClick={leaveChannel}
        >
          <PhoneIcon className="h-6 w-6 transform rotate-135" />
        </Button>
      </div>
    </div>
  );
};

export default VideoCallComponent;
