import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { UserRole } from "../../types/index.js";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import authService from "../../services/authService";
import paymentService from "../../services/paymentService";
import { motion } from "framer-motion";
import {
  CreditCardIcon,
  BanknotesIcon,
  QrCodeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const InvoicesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(false);

  // Load invoices on component mount
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login", {
        state: {
          from: "/customer/invoices",
          message: "Bạn cần đăng nhập để xem hóa đơn",
        },
      });
      return;
    }

    loadInvoices();
  }, [navigate]);

  // Load invoices from the API
  const loadInvoices = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentService.getUserTransactions();
      
      if (response.success) {
        // Transform the data for display
        const transformedInvoices = response.data.map(invoice => ({
          id: invoice.id,
          appointmentId: invoice.appointmentId,
          amount: invoice.amount,
          status: invoice.transactionStatus.toLowerCase(),
          paymentMethod: invoice.paymentMethod,
          createdAt: new Date(invoice.createdAt),
          updatedAt: new Date(invoice.updatedAt),
          paidAt: invoice.transactionTime ? new Date(invoice.transactionTime) : null,
          orderId: invoice.orderId,
          appointmentCheckedIn: invoice.appointmentCheckedIn || false, // Add check-in status
        }));
        
        setInvoices(transformedInvoices);
        
        // Check for pending QR payments that might have been completed
        const pendingQrPayments = transformedInvoices.filter(
          inv => inv.status === "pending" && inv.paymentMethod === "QR" && inv.orderId
        );
        
        if (pendingQrPayments.length > 0) {
          checkPendingPayments(pendingQrPayments);
        }
      } else {
        setError(response.message || "Không thể tải danh sách hóa đơn");
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Check pending payments that might have been completed
  const checkPendingPayments = async (pendingPayments) => {
    // For each pending payment, check if it has a MoMo transaction ID in the URL params
    const urlParams = new URLSearchParams(window.location.search);
    const momoOrderId = urlParams.get("orderId");
    const momoTransId = urlParams.get("transId");
    const resultCode = urlParams.get("resultCode");
    
    if (momoOrderId && momoTransId && resultCode === "0") {
      // Find the matching pending payment
      const matchingPayment = pendingPayments.find(p => p.orderId === momoOrderId);
      
      if (matchingPayment) {
        try {
          // Update the payment status
          await paymentService.manualCheckAndUpdatePayment(momoOrderId, momoTransId);
          console.log("Payment status updated successfully");
          
          // Reload invoices to show the updated status
          setTimeout(() => {
            loadInvoices();
          }, 1000);
        } catch (error) {
          console.error("Error updating payment status:", error);
        }
      }
    }
  };

  // Handle payment method selection
  const handlePayment = (invoice) => {
    // Check if the appointment is checked in
    if (!invoice.appointmentCheckedIn) {
      setError("Bạn cần check-in tại bệnh viện trước khi thanh toán");
      return;
    }
    
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  // Handle QR code payment
  const handleQrPayment = async () => {
    if (!selectedInvoice) return;
    
    setQrLoading(true);
    try {
      // Pass the transaction ID (selectedInvoice.id) correctly
      const response = await paymentService.createQrPayment(
        selectedInvoice.id,
        selectedInvoice.amount,
        `Thanh toán cho lịch hẹn #${selectedInvoice.appointmentId}`
      );
      
      if (response.success && response.data.payUrl) {
        // Redirect to MoMo payment page instead of just displaying the QR code
        window.location.href = response.data.payUrl;
      } else {
        setError("Không thể tạo mã QR thanh toán");
      }
    } catch (error) {
      console.error("Error creating QR payment:", error);
      setError(error.message);
    } finally {
      setQrLoading(false);
    }
  };

  // Close payment modal
  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setSelectedInvoice(null);
    setQrCodeUrl("");
  };

  // Filter invoices based on active tab
  const filterInvoices = (status) => {
    return invoices.filter(invoice => {
      switch (status) {
        case "pending":
          return invoice.status === "pending";
        case "completed":
          return invoice.status === "success";
        case "failed":
          return invoice.status === "failed" || invoice.status === "cancelled";
        default:
          return true;
      }
    });
  };

  const filteredInvoices = filterInvoices(activeTab);

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20";
      case "success":
        return "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20";
      case "failed":
        return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"; // Changed from red to gray
      case "cancelled":
        return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20";
      default:
        return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ thanh toán";
      case "success":
        return "Đã thanh toán";
      case "failed":
        return "Đã huỷ"; // Changed from "Thanh toán thất bại" to "Đã huỷ"
      case "cancelled":
        return "Đã huỷ";
      default:
        return "Không xác định";
    }
  };

  return (
    <Layout
      currentRole={UserRole.CUSTOMER}
      pageTitle="Hóa đơn"
      headerText="Quản lý hóa đơn"
    >
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Status Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  {
                    key: "pending",
                    label: "Chờ thanh toán",
                    count: filterInvoices("pending").length,
                  },
                  {
                    key: "completed",
                    label: "Đã thanh toán",
                    count: filterInvoices("completed").length,
                  },
                  {
                    key: "failed",
                    label: "Đã huỷ", // Changed from "Đã hủy/Thất bại" to just "Đã huỷ"
                    count: filterInvoices("failed").length,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="relative py-2 px-1 font-medium text-sm focus:outline-none"
                  >
                    <div className="flex items-center">
                      <span
                        className={`${
                          activeTab === tab.key
                            ? "text-primary-600"
                            : "text-gray-500 hover:text-gray-700"
                        } transition-colors duration-200`}
                      >
                        {tab.label}
                      </span>
                      <span
                        className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                          activeTab === tab.key
                            ? "bg-primary-100 text-primary-600 font-semibold"
                            : "bg-gray-100 text-gray-900"
                        } transition-colors duration-200`}
                      >
                        {tab.count}
                      </span>
                    </div>
                    {/* Pill shape background for active tab */}
                    {activeTab === tab.key && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Invoices List */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {filteredInvoices.length === 0 ? (
                <Card>
                  <div className="p-8 text-center">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {activeTab === "pending" &&
                        "Không có hóa đơn chờ thanh toán"}
                      {activeTab === "completed" &&
                        "Không có hóa đơn đã thanh toán"}
                      {activeTab === "failed" && "Không có hóa đơn thất bại"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {activeTab === "pending"
                        ? "Các hóa đơn chờ thanh toán sẽ hiển thị ở đây."
                        : "Lịch sử hóa đơn của bạn sẽ hiển thị ở đây."}
                    </p>
                  </div>
                </Card>
              ) : (
                filteredInvoices.map((invoice) => (
                  <Card key={invoice.id} className="mb-4 overflow-hidden">
                    <div className="p-6">
                      {/* Invoice Header with Status */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="p-2 rounded-md bg-blue-100">
                            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              Hóa đơn #{invoice.id}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Mã đơn hàng: {invoice.orderId}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {getStatusText(invoice.status)}
                        </span>
                      </div>

                      {/* Invoice Details */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <CreditCardIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-700">
                                Số tiền
                              </p>
                              <p className="text-sm text-green-600 font-semibold">
                                {formatCurrency(invoice.amount)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <div className="h-5 w-5 text-gray-400 mt-0.5 flex items-center justify-center">
                              {invoice.paymentMethod === "CASH" ? (
                                <BanknotesIcon className="h-5 w-5" />
                              ) : (
                                <QrCodeIcon className="h-5 w-5" />
                              )}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-700">
                                Phương thức thanh toán
                              </p>
                              <p className="text-sm text-gray-900">
                                {invoice.paymentMethod === "CASH"
                                  ? "Tiền mặt"
                                  : "QR Code"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-start">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="h-5 w-5 text-gray-400 mt-0.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                              />
                            </svg>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-700">
                                Ngày tạo
                              </p>
                              <p className="text-sm text-gray-900">
                                {formatDate(invoice.createdAt)} {formatTime(invoice.createdAt)}
                              </p>
                            </div>
                          </div>

                          {invoice.paidAt && (
                            <div className="flex items-start">
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700">
                                  Ngày thanh toán
                                </p>
                                <p className="text-sm text-gray-900">
                                  {formatDate(invoice.paidAt)} {formatTime(invoice.paidAt)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Invoice Actions */}
                      {invoice.status === "pending" && (
                        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                          <Button
                            variant="primary"
                            onClick={() => handlePayment(invoice)}
                            disabled={!invoice.appointmentCheckedIn}
                            title={!invoice.appointmentCheckedIn ? "Bạn cần check-in tại bệnh viện trước khi thanh toán" : ""}
                          >
                            {!invoice.appointmentCheckedIn ? (
                              <>Cần check-in để thanh toán</>
                            ) : (
                              <>Thanh toán ngay</>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </motion.div>
          </>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedInvoice && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Thanh toán hóa đơn #{selectedInvoice.id}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <p className="text-gray-700 mb-2">Số tiền cần thanh toán:</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedInvoice.amount)}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700 mb-4">Chọn phương thức thanh toán:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      className={`border rounded-lg p-4 flex flex-col items-center justify-center ${
                        selectedInvoice.paymentMethod === "CASH"
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      disabled={selectedInvoice.paymentMethod !== "CASH"}
                    >
                      <BanknotesIcon
                        className={`h-8 w-8 ${
                          selectedInvoice.paymentMethod === "CASH"
                            ? "text-primary-600"
                            : "text-gray-400"
                        } mb-2`}
                      />
                      <span
                        className={`${
                          selectedInvoice.paymentMethod === "CASH"
                            ? "text-primary-700"
                            : "text-gray-700"
                        }`}
                      >
                        Tiền mặt
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Thanh toán tại bệnh viện
                      </span>
                    </button>

                    <button
                      className={`border rounded-lg p-4 flex flex-col items-center justify-center ${
                        selectedInvoice.paymentMethod === "QR"
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={handleQrPayment}
                      disabled={selectedInvoice.paymentMethod !== "QR" || qrLoading}
                    >
                      {qrLoading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-2"></div>
                      ) : (
                        <QrCodeIcon
                          className={`h-8 w-8 ${
                            selectedInvoice.paymentMethod === "QR"
                              ? "text-primary-600"
                              : "text-gray-400"
                          } mb-2`}
                        />
                      )}
                      <span
                        className={`${
                          selectedInvoice.paymentMethod === "QR"
                            ? "text-primary-700"
                            : "text-gray-700"
                        }`}
                      >
                        QR Code
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Thanh toán qua ứng dụng
                      </span>
                    </button>
                  </div>
                </div>

                {qrCodeUrl && (
                  <div className="mb-6 flex flex-col items-center">
                    <p className="text-gray-700 mb-4">
                      Quét mã QR để thanh toán:
                    </p>
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="w-64 h-64 border border-gray-200 rounded-lg"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Sử dụng ứng dụng ngân hàng hoặc ví điện tử để quét mã
                    </p>
                  </div>
                )}

                {selectedInvoice.paymentMethod === "CASH" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
                      <p className="text-sm text-yellow-700">
                        Vui lòng thanh toán tại quầy thu ngân khi đến bệnh viện.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button variant="outline" onClick={handleCloseModal}>
                    Đóng
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InvoicesPage; 