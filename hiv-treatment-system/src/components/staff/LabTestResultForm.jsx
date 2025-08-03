import React, { useState, useEffect } from "react";
import { XMarkIcon, BeakerIcon } from "@heroicons/react/24/outline";
import Button from "../common/Button";
import staffLabService from "../../services/staffLabService";

const LabTestResultForm = ({ isOpen, onClose, labRequest, onSubmit }) => {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testDate, setTestDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen && labRequest) {
      // Reset form when opened with a new lab request
      setTestResults({});
      setTestDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setError(null);

      // Check if we have previous results from a rejected request
      if (labRequest.previousResults && labRequest.previousResults.length > 0) {
        // Initialize with previous results
        const initialResults = {};

        labRequest.previousResults.forEach((result) => {
          const testType = result.testType;
          let testId;

          // Map test types to field IDs
          switch (testType) {
            case "CD4":
              testId = "cd4";
              break;
            case "VIRAL_LOAD":
              testId = "viralLoad";
              break;
            case "HIV_TEST":
              testId = "hivTest";
              break;
            case "BLOOD_COUNT":
              if (!initialResults.wbc) testId = "wbc";
              else if (!initialResults.rbc) testId = "rbc";
              else if (!initialResults.hemoglobin) testId = "hemoglobin";
              else if (!initialResults.hematocrit) testId = "hematocrit";
              else if (!initialResults.platelets) testId = "platelets";
              break;
            default:
              testId = "general";
              break;
          }

          if (testId && !initialResults[testId]) {
            initialResults[testId] = {
              value: result.result || "",
              unit: result.unit || "",
              referenceRange: result.referenceRange || "",
            };
          }
        });

        // Set test date from the most recent result
        if (labRequest.previousResults[0].testDate) {
          setTestDate(labRequest.previousResults[0].testDate);
        }

        // Set notes from the most recent result
        if (labRequest.previousResults[0].notes) {
          setNotes(labRequest.previousResults[0].notes);
        }

        setTestResults(initialResults);
      } else {
        // Determine which test fields to show based on service name
        const serviceName = labRequest.serviceName?.toLowerCase() || "";
        const initialResults = {};

        if (serviceName.includes("cd4")) {
          initialResults.cd4 = {
            value: "",
            unit: "cells/mm³",
            referenceRange: "500-1600",
          };
        }

        if (
          serviceName.includes("viral") ||
          serviceName.includes("tải lượng")
        ) {
          initialResults.viralLoad = {
            value: "",
            unit: "copies/mL",
            referenceRange: "<50",
          };
        }

        if (
          serviceName.includes("hiv test") ||
          serviceName.includes("xét nghiệm hiv")
        ) {
          initialResults.hivTest = {
            value: "",
            unit: "",
            referenceRange: "Negative",
          };
        }

        if (serviceName.includes("blood") || serviceName.includes("máu")) {
          // Basic blood panel
          initialResults.wbc = {
            value: "",
            unit: "10³/μL",
            referenceRange: "4.5-11.0",
          };
          initialResults.rbc = {
            value: "",
            unit: "10⁶/μL",
            referenceRange: "4.5-5.9",
          };
          initialResults.hemoglobin = {
            value: "",
            unit: "g/dL",
            referenceRange: "13.5-17.5",
          };
          initialResults.hematocrit = {
            value: "",
            unit: "%",
            referenceRange: "41-53",
          };
          initialResults.platelets = {
            value: "",
            unit: "10³/μL",
            referenceRange: "150-450",
          };
        }

        // If no specific tests are identified, add general fields
        if (Object.keys(initialResults).length === 0) {
          initialResults.general = { value: "", unit: "", referenceRange: "" };
        }

        setTestResults(initialResults);
      }
    }
  }, [isOpen, labRequest]);

  const handleInputChange = (testId, field, value) => {
    setTestResults((prev) => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Prepare results for submission
      const formattedResults = Object.entries(testResults).map(
        ([testId, data]) => {
          // Map test IDs to TestType enum values
          const testTypeMap = {
            cd4: "CD4",
            viralLoad: "VIRAL_LOAD",
            hivTest: "HIV_TEST",
            wbc: "BLOOD_COUNT",
            rbc: "BLOOD_COUNT",
            hemoglobin: "BLOOD_COUNT",
            hematocrit: "BLOOD_COUNT",
            platelets: "BLOOD_COUNT",
            general: "OTHER",
          };

          // Get the appointment ID from the lab request
          const appointmentId = labRequest.appointmentId;

          return {
            testType: testTypeMap[testId] || "OTHER",
            result: data.value,
            unit: data.unit,
            referenceRange: data.referenceRange,
            testDate: testDate,
            notes: notes,
            // Use the appointment's user ID since patientId is not directly available
            appointmentId: appointmentId,
          };
        }
      );

      // If this is a rejected request, first reactivate it
      if (labRequest.status === "REJECTED") {
        await staffLabService.reactivateLabRequest(labRequest.id);
      }

      // Submit all results
      const response = await onSubmit({
        labRequestId: labRequest.id,
        results: formattedResults,
      });

      if (response && response.success) {
        // Trigger event to notify other components that this lab request is completed
        localStorage.setItem("testResultSubmitted", labRequest.id);
        // This creates a storage event that will be caught by the event listener in DashboardPage

        // Small delay to ensure the event is processed
        setTimeout(() => {
          onClose();
        }, 100);
      } else {
        onClose();
      }
    } catch (err) {
      setError(`Error submitting test results: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !labRequest) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <BeakerIcon className="h-5 w-5 mr-2 text-blue-500" />
            Nhập kết quả xét nghiệm
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Patient info */}
          <div className="mb-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800">Thông tin bệnh nhân</h3>
            <p className="text-blue-700">
              <span className="font-medium">Họ tên:</span>{" "}
              {labRequest.patientName}
            </p>
            <p className="text-blue-700">
              <span className="font-medium">Dịch vụ:</span>{" "}
              {labRequest.serviceName}
            </p>
            {labRequest.bloodPressure && (
              <p className="text-blue-700">
                <span className="font-medium">Huyết áp:</span>{" "}
                {labRequest.bloodPressure}
              </p>
            )}
            {labRequest.symptoms && (
              <p className="text-blue-700">
                <span className="font-medium">Triệu chứng hiện tại:</span>{" "}
                {labRequest.symptoms}
              </p>
            )}
            {labRequest.medicalHistory && (
              <p className="text-blue-700">
                <span className="font-medium">Tiền sử bệnh:</span>{" "}
                {labRequest.medicalHistory}
              </p>
            )}
            {labRequest.status === "REJECTED" && labRequest.notes && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 font-medium">
                  Lý do bác sĩ từ chối kết quả trước đó:
                </p>
                <p className="text-red-600 italic">{labRequest.notes}</p>
              </div>
            )}
            {labRequest.previousResults &&
              labRequest.previousResults.length > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-700 font-medium">
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Kết quả xét nghiệm trước đã được tải lại
                    </span>
                  </p>
                  <p className="text-yellow-600">
                    Bạn có thể sửa các giá trị cần thiết và gửi lại.
                  </p>
                </div>
              )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Test date */}
            <div className="mb-4">
              <label
                htmlFor="testDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ngày xét nghiệm
              </label>
              <input
                type="date"
                id="testDate"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Test results */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">
                Kết quả xét nghiệm
              </h3>

              <div className="space-y-4">
                {Object.entries(testResults).map(([testId, data]) => {
                  // Generate human-readable test names
                  const testNames = {
                    cd4: "CD4 (Tế bào lympho T CD4+)",
                    viralLoad: "Tải lượng virus (Viral Load)",
                    hivTest: "Xét nghiệm HIV",
                    wbc: "Bạch cầu (WBC)",
                    rbc: "Hồng cầu (RBC)",
                    hemoglobin: "Hemoglobin",
                    hematocrit: "Hematocrit",
                    platelets: "Tiểu cầu",
                    general: "Kết quả xét nghiệm",
                  };

                  return (
                    <div
                      key={testId}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {testNames[testId] || testId}
                      </label>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500">
                            Giá trị
                          </label>
                          <input
                            type="text"
                            value={data.value}
                            onChange={(e) =>
                              handleInputChange(testId, "value", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500">
                            Đơn vị
                          </label>
                          <input
                            type="text"
                            value={data.unit}
                            onChange={(e) =>
                              handleInputChange(testId, "unit", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500">
                            Khoảng tham chiếu
                          </label>
                          <input
                            type="text"
                            value={data.referenceRange}
                            onChange={(e) =>
                              handleInputChange(
                                testId,
                                "referenceRange",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ghi chú
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md h-24"
                placeholder="Nhập ghi chú về kết quả xét nghiệm (nếu có)"
              />
            </div>

            {/* Submit button */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" variant="primary" isLoading={isLoading}>
                Lưu kết quả
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LabTestResultForm;
