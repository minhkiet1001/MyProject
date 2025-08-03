import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { UserRole } from "../../types/index.js";
import staffLabService from "../../services/staffLabService";
import authService from "../../services/authService";
import LabTestResultForm from "../../components/staff/LabTestResultForm";
import {
  UserIcon,
  ExclamationCircleIcon,
  BeakerIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [pendingLabRequests, setPendingLabRequests] = useState([]);
  const [myLabRequests, setMyLabRequests] = useState([]);
  const [rejectedLabRequests, setRejectedLabRequests] = useState([]); // Add rejected lab requests state
  const [isLoading, setIsLoading] = useState(false);
  const [isPendingLoading, setIsPendingLoading] = useState(false);
  const [isMyRequestsLoading, setIsMyRequestsLoading] = useState(false);
  const [isRejectedLoading, setIsRejectedLoading] = useState(false); // Add loading state for rejected requests
  const [error, setError] = useState(null);
  const [currentStaffId, setCurrentStaffId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showTestResultModal, setShowTestResultModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60000); // 60 seconds

  // Load data from localStorage and fetch from API on initial render
  useEffect(() => {
    // Get current user info
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setCurrentStaffId(currentUser.id);

      // Clear any previous staff's lab requests from localStorage
      const storedStaffId = localStorage.getItem("currentStaffId");
      if (storedStaffId !== currentUser.id.toString()) {
        localStorage.removeItem("staffPendingLabRequests");
        localStorage.removeItem("staffMyLabRequests");
        localStorage.removeItem("staffCompletedLabRequests"); // Clear completed requests
        localStorage.removeItem("staffRejectedLabRequests"); // Clear rejected requests
        localStorage.setItem("currentStaffId", currentUser.id.toString());
      } else {
        // Only load from localStorage if it's the same staff - temporary state while API loads
        const savedPendingRequests = localStorage.getItem(
          "staffPendingLabRequests"
        );
        const savedMyRequests = localStorage.getItem("staffMyLabRequests");
        const savedRejectedRequests = localStorage.getItem(
          "staffRejectedLabRequests"
        );

        if (savedPendingRequests) {
          try {
            setPendingLabRequests(JSON.parse(savedPendingRequests));
          } catch (err) {
            console.error("Error parsing saved pending lab requests:", err);
          }
        }

        if (savedMyRequests) {
          try {
            setMyLabRequests(JSON.parse(savedMyRequests));
          } catch (err) {
            console.error("Error parsing saved my lab requests:", err);
          }
        }

        if (savedRejectedRequests) {
          try {
            setRejectedLabRequests(JSON.parse(savedRejectedRequests));
          } catch (err) {
            console.error("Error parsing saved rejected lab requests:", err);
          }
        }
      }
    }

    // Khôi phục cài đặt auto refresh từ localStorage
    const savedAutoRefresh = localStorage.getItem("staffDashboardAutoRefresh");
    if (savedAutoRefresh !== null) {
      setAutoRefresh(JSON.parse(savedAutoRefresh));
    }

    // Always fetch fresh data from API on component mount
    fetchAllLabRequests();

    // Register a listener for visibility changes to refresh data when tab becomes active
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAllLabRequests();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Save pendingLabRequests to localStorage whenever it changes
  useEffect(() => {
    if (currentStaffId) {
      // Always save, even if empty
      localStorage.setItem(
        "staffPendingLabRequests",
        JSON.stringify(pendingLabRequests)
      );
    }
  }, [pendingLabRequests, currentStaffId]);

  // Save myLabRequests to localStorage whenever it changes
  useEffect(() => {
    if (currentStaffId) {
      // Always save, even if empty
      localStorage.setItem("staffMyLabRequests", JSON.stringify(myLabRequests));
    }
  }, [myLabRequests, currentStaffId]);

  // Save rejectedLabRequests to localStorage whenever it changes
  useEffect(() => {
    if (currentStaffId) {
      // Always save, even if empty
      localStorage.setItem(
        "staffRejectedLabRequests",
        JSON.stringify(rejectedLabRequests)
      );
    }
  }, [rejectedLabRequests, currentStaffId]);

  // Listen for test result submission and rejected lab request updates
  useEffect(() => {
    const handleStorageEvent = (event) => {
      if (event.key === "testResultSubmitted") {
        const requestId = parseInt(event.newValue);
        if (!isNaN(requestId)) {
          handleTestResultSubmitted(requestId);
        }
      } else if (
        event.key === "labRequestRejected" ||
        event.key === "labRequestStatusChanged"
      ) {
        // Refresh all lab requests when a request is rejected or status changes
        fetchAllLabRequests();
      }
    };

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, [myLabRequests]);

  // Set up auto refresh
  useEffect(() => {
    localStorage.setItem(
      "staffDashboardAutoRefresh",
      JSON.stringify(autoRefresh)
    );

    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchAllLabRequests();
      }, refreshInterval);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, refreshInterval]);

  const fetchAllLabRequests = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchPendingLabRequests(),
      fetchMyLabRequests(),
      fetchRejectedLabRequests(),
    ]);
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  // Add fetch function for rejected lab requests
  const fetchRejectedLabRequests = async () => {
    if (!currentStaffId) return;

    try {
      setIsRejectedLoading(true);

      // Fetch rejected requests
      const rejectedResponse =
        await staffLabService.getStaffRejectedLabRequests(currentStaffId);
      if (rejectedResponse.success) {
        console.log("Rejected lab requests data:", rejectedResponse.data);
        setRejectedLabRequests(rejectedResponse.data || []);
      } else {
        console.error(
          "Failed to fetch rejected requests:",
          rejectedResponse.message
        );
      }
    } catch (err) {
      console.error("Error fetching rejected lab requests:", err);
    } finally {
      setIsRejectedLoading(false);
    }
  };

  const fetchPendingLabRequests = async () => {
    try {
      setIsPendingLoading(true);
      setError(null);

      // Fetch pending requests
      const pendingResponse = await staffLabService.getPendingLabRequests();
      if (pendingResponse.success) {
        console.log("Pending lab requests data:", pendingResponse.data);
        setPendingLabRequests(pendingResponse.data || []);
      } else {
        console.error(
          "Failed to fetch pending requests:",
          pendingResponse.message
        );
        setError(
          "Failed to fetch pending requests: " + pendingResponse.message
        );
      }
    } catch (err) {
      setError(`Error loading pending lab requests: ${err.message}`);
      console.error("Error fetching pending lab requests:", err);
    } finally {
      setIsPendingLoading(false);
    }
  };

  const fetchMyLabRequests = async () => {
    if (!currentStaffId) return;

    try {
      setIsMyRequestsLoading(true);

      // Fetch assigned requests
      const myResponse = await staffLabService.getStaffLabRequests(
        currentStaffId
      );
      if (myResponse.success) {
        console.log("My lab requests data:", myResponse.data);
        // Set the lab requests directly from the API response
        setMyLabRequests(myResponse.data || []);
      } else {
        console.error("Failed to fetch assigned requests:", myResponse.message);
      }
    } catch (err) {
      console.error("Error fetching assigned lab requests:", err);
    } finally {
      setIsMyRequestsLoading(false);
    }
  };

  const handleAssignRequest = async (requestId) => {
    if (!currentStaffId) {
      setError("Staff ID not available. Please log in again.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await staffLabService.assignLabRequest(
        requestId,
        currentStaffId
      );

      if (response.success) {
        // Update local state
        const updatedRequest = response.data;
        setPendingLabRequests((prevRequests) =>
          prevRequests.filter((req) => req.id !== requestId)
        );
        setMyLabRequests((prevRequests) => [...prevRequests, updatedRequest]);

        // Trigger status change event
        localStorage.setItem(
          "labRequestStatusChanged",
          new Date().getTime().toString()
        );

        // Refresh all data to ensure consistency
        fetchAllLabRequests();
      } else {
        setError(`Failed to assign request: ${response.message}`);
      }
    } catch (err) {
      setError(`Error assigning request: ${err.message}`);
      console.error("Error assigning lab request:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle test result submission and remove from localStorage
  const handleTestResultSubmitted = (requestId) => {
    // Find the completed request
    const completedRequest = myLabRequests.find((req) => req.id === requestId);

    // Remove the completed request from myLabRequests
    const updatedRequests = myLabRequests.filter((req) => req.id !== requestId);
    setMyLabRequests(updatedRequests);

    // Update localStorage
    localStorage.setItem("staffMyLabRequests", JSON.stringify(updatedRequests));

    // If we found the completed request, we should move it to completed requests
    if (completedRequest) {
      const completedRequestWithStatus = {
        ...completedRequest,
        status: "COMPLETED",
      };

      // Get existing completed requests from localStorage
      let completedRequests = [];
      try {
        const savedCompletedRequests = localStorage.getItem(
          "staffCompletedLabRequests"
        );
        if (savedCompletedRequests) {
          completedRequests = JSON.parse(savedCompletedRequests);
        }
      } catch (err) {
        console.error("Error parsing saved completed requests:", err);
      }

      // Add the new completed request and save back to localStorage
      completedRequests = [completedRequestWithStatus, ...completedRequests];
      localStorage.setItem(
        "staffCompletedLabRequests",
        JSON.stringify(completedRequests)
      );
    }
  };

  const handleReactivateRequest = async (requestId) => {
    try {
      setIsLoading(true);

      // First, get the previous lab results
      const previousResultsResponse =
        await staffLabService.getPreviousLabResults(requestId);

      if (previousResultsResponse.success) {
        // Find the rejected request
        const rejectedRequest = rejectedLabRequests.find(
          (req) => req.id === requestId
        );

        if (rejectedRequest) {
          // Set the selected request with the previous results
          setSelectedRequest({
            ...rejectedRequest,
            previousResults: previousResultsResponse.data || [],
          });

          // Show the test result form directly
          setShowTestResultModal(true);

          // Trigger status change event
          localStorage.setItem(
            "labRequestStatusChanged",
            new Date().getTime().toString()
          );
        } else {
          setError("Rejected request not found");
        }
      } else {
        // If we can't get previous results, just reactivate the request
        const response = await staffLabService.reactivateLabRequest(requestId);

        if (response.success) {
          // Find the rejected request
          const rejectedRequest = rejectedLabRequests.find(
            (req) => req.id === requestId
          );

          // Update local state - remove from rejected and add to my requests
          setRejectedLabRequests(
            rejectedLabRequests.filter((req) => req.id !== requestId)
          );

          if (rejectedRequest) {
            const reactivatedRequest = {
              ...rejectedRequest,
              status: "IN_PROGRESS",
            };
            setMyLabRequests([...myLabRequests, reactivatedRequest]);
          }

          // Update localStorage
          const updatedRejectedRequests = rejectedLabRequests.filter(
            (req) => req.id !== requestId
          );
          localStorage.setItem(
            "staffRejectedLabRequests",
            JSON.stringify(updatedRejectedRequests)
          );

          if (rejectedRequest) {
            const updatedMyRequests = [
              ...myLabRequests,
              { ...rejectedRequest, status: "IN_PROGRESS" },
            ];
            localStorage.setItem(
              "staffMyLabRequests",
              JSON.stringify(updatedMyRequests)
            );
          }

          // Trigger status change event
          localStorage.setItem(
            "labRequestStatusChanged",
            new Date().getTime().toString()
          );

          // Show success message
          alert("Yêu cầu xét nghiệm đã được kích hoạt lại thành công!");

          // Refresh all data to ensure consistency
          fetchAllLabRequests();
        } else {
          setError(`Failed to reactivate request: ${response.message}`);
        }
      }
    } catch (err) {
      setError(`Error reactivating request: ${err.message}`);
      console.error("Error reactivating lab request:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenTestResultForm = (request) => {
    // Set the selected request and show the modal
    setSelectedRequest(request);
    setShowTestResultModal(true);
  };

  const handleSubmitTestResult = async (data) => {
    try {
      setIsLoading(true);
      const response = await staffLabService.submitTestResults(
        data.labRequestId,
        data.results
      );

      if (response.success) {
        // Update local state - remove completed request from my requests
        setMyLabRequests(
          myLabRequests.filter((req) => req.id !== data.labRequestId)
        );

        // Update localStorage
        const updatedRequests = myLabRequests.filter(
          (req) => req.id !== data.labRequestId
        );
        localStorage.setItem(
          "staffMyLabRequests",
          JSON.stringify(updatedRequests)
        );

        // Trigger events for other components
        localStorage.setItem("testResultSubmitted", data.labRequestId);
        localStorage.setItem(
          "labRequestStatusChanged",
          new Date().getTime().toString()
        );

        setShowTestResultModal(false);
        // Show success message
        alert("Kết quả xét nghiệm đã được lưu thành công!");

        // Refresh all data to ensure consistency
        fetchAllLabRequests();
      } else {
        setError(`Failed to submit test results: ${response.message}`);
      }
    } catch (err) {
      setError(`Error submitting test results: ${err.message}`);
      console.error("Error submitting test results:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle auto refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  // Format last updated time
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Tính số lượng yêu cầu theo loại dịch vụ
  const getServiceStats = (requests) => {
    const stats = {};
    requests.forEach((req) => {
      const service = req.serviceName || "Không xác định";
      stats[service] = (stats[service] || 0) + 1;
    });
    return stats;
  };

  // Render lab request card
  const renderLabRequestCard = (
    request,
    canAssign = false,
    isRejected = false
  ) => {
    const isBloodSampleRequested = request.bloodSampleRequested;
    // Sử dụng requestedAt thay vì createdAt để hiển thị ngày yêu cầu từ database
    const requestDate = request.requestedAt
      ? new Date(request.requestedAt)
      : request.createdAt
      ? new Date(request.createdAt)
      : new Date();

    // Format ngày giờ chi tiết hơn
    const formattedDate = requestDate.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const formattedTime = requestDate.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div
        key={request.id}
        className="bg-white rounded-lg shadow-sm p-4 mb-3 border border-gray-200 hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex flex-col space-y-3">
          {/* Patient info header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <UserIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800">
                  {request.patientName || "Unknown Patient"}
                </h3>
                <p className="text-sm text-gray-500">
                  {request.patientGender || "?"}, {request.patientAge || "?"}{" "}
                  tuổi
                </p>
              </div>
            </div>

            <div className="flex items-center">
              {isBloodSampleRequested ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 mr-2">
                  <ExclamationCircleIcon className="h-3.5 w-3.5 mr-1" />
                  Yêu cầu mẫu máu
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 mr-2">
                  <CheckCircleIcon className="h-3.5 w-3.5 mr-1 text-gray-600" />
                  Không yêu cầu mẫu máu
                </span>
              )}

              {isRejected && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                  <XCircleIcon className="h-3.5 w-3.5 mr-1" />
                  Đã bị từ chối
                </span>
              )}
            </div>
          </div>

          {/* Request details */}
          <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
            <div className="flex items-start">
              <ClockIcon className="h-4 w-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-700">Ngày yêu cầu:</p>
                <p className="text-gray-600">
                  {formattedDate} {formattedTime}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <BeakerIcon className="h-4 w-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-700">Dịch vụ:</p>
                <p className="text-gray-600">{request.serviceName || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Additional details */}
          <div className="grid grid-cols-1 gap-2 mt-1 text-sm">
            {request.bloodPressure && (
              <div className="flex items-start">
                <ClipboardDocumentIcon className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-700">Huyết áp:</p>
                  <p className="text-gray-600">{request.bloodPressure}</p>
                </div>
              </div>
            )}

            {request.symptoms && (
              <div className="flex items-start">
                <ExclamationCircleIcon className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-700">Triệu chứng:</p>
                  <p className="text-gray-600">{request.symptoms}</p>
                </div>
              </div>
            )}

            {request.medicalHistory && (
              <div className="flex items-start">
                <ClipboardDocumentIcon className="h-4 w-4 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-700">Tiền sử:</p>
                  <p className="text-gray-600">{request.medicalHistory}</p>
                </div>
              </div>
            )}

            {isRejected && request.notes && (
              <div className="flex items-start">
                <XCircleIcon className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-700">Lý do từ chối:</p>
                  <p className="text-red-600">{request.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="flex justify-end mt-2 pt-2 border-t border-gray-100">
            {canAssign ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAssignRequest(request.id)}
                disabled={isLoading}
                className="font-medium text-sm px-4 py-1.5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <ClipboardDocumentIcon className="h-4 w-4 mr-1.5" />
                Nhận xử lý
              </Button>
            ) : isRejected ? (
              <Button
                variant="warning"
                size="sm"
                onClick={() => handleReactivateRequest(request.id)}
                disabled={isLoading}
                className="font-medium text-sm px-4 py-1.5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                Nhập lại kết quả
              </Button>
            ) : (
              <Button
                variant="success"
                size="sm"
                onClick={() => handleOpenTestResultForm(request)}
                className="font-medium text-sm px-4 py-1.5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <BeakerIcon className="h-4 w-4 mr-1.5" />
                Nhập kết quả
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render service stats
  const renderServiceStats = (requests) => {
    const stats = getServiceStats(requests);
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(stats).map(([service, count]) => (
          <div
            key={service}
            className="bg-white rounded-md px-3 py-2 border border-indigo-100 flex items-center shadow-sm"
          >
            <div className="bg-indigo-50 p-1.5 rounded-full mr-2">
              <DocumentTextIcon className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <span className="font-medium text-gray-700 text-sm">
                {service}
              </span>
              <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {count}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout currentRole={UserRole.STAFF}>
      {/* Sử dụng toàn bộ màn hình có sẵn */}
      <div className="p-3 w-full h-full">
        {/* Dashboard Header */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-2 rounded-full mr-3">
                <ChartBarIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Quản lý Yêu Cầu Xét Nghiệm
                </h1>
                <p className="text-sm text-gray-500">
                  Quản lý và xử lý các yêu cầu xét nghiệm từ bác sĩ
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 flex items-center">
                <ClockIcon className="h-4 w-4 text-gray-500 mr-1.5" />
                <span className="text-gray-600">
                  Cập nhật lúc:{" "}
                  <span className="font-medium">{formatLastUpdated()}</span>
                </span>
              </div>
              <Button
                variant={autoRefresh ? "primary" : "outline"}
                size="sm"
                onClick={toggleAutoRefresh}
                className={`flex items-center ${
                  autoRefresh
                    ? "bg-indigo-600"
                    : "border-indigo-300 text-indigo-700"
                }`}
              >
                <ArrowPathIcon
                  className={`h-4 w-4 mr-1.5 ${
                    autoRefresh ? "animate-spin" : ""
                  }`}
                />
                {autoRefresh ? "Tự động cập nhật" : "Cập nhật thủ công"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllLabRequests}
                disabled={isLoading}
                className="flex items-center border-gray-300"
              >
                <ArrowPathIcon
                  className={`h-4 w-4 mr-1.5 ${
                    isLoading ? "animate-spin" : ""
                  }`}
                />
                Làm mới
              </Button>
            </div>
          </div>
        </div>

        {/* Lab Requests Sections - 3 columns for larger screens */}
        <div className="flex flex-col space-y-4">
          {/* Header row with section titles */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Pending Lab Requests Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border border-blue-100 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center text-blue-800">
                  <div className="bg-blue-100 p-1.5 rounded-full mr-2">
                    <ClipboardDocumentIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  Yêu cầu chờ xử lý
                  <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingLabRequests.length}
                  </span>
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchPendingLabRequests}
                  disabled={isPendingLoading}
                  className="flex items-center border border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <ArrowPathIcon
                    className={`h-4 w-4 mr-1 ${
                      isPendingLoading ? "animate-spin" : ""
                    }`}
                  />
                  Làm mới
                </Button>
              </div>
            </div>

            {/* My Lab Requests Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 border border-green-100 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center text-green-800">
                  <div className="bg-green-100 p-1.5 rounded-full mr-2">
                    <BeakerIcon className="h-5 w-5 text-green-600" />
                  </div>
                  Yêu cầu của tôi
                  <span className="ml-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {myLabRequests.length}
                  </span>
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchMyLabRequests}
                  disabled={isMyRequestsLoading}
                  className="flex items-center border border-green-300 text-green-700 hover:bg-green-50"
                >
                  <ArrowPathIcon
                    className={`h-4 w-4 mr-1 ${
                      isMyRequestsLoading ? "animate-spin" : ""
                    }`}
                  />
                  Làm mới
                </Button>
              </div>
            </div>

            {/* Rejected Lab Requests Header */}
            <div className="bg-gradient-to-r from-red-50 to-rose-50 p-3 border border-red-100 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center text-red-800">
                  <div className="bg-red-100 p-1.5 rounded-full mr-2">
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                  </div>
                  Yêu cầu bị từ chối
                  <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {rejectedLabRequests.length}
                  </span>
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchRejectedLabRequests}
                  disabled={isRejectedLoading}
                  className="flex items-center border border-red-300 text-red-700 hover:bg-red-50"
                >
                  <ArrowPathIcon
                    className={`h-4 w-4 mr-1 ${
                      isRejectedLoading ? "animate-spin" : ""
                    }`}
                  />
                  Làm mới
                </Button>
              </div>
            </div>
          </div>

          {/* Content row with request cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Pending Lab Requests Content */}
            <div className="bg-white p-4 border border-blue-100 rounded-lg shadow-sm">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-3 text-sm flex items-center">
                  <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              {/* Hiển thị thống kê dịch vụ */}
              {pendingLabRequests.length > 0 &&
                renderServiceStats(pendingLabRequests)}

              {isPendingLoading ? (
                <div className="text-center py-6">
                  <ArrowPathIcon className="h-8 w-8 mx-auto animate-spin text-blue-500" />
                  <p className="mt-3 text-gray-600 text-sm">
                    Đang tải dữ liệu...
                  </p>
                </div>
              ) : pendingLabRequests.length > 0 ? (
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
                  {pendingLabRequests.map((request) =>
                    renderLabRequestCard(request, true)
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-md p-6 text-center border border-gray-100">
                  <ClipboardDocumentIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 text-base font-medium">
                    Không có yêu cầu chờ xử lý
                  </p>
                </div>
              )}
            </div>

            {/* My Lab Requests Content */}
            <div className="bg-white p-4 border border-green-100 rounded-lg shadow-sm">
              {/* Hiển thị thống kê dịch vụ */}
              {myLabRequests.length > 0 && renderServiceStats(myLabRequests)}

              {isMyRequestsLoading ? (
                <div className="text-center py-6">
                  <ArrowPathIcon className="h-8 w-8 mx-auto animate-spin text-green-500" />
                  <p className="mt-3 text-gray-600 text-sm">
                    Đang tải dữ liệu...
                  </p>
                </div>
              ) : myLabRequests.length > 0 ? (
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
                  {myLabRequests.map((request) =>
                    renderLabRequestCard(request, false)
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-md p-6 text-center border border-gray-100">
                  <BeakerIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 text-base font-medium">
                    Chưa có yêu cầu đang xử lý
                  </p>
                </div>
              )}
            </div>

            {/* Rejected Lab Requests Content */}
            <div className="bg-white p-4 border border-red-100 rounded-lg shadow-sm">
              {/* Hiển thị thống kê dịch vụ */}
              {rejectedLabRequests.length > 0 &&
                renderServiceStats(rejectedLabRequests)}

              {isRejectedLoading ? (
                <div className="text-center py-6">
                  <ArrowPathIcon className="h-8 w-8 mx-auto animate-spin text-red-500" />
                  <p className="mt-3 text-gray-600 text-sm">
                    Đang tải dữ liệu...
                  </p>
                </div>
              ) : rejectedLabRequests.length > 0 ? (
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
                  {rejectedLabRequests.map((request) =>
                    renderLabRequestCard(request, false, true)
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-md p-6 text-center border border-gray-100">
                  <XCircleIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 text-base font-medium">
                    Không có yêu cầu bị từ chối
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lab Test Result Form Modal */}
        <LabTestResultForm
          isOpen={showTestResultModal}
          onClose={() => setShowTestResultModal(false)}
          labRequest={selectedRequest}
          onSubmit={handleSubmitTestResult}
        />
      </div>
    </Layout>
  );
};

export default DashboardPage;
