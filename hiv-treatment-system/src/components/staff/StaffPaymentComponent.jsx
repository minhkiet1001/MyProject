import React, { useState, useEffect } from "react";
import { 
  CreditCardIcon, 
  BanknotesIcon, 
  QrCodeIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationCircleIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import paymentService from "../../services/paymentService";
import Button from "../common/Button";

/**
 * Component for staff to process payments for appointments
 *
 * @param {Object} props - Component props
 * @param {Object} props.appointment - Appointment data
 * @param {Function} props.onPaymentComplete - Callback when payment is completed
 * @param {Function} props.onClose - Callback to close the payment dialog
 */
const StaffPaymentComponent = ({ appointment, onPaymentComplete, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState(appointment.paymentMethod || "CASH");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [notes, setNotes] = useState("");
  const [transaction, setTransaction] = useState(null);
  const [loadingTransaction, setLoadingTransaction] = useState(false);
  
  // Staff confirms payment - định nghĩa hàm confirmPayment ở đây, trước khi sử dụng
  const confirmPayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Staff confirms the payment
      const response = await paymentService.staffConfirmPayment({
        appointmentId: appointment.id,
        paymentMethod: paymentMethod,
        notes: notes
      });
      
      if (response.success) {
        setPaymentStatus("SUCCESS");
        
        if (onPaymentComplete) {
          onPaymentComplete({
            method: paymentMethod,
            status: "SUCCESS",
            appointment: appointment
          });
        }
      } else {
        throw new Error(response.message || "Xác nhận thanh toán thất bại");
      }
    } catch (error) {
      setError(error.message || "Lỗi xác nhận thanh toán");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch transaction data on component mount
  useEffect(() => {
    const fetchTransaction = async () => {
      if (appointment && appointment.id) {
        setLoadingTransaction(true);
        try {
          const response = await paymentService.getTransactionByAppointmentId(appointment.id);
          if (response.success && response.data) {
            setTransaction(response.data);
            // If there's a provider transaction ID and payment method is QR, update the payment method
            if (response.data.providerTransactionId && response.data.paymentMethod === "QR") {
              setPaymentMethod("QR");
            }
          }
        } catch (error) {
          console.error("Error fetching transaction:", error);
        } finally {
          setLoadingTransaction(false);
        }
      }
    };
    
    fetchTransaction();
  }, [appointment]);
  
  // Debug log appointment data
  useEffect(() => {
    console.log("StaffPaymentComponent received appointment:", appointment);
  }, [appointment]);
  
  // Handle case when appointment or service information is missing
  if (!appointment) {
    return (
      <div className="p-4 text-center">
        <ExclamationCircleIcon className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <p className="text-gray-700">Không tìm thấy thông tin lịch hẹn</p>
        <Button onClick={onClose} className="mt-4">Đóng</Button>
      </div>
    );
  }
  
  if (!appointment.service) {
    // Trường hợp không có thông tin dịch vụ, nhưng vẫn cho phép xác nhận thanh toán
    return (
      <div className="p-4">
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded mb-4">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Không tìm thấy thông tin dịch vụ cho lịch hẹn này</p>
              <p className="text-sm">Bạn vẫn có thể xác nhận thanh toán cho lịch hẹn này.</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Thông tin lịch hẹn</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Mã lịch hẹn:</span>
              <span className="ml-1 font-medium text-gray-900">#{appointment.id}</span>
            </div>
            <div>
              <span className="text-gray-600">Bệnh nhân:</span>
              <span className="ml-1 font-medium text-gray-900">{appointment.patientName || "Không có thông tin"}</span>
            </div>
            <div>
              <span className="text-gray-600">Thời gian:</span>
              <span className="ml-1 font-medium text-gray-900">
                {appointment.scheduledAt ? new Date(appointment.scheduledAt).toLocaleString("vi-VN") : "Không có thông tin"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Phương thức:</span>
              <span className="ml-1 font-medium text-gray-900">{paymentMethod === "CASH" ? "Tiền mặt" : "QR Code"}</span>
            </div>
          </div>
        </div>
        
        {/* Notes field for staff */}
        <div className="mb-4">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú xác nhận (không bắt buộc)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Nhập ghi chú về việc xác nhận thanh toán (nếu có)"
          />
        </div>
        
        <div className="flex justify-end space-x-3 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          
          <Button
            variant="primary"
            onClick={confirmPayment}
            disabled={loading}
            className="min-w-[180px]"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý
              </span>
            ) : (
              <span className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-1" />
                Xác nhận đã thanh toán
              </span>
            )}
          </Button>
        </div>
      </div>
    );
  }
  
  const amount = appointment.service.basePrice || 0;
  
  // Display payment success
  if (paymentStatus === "SUCCESS") {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircleIcon className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-green-600 mb-2">Thanh toán thành công!</h3>
        <p className="text-gray-700 mb-4">
          Đã xác nhận thanh toán cho lịch hẹn #{appointment.id} bằng phương thức {paymentMethod === "CASH" ? "tiền mặt" : "QR"}
        </p>
        <Button onClick={onClose}>Đóng</Button>
      </div>
    );
  }
  
  // Check if this transaction has a QR payment that needs confirmation
  const hasQrPaymentPending = transaction && 
                             transaction.paymentMethod === "QR" && 
                             transaction.providerTransactionId && 
                             transaction.transactionStatus === "PENDING";
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Xác nhận thanh toán - Lịch hẹn #{appointment.id}
      </h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {hasQrPaymentPending && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded mb-4">
          <div className="flex">
            <InformationCircleIcon className="h-5 w-5 text-amber-500 mr-2" />
            <div>
              <p className="font-medium">Bệnh nhân đã thanh toán qua QR Code!</p>
              <p className="text-sm">Mã giao dịch: {transaction.providerTransactionId}</p>
              <p className="text-sm">Thời gian: {new Date(transaction.updatedAt).toLocaleString("vi-VN")}</p>
              <p className="text-sm mt-1">Vui lòng xác nhận để hoàn tất thanh toán.</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Thông tin thanh toán</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Dịch vụ:</span>
            <span className="ml-1 font-medium text-gray-900">{appointment.service.name}</span>
          </div>
          <div>
            <span className="text-gray-600">Bác sĩ:</span>
            <span className="ml-1 font-medium text-gray-900">{appointment.doctor ? appointment.doctor.name : "Chưa chỉ định"}</span>
          </div>
          <div>
            <span className="text-gray-600">Thời gian:</span>
            <span className="ml-1 font-medium text-gray-900">
              {new Date(appointment.scheduledAt).toLocaleString("vi-VN")}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Số tiền:</span>
            <span className="ml-1 font-medium text-green-600">{amount.toLocaleString("vi-VN")} VNĐ</span>
          </div>
          <div>
            <span className="text-gray-600">Bệnh nhân:</span>
            <span className="ml-1 font-medium text-gray-900">{appointment.patientName}</span>
          </div>
          <div>
            <span className="text-gray-600">Phương thức:</span>
            <span className="ml-1 font-medium text-gray-900">{paymentMethod === "CASH" ? "Tiền mặt" : "QR Code"}</span>
          </div>
        </div>
      </div>
      
      {/* Notes field for staff */}
      <div className="mb-4">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Ghi chú xác nhận (không bắt buộc)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Nhập ghi chú về việc xác nhận thanh toán (nếu có)"
        />
      </div>
      
      <div className="flex justify-end space-x-3 mt-4">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Hủy
        </Button>
        
        <Button
          variant="primary"
          onClick={confirmPayment}
          disabled={loading}
          className="min-w-[180px]"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý
            </span>
          ) : (
            <span className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-1" />
              Xác nhận đã thanh toán
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default StaffPaymentComponent;