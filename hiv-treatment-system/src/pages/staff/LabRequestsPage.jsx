import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { UserRole } from "../../types";
import staffLabService from "../../services/staffLabService";
import authService from "../../services/authService";
import Button from "../../components/common/Button";
import LabTestResultForm from "../../components/staff/LabTestResultForm";
import {
  BeakerIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  UserIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const LabRequestsPage = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStaffId, setCurrentStaffId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showTestResultModal, setShowTestResultModal] = useState(false);

  // Initialize with current user info and fetch data
  useEffect(() => {
    // Get current user info
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setCurrentStaffId(currentUser.id);

      // Clear any previous staff's lab requests from localStorage
      const storedStaffId = localStorage.getItem("currentStaffId");
      if (storedStaffId !== currentUser.id.toString()) {
        localStorage.removeItem("staffMyLabRequests");
        localStorage.removeItem("staffCompletedLabRequests");
        localStorage.removeItem("staffRejectedLabRequests");
        localStorage.setItem("currentStaffId", currentUser.id.toString());
      } else {
        // Only load from localStorage if it's the same staff
        // We'll use this as a temporary state before API requests complete
        const savedMyRequests = localStorage.getItem("staffMyLabRequests");
        if (savedMyRequests) {
          try {
            setMyRequests(JSON.parse(savedMyRequests));
          } catch (err) {
            console.error("Error parsing saved lab requests:", err);
          }
        }

        const savedCompletedRequests = localStorage.getItem(
          "staffCompletedLabRequests"
        );
        if (savedCompletedRequests) {
          try {
            setCompletedRequests(JSON.parse(savedCompletedRequests));
          } catch (err) {
            console.error("Error parsing saved completed lab requests:", err);
          }
        }

        const savedRejectedRequests = localStorage.getItem(
          "staffRejectedLabRequests"
        );
        if (savedRejectedRequests) {
          try {
            setRejectedRequests(JSON.parse(savedRejectedRequests));
          } catch (err) {
            console.error("Error parsing saved rejected lab requests:", err);
          }
        }
      }
    }

    // Always fetch fresh data on component mount
    fetchLabRequests();
  }, []);

  // Save requests to localStorage whenever they change
  useEffect(() => {
    if (currentStaffId) {
      // Always save the current state, even if empty
      localStorage.setItem("staffMyLabRequests", JSON.stringify(myRequests));
      localStorage.setItem(
        "staffCompletedLabRequests",
        JSON.stringify(completedRequests)
      );
      localStorage.setItem(
        "staffRejectedLabRequests",
        JSON.stringify(rejectedRequests)
      );
    }
  }, [myRequests, completedRequests, rejectedRequests, currentStaffId]);

  // Listen for test result submission events
  useEffect(() => {
    const handleStorageEvent = (event) => {
      if (event.key === "testResultSubmitted") {
        const requestId = parseInt(event.newValue);
        if (!isNaN(requestId)) {
          // Find the completed request
          const completedRequest = myRequests.find(
            (req) => req.id === requestId
          );

          // Remove the completed request from myRequests
          setMyRequests((prev) => prev.filter((req) => req.id !== requestId));

          // Add it to completedRequests if found
          if (completedRequest) {
            setCompletedRequests((prev) => [
              { ...completedRequest, status: "COMPLETED" },
              ...prev,
            ]);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, [myRequests]);

  const fetchLabRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user info if not already set
      let staffId = currentStaffId;
      if (!staffId) {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          staffId = currentUser.id;
          setCurrentStaffId(staffId);
        } else {
          setError(
            "Không thể xác định thông tin nhân viên. Vui lòng đăng nhập lại."
          );
          setIsLoading(false);
          return;
        }
      }

      // Fetch pending requests
      const pendingResponse = await staffLabService.getPendingLabRequests();
      if (pendingResponse.success) {
        setPendingRequests(pendingResponse.data || []);
      } else {
        console.error(
          "Failed to fetch pending requests:",
          pendingResponse.message
        );
      }

      // Fetch assigned requests for the current staff
      const myResponse = await staffLabService.getStaffLabRequests(staffId);
      if (myResponse.success) {
        // Filter to only include in-progress requests
        const inProgress = (myResponse.data || []).filter(
          (request) =>
            request.status !== "COMPLETED" && request.status !== "REJECTED"
        );

        setMyRequests(inProgress);
      } else {
        console.error("Failed to fetch assigned requests:", myResponse.message);
      }

      // Fetch completed requests
      const completedResponse =
        await staffLabService.getStaffCompletedLabRequests(staffId);
      if (completedResponse.success) {
        setCompletedRequests(completedResponse.data || []);
        // Update localStorage
        localStorage.setItem(
          "staffCompletedLabRequests",
          JSON.stringify(completedResponse.data || [])
        );
      } else {
        console.error(
          "Failed to fetch completed requests:",
          completedResponse.message
        );
      }

      // Fetch rejected requests for the current staff
      const rejectedResponse =
        await staffLabService.getStaffRejectedLabRequests(staffId);
      if (rejectedResponse.success) {
        setRejectedRequests(rejectedResponse.data || []);
      } else {
        console.error(
          "Failed to fetch rejected requests:",
          rejectedResponse.message
        );
      }
    } catch (err) {
      setError(`Error loading lab requests: ${err.message}`);
      console.error("Error fetching lab requests:", err);
    } finally {
      setIsLoading(false);
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
        setPendingRequests(
          pendingRequests.filter((req) => req.id !== requestId)
        );
        setMyRequests([...myRequests, updatedRequest]);
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

  const handleOpenTestResultForm = (request) => {
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
        // Find the completed request
        const completedRequest = myRequests.find(
          (req) => req.id === data.labRequestId
        );

        // Update local state - remove completed request from my requests
        const updatedMyRequests = myRequests.filter(
          (req) => req.id !== data.labRequestId
        );
        setMyRequests(updatedMyRequests);

        // Add to completed requests
        if (completedRequest) {
          const updatedCompletedRequest = {
            ...completedRequest,
            status: "COMPLETED",
            completedAt: new Date().toISOString(),
          };

          const updatedCompletedRequests = [
            updatedCompletedRequest,
            ...completedRequests,
          ];

          setCompletedRequests(updatedCompletedRequests);

          // Update localStorage
          localStorage.setItem(
            "staffMyLabRequests",
            JSON.stringify(updatedMyRequests)
          );
          localStorage.setItem(
            "staffCompletedLabRequests",
            JSON.stringify(updatedCompletedRequests)
          );
        }

        // Trigger event for other components
        localStorage.setItem("testResultSubmitted", data.labRequestId);

        setShowTestResultModal(false);

        // Re-fetch completed requests to ensure we have the latest data
        if (currentStaffId) {
          const completedResponse =
            await staffLabService.getStaffCompletedLabRequests(currentStaffId);
          if (completedResponse.success) {
            setCompletedRequests(completedResponse.data || []);
            localStorage.setItem(
              "staffCompletedLabRequests",
              JSON.stringify(completedResponse.data || [])
            );
          }
        }

        // Show success message
        alert("Kết quả xét nghiệm đã được lưu thành công!");
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

  const handleReactivateRequest = async (requestId) => {
    try {
      setIsLoading(true);

      // First, get the previous lab results
      const previousResultsResponse =
        await staffLabService.getPreviousLabResults(requestId);

      if (previousResultsResponse.success) {
        // Find the rejected request
        const rejectedRequest = rejectedRequests.find(
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
        } else {
          setError("Rejected request not found");
        }
      } else {
        // If we can't get previous results, just reactivate the request
        const response = await staffLabService.reactivateLabRequest(requestId);

        if (response.success) {
          // Find the rejected request
          const rejectedRequest = rejectedRequests.find(
            (req) => req.id === requestId
          );

          // Update local state - remove from rejected and add to my requests
          setRejectedRequests(
            rejectedRequests.filter((req) => req.id !== requestId)
          );

          if (rejectedRequest) {
            const reactivatedRequest = {
              ...rejectedRequest,
              status: "IN_PROGRESS",
            };
            setMyRequests([...myRequests, reactivatedRequest]);
          }

          // Update localStorage
          const updatedRejectedRequests = rejectedRequests.filter(
            (req) => req.id !== requestId
          );
          localStorage.setItem(
            "staffRejectedLabRequests",
            JSON.stringify(updatedRejectedRequests)
          );

          if (rejectedRequest) {
            const updatedMyRequests = [
              ...myRequests,
              { ...rejectedRequest, status: "IN_PROGRESS" },
            ];
            localStorage.setItem(
              "staffMyLabRequests",
              JSON.stringify(updatedMyRequests)
            );
          }

          // Show success message
          alert("Yêu cầu xét nghiệm đã được kích hoạt lại thành công!");
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

  const renderLabRequestCard = (
    request,
    canAssign = false,
    isCompleted = false,
    isRejected = false
  ) => {
    const isBloodSampleRequested = request.bloodSampleRequested;

    return (
      <div key={request.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
              {request.patientName || "Unknown Patient"}
              <span className="ml-2 text-sm text-gray-500">
                ({request.patientGender || "?"}, {request.patientAge || "?"}{" "}
                tuổi)
              </span>
            </h3>
            <p className="text-gray-600 mt-1">
              <span className="font-medium">Dịch vụ:</span>{" "}
              {request.serviceName || "N/A"}
            </p>
            {request.bloodPressure && (
              <p className="text-gray-600">
                <span className="font-medium">Huyết áp:</span>{" "}
                {request.bloodPressure}
              </p>
            )}
            {request.symptoms && (
              <p className="text-gray-600 mt-1">
                <span className="font-medium">Triệu chứng hiện tại:</span>{" "}
                {request.symptoms}
              </p>
            )}
            {request.medicalHistory && (
              <p className="text-gray-600 mt-1">
                <span className="font-medium">Tiền sử bệnh:</span>{" "}
                {request.medicalHistory}
              </p>
            )}
            <div className="mt-2 flex items-center">
              {isBloodSampleRequested ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                  Yêu cầu lấy mẫu máu
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Không yêu cầu mẫu máu
                </span>
              )}

              {isCompleted && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Đã hoàn thành
                </span>
              )}

              {isRejected && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  Đã bị từ chối
                </span>
              )}
            </div>
            {request.notes && (
              <p className="text-gray-600 mt-2">
                <span className="font-medium">Ghi chú:</span> {request.notes}
              </p>
            )}
            {request.completedAt && (
              <p className="text-gray-600 mt-2">
                <span className="font-medium">Hoàn thành lúc:</span>{" "}
                {new Date(request.completedAt).toLocaleString("vi-VN")}
              </p>
            )}
            {isRejected && request.notes && (
              <p className="text-gray-600 mt-2 text-red-600">
                <span className="font-medium">Lý do từ chối:</span>{" "}
                {request.notes}
              </p>
            )}
          </div>
          <div>
            {canAssign ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAssignRequest(request.id)}
                disabled={isLoading}
              >
                <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                Nhận xử lý
              </Button>
            ) : isRejected ? (
              <Button
                variant="warning"
                size="sm"
                onClick={() => handleReactivateRequest(request.id)}
                disabled={isLoading}
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Nhập lại kết quả
              </Button>
            ) : !isCompleted ? (
              <Button
                variant="success"
                size="sm"
                onClick={() => handleOpenTestResultForm(request)}
                disabled={isLoading}
              >
                <BeakerIcon className="h-4 w-4 mr-1" />
                Nhập kết quả
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout currentRole={UserRole.STAFF} pageTitle="Yêu cầu xét nghiệm">
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Yêu cầu xét nghiệm
          </h1>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchLabRequests}
            disabled={isLoading}
          >
            <ArrowPathIcon className="h-5 w-5 mr-1" />
            Làm mới
          </Button>
        </div>

        {/* Yêu cầu đã được giao cho tôi */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              <ClipboardDocumentIcon className="h-5 w-5 inline-block mr-2 text-blue-600" />
              Yêu cầu của tôi
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {myRequests.length} yêu cầu
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : myRequests.length > 0 ? (
            <div>
              {myRequests.map((request) => renderLabRequestCard(request))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <ClipboardDocumentIcon className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">
                Bạn chưa có yêu cầu xét nghiệm nào đang xử lý
              </p>
            </div>
          )}
        </section>

        {/* Yêu cầu đã hoàn thành */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              <CheckIcon className="h-5 w-5 inline-block mr-2 text-green-600" />
              Yêu cầu đã hoàn thành
            </h2>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {completedRequests.length} yêu cầu
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : completedRequests.length > 0 ? (
            <div>
              {completedRequests.map((request) =>
                renderLabRequestCard(request, false, true)
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <CheckIcon className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">
                Bạn chưa có yêu cầu xét nghiệm nào đã hoàn thành
              </p>
            </div>
          )}
        </section>

        {/* Yêu cầu đang chờ xử lý - hiển thị tất cả */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              <BeakerIcon className="h-5 w-5 inline-block mr-2 text-orange-600" />
              Yêu cầu xét nghiệm chờ xử lý
            </h2>
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {pendingRequests.length} yêu cầu
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : pendingRequests.length > 0 ? (
            <div>
              {pendingRequests.map((request) =>
                renderLabRequestCard(request, true)
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <BeakerIcon className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">
                Không có yêu cầu xét nghiệm nào đang chờ xử lý
              </p>
            </div>
          )}
        </section>

        {/* Yêu cầu đã bị từ chối */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              <XCircleIcon className="h-5 w-5 inline-block mr-2 text-red-600" />
              Yêu cầu đã bị từ chối
            </h2>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {rejectedRequests.length} yêu cầu
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : rejectedRequests.length > 0 ? (
            <div>
              {rejectedRequests.map((request) =>
                renderLabRequestCard(request, false, false, true)
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <XCircleIcon className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">
                Bạn chưa có yêu cầu xét nghiệm nào bị từ chối
              </p>
            </div>
          )}
        </section>
      </div>

      {showTestResultModal && selectedRequest && (
        <LabTestResultForm
          isOpen={showTestResultModal}
          labRequest={selectedRequest}
          onClose={() => setShowTestResultModal(false)}
          onSubmit={handleSubmitTestResult}
        />
      )}
    </Layout>
  );
};

export default LabRequestsPage;
