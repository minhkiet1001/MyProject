import React, { useState, useEffect } from "react";
import {
  BeakerIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import doctorLabResultService from "../../services/doctorLabResultService";
import Button from "../common/Button";

const PendingLabResults = () => {
  const [pendingResults, setPendingResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchPendingResults();
  }, []);

  const fetchPendingResults = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response =
        await doctorLabResultService.getPendingLabResultsForDoctorPatients();

      if (response.success) {
        setPendingResults(response.data || []);
      } else {
        setError(response.message || "Failed to fetch pending lab results");
      }
    } catch (err) {
      setError("Error loading pending lab results: " + err.message);
      console.error("Error fetching pending lab results:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveClick = (result) => {
    setSelectedResult(result);
    setApprovalNotes("");
    setShowApprovalModal(true);
  };

  const handleRejectClick = (result) => {
    setSelectedResult(result);
    setApprovalNotes("");
    setShowRejectModal(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedResult) return;

    try {
      setProcessingAction(true);
      const response = await doctorLabResultService.approveLabResult(
        selectedResult.id,
        approvalNotes
      );

      if (response.success) {
        // Remove approved result from list
        setPendingResults(
          pendingResults.filter((r) => r.id !== selectedResult.id)
        );
        setShowApprovalModal(false);

        // Show success message
        alert("Kết quả xét nghiệm đã được duyệt thành công!");
      } else {
        setError(response.message || "Failed to approve lab result");
      }
    } catch (err) {
      setError("Error approving lab result: " + err.message);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedResult || !approvalNotes.trim()) {
      setError("Vui lòng nhập lý do từ chối kết quả xét nghiệm");
      return;
    }

    try {
      setProcessingAction(true);
      const response = await doctorLabResultService.rejectLabResult(
        selectedResult.id,
        approvalNotes
      );

      if (response.success) {
        // Remove rejected result from list
        setPendingResults(
          pendingResults.filter((r) => r.id !== selectedResult.id)
        );
        setShowRejectModal(false);

        // Show success message
        alert("Kết quả xét nghiệm đã được từ chối!");
      } else {
        setError(response.message || "Failed to reject lab result");
      }
    } catch (err) {
      setError("Error rejecting lab result: " + err.message);
    } finally {
      setProcessingAction(false);
    }
  };

  const getTestTypeLabel = (testType) => {
    switch (testType) {
      case "CD4":
        return "CD4 (Tế bào lympho T CD4+)";
      case "VIRAL_LOAD":
        return "Tải lượng virus (Viral Load)";
      case "HIV_TEST":
        return "Xét nghiệm HIV";
      case "BLOOD_COUNT":
        return "Công thức máu";
      case "LIVER_FUNCTION":
        return "Chức năng gan";
      case "KIDNEY_FUNCTION":
        return "Chức năng thận";
      default:
        return testType || "Không xác định";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-lg shadow-md p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-amber-900">
            <BeakerIcon className="h-6 w-6 inline mr-2 text-amber-600" />
            Kết quả xét nghiệm chờ duyệt
          </h2>
          <p className="text-amber-700">
            Kết quả xét nghiệm của bệnh nhân của bạn cần được duyệt trước khi
            lập kế hoạch điều trị
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchPendingResults}
          disabled={isLoading}
        >
          Làm mới
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-lg border border-amber-100 p-6 text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : pendingResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingResults.map((result, index) => (
            <div
              key={result.id}
              className={`bg-white rounded-lg border border-amber-100 p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-slideUp`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                      <UserCircleIcon className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">
                        {result.userName || "Không rõ bệnh nhân"}
                      </h3>
                      <p className="text-amber-600 font-medium">
                        {getTestTypeLabel(result.testType)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Kết quả:</p>
                      <p className="font-medium">{result.result}</p>
                    </div>
                    {result.unit && (
                      <div>
                        <p className="text-sm text-gray-500">Đơn vị:</p>
                        <p>{result.unit}</p>
                      </div>
                    )}
                    {result.referenceRange && (
                      <div>
                        <p className="text-sm text-gray-500">
                          Khoảng tham chiếu:
                        </p>
                        <p>{result.referenceRange}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Ngày xét nghiệm:</p>
                      <p className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                        {formatDate(result.testDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Người nhập kết quả:
                      </p>
                      <p className="flex items-center">
                        <UserCircleIcon className="h-4 w-4 mr-1 text-gray-500" />
                        {result.staffName || "Không có thông tin"}
                      </p>
                    </div>
                  </div>

                  {result.notes && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Ghi chú:</p>
                      <p className="text-sm italic">{result.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end space-x-2">
                <Button
                  variant="danger"
                  size="xs"
                  onClick={() => handleRejectClick(result)}
                >
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  Từ chối
                </Button>
                <Button
                  variant="success"
                  size="xs"
                  onClick={() => handleApproveClick(result)}
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Duyệt
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-amber-100 p-6 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BeakerIcon className="h-8 w-8 text-amber-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Không có kết quả xét nghiệm chờ duyệt
          </h3>
          <p className="text-gray-500">
            Hiện tại không có kết quả xét nghiệm nào đang chờ bạn duyệt
          </p>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedResult && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Duyệt kết quả xét nghiệm
            </h3>
            <p className="mb-4">
              Bạn có chắc chắn muốn duyệt kết quả xét nghiệm này không?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú duyệt (không bắt buộc)
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Nhập ghi chú (nếu có)"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowApprovalModal(false)}
                disabled={processingAction}
              >
                Hủy
              </Button>
              <Button
                variant="success"
                onClick={handleApproveConfirm}
                isLoading={processingAction}
              >
                Xác nhận duyệt
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedResult && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Từ chối kết quả xét nghiệm
            </h3>
            <p className="mb-4">
              Vui lòng nhập lý do từ chối kết quả xét nghiệm này:
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lý do từ chối <span className="text-red-600">*</span>
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Nhập lý do từ chối kết quả xét nghiệm"
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowRejectModal(false)}
                disabled={processingAction}
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                onClick={handleRejectConfirm}
                isLoading={processingAction}
                disabled={!approvalNotes.trim()}
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingLabResults;
