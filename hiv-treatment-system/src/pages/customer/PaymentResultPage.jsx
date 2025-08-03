import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import paymentService from "../../services/paymentService";

const PaymentResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        // Get URL parameters
        const params = new URLSearchParams(location.search);
        const resultCode = params.get("resultCode");
        const orderId = params.get("orderId");
        const transId = params.get("transId");
        
        if (resultCode === "0" && orderId && transId) {
          // Payment successful - manually update payment status
          try {
            await paymentService.manualCheckAndUpdatePayment(orderId, transId);
            console.log("Payment status updated successfully");
          } catch (updateError) {
            console.error("Error updating payment status:", updateError);
          }
          
          // Show success message
          setSuccess(true);
          setMessage("Thanh toán thành công! Thanh toán của bạn đang chờ xác nhận từ nhân viên. Đang chuyển hướng về trang lịch hẹn...");
          
          // Start countdown
          setCountdown(5);
        } else {
          // Payment failed
          setSuccess(false);
          setMessage(`Thanh toán thất bại! Lỗi: ${params.get("message") || "Không xác định"}`);
        }
      } catch (error) {
        console.error("Error processing payment result:", error);
        setSuccess(false);
        setMessage("Có lỗi xảy ra khi xử lý kết quả thanh toán");
      } finally {
        setLoading(false);
      }
    };

    processPaymentResult();
  }, [location]);

  // Countdown effect
  useEffect(() => {
    let timer;
    if (success && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (success && countdown === 0) {
      // Pass payment result parameters to appointments page to trigger refresh
      const params = new URLSearchParams(location.search);
      navigate(`/customer/appointments?resultCode=${params.get("resultCode") || ""}&orderId=${params.get("orderId") || ""}`);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success, countdown, navigate, location]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-12">
              {loading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              ) : success ? (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircleIcon className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">Thanh toán thành công!</h2>
                  <p className="text-gray-600 mb-6 text-center">{message}</p>
                  <p className="text-sm text-gray-500">
                    Tự động chuyển hướng sau {countdown} giây...
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <XCircleIcon className="h-10 w-10 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">Thanh toán thất bại!</h2>
                  <p className="text-gray-600 mb-6 text-center">{message}</p>
                  <button
                    onClick={() => navigate("/customer/appointments")}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Quay lại trang lịch hẹn
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentResultPage; 