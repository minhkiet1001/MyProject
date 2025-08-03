import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Snackbar,
  Alert,
  Badge
} from "@mui/material";
import {
  AccessTimeOutlined,
  CheckCircleOutlined,
  PersonOutlineOutlined,
  PaymentOutlined,
  CreditCardOutlined,
  MoneyOffOutlined,
  NotificationsActive
} from "@mui/icons-material";
import staffService from "../../services/staffService";
import paymentService from "../../services/paymentService";
import StaffPaymentComponent from "../../components/staff/StaffPaymentComponent";

const StaffAppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });
  const [pendingPayments, setPendingPayments] = useState([]);

  // Fetch appointments on component mount and every 30 seconds
  useEffect(() => {
    fetchAppointments();
    
    const interval = setInterval(() => {
      fetchAppointments();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await staffService.getTodayAppointments();
      
      if (response.success) {
        // Log response data to debug
        console.log("Fetched appointments:", response.data);
        
        // Set appointments first
        setAppointments(response.data);
        
        // Check for pending payments that need confirmation
        // Only check appointments that are checked in but not marked as paid
        const unpaidAppointments = response.data.filter(appt => {
          const isPaid = appt.isPaid || appt.paid;
          return appt.checkedIn && !isPaid;
        });
        
        console.log("Unpaid checked-in appointments:", unpaidAppointments);
        
        if (unpaidAppointments.length > 0) {
          const pendingPaymentsPromises = unpaidAppointments
            .map(appt => paymentService.getTransactionByAppointmentId(appt.id));
            
          const pendingPaymentsResults = await Promise.all(pendingPaymentsPromises);
          const needsConfirmation = pendingPaymentsResults
            .filter(res => res.success && res.data && res.data.needsStaffConfirmation)
            .map(res => res.data);
          
          console.log("Payments needing confirmation:", needsConfirmation);
          setPendingPayments(needsConfirmation);
        } else {
          console.log("No unpaid checked-in appointments found");
          setPendingPayments([]);
        }
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Quick confirm payment for an appointment
  const handleQuickConfirmPayment = async (appointment) => {
    // Log the appointment to debug
    console.log("Quick confirming payment for appointment:", appointment);
    
    // Make sure appointment exists
    if (!appointment || !appointment.id) {
      console.warn("Invalid appointment data for quick confirm:", appointment);
      setSnackbar({
        open: true,
        message: "Không tìm thấy thông tin lịch hẹn",
        severity: "error"
      });
      return;
    }
    
    // Confirm payment with the appointment data we have
    handleConfirmPaymentWithData(appointment);
  };
  
  // Helper function to confirm payment with appointment data
  const handleConfirmPaymentWithData = (appointment) => {
    // Create confirmation message based on available data
    let confirmMessage = `Xác nhận thanh toán cho lịch hẹn của bệnh nhân ${appointment.patientName || 'không xác định'}?`;
    
    // Add price information if available
    if (appointment.service && appointment.service.basePrice) {
      confirmMessage = `Xác nhận thanh toán ${appointment.service.basePrice.toLocaleString('vi-VN')} VNĐ cho lịch hẹn của bệnh nhân ${appointment.patientName || 'không xác định'}?`;
    }
    
    if (window.confirm(confirmMessage)) {
      confirmPayment(appointment);
    }
  };
  
  // Actual payment confirmation logic
  const confirmPayment = async (appointment) => {
    try {
      console.log("Confirming payment for appointment:", appointment.id);
      
      const response = await paymentService.staffConfirmPayment({
        appointmentId: appointment.id,
        paymentMethod: appointment.paymentMethod || "CASH",
        notes: "Xác nhận nhanh bởi nhân viên"
      });
      
      if (response.success) {
        console.log("Payment confirmation successful, response:", response);
        
        setSnackbar({ 
          open: true, 
          message: "Xác nhận thanh toán thành công!", 
          severity: "success" 
        });
        
        // Immediately update the appointment in the local state
        setAppointments(prevAppointments => {
          const updatedAppointments = prevAppointments.map(appt => 
            appt.id === appointment.id 
              ? { ...appt, isPaid: true, paid: true } 
              : appt
          );
          console.log("Updated appointments state:", updatedAppointments);
          return updatedAppointments;
        });
        
        // Also update pendingPayments to remove this appointment
        setPendingPayments(prevPending => 
          prevPending.filter(payment => payment.appointmentId !== appointment.id)
        );
        
        // Force a refresh after a short delay to ensure UI updates
        setTimeout(() => {
          fetchAppointments();
        }, 500);
      } else {
        throw new Error(response.message || "Xác nhận thanh toán thất bại");
      }
    } catch (err) {
      console.error("Error confirming payment:", err);
      setSnackbar({ 
        open: true, 
        message: err.message || "Xác nhận thanh toán thất bại", 
        severity: "error" 
      });
    }
  };

  // When staff clicks payment button for detailed confirmation
  const handleOpenPaymentDialog = (appointment) => {
    // Log the appointment to debug
    console.log("Opening payment dialog for appointment:", appointment);
    
    // Make sure appointment exists
    if (!appointment || !appointment.id) {
      console.warn("Invalid appointment data:", appointment);
      setSnackbar({
        open: true,
        message: "Không tìm thấy thông tin lịch hẹn",
        severity: "error"
      });
      return;
    }
    
    // Set the selected appointment and open the dialog
    setSelectedAppointment(appointment);
    setOpenDialog(true);
  };

  // Handle payment completion callback
  const handlePaymentComplete = (result) => {
    if (result.status === "SUCCESS") {
      console.log("Payment complete callback with result:", result);
      
      setSnackbar({ 
        open: true, 
        message: `Thanh toán ${result.method === "CASH" ? "tiền mặt" : "QR"} thành công!`, 
        severity: "success" 
      });
      setOpenDialog(false);
      
      // Immediately update the appointment in the local state
      if (result.appointment && result.appointment.id) {
        setAppointments(prevAppointments => {
          const updatedAppointments = prevAppointments.map(appt => 
            appt.id === result.appointment.id 
              ? { ...appt, isPaid: true, paid: true } 
              : appt
          );
          console.log("Updated appointments state from dialog:", updatedAppointments);
          return updatedAppointments;
        });
        
        // Also update pendingPayments to remove this appointment
        setPendingPayments(prevPending => 
          prevPending.filter(payment => payment.appointmentId !== result.appointment.id)
        );
      }
      
      // Force a refresh after a short delay to ensure UI updates
      setTimeout(() => {
        fetchAppointments();
      }, 500);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Filter appointments based on tab
  const filteredAppointments = appointments.filter(appt => {
    // Determine if the appointment is paid (check both isPaid and paid fields)
    const isPaid = appt.isPaid || appt.paid;
    
    if (tabValue === "all") return true;
    if (tabValue === "checked-in") return appt.checkedIn && !isPaid;
    if (tabValue === "needs_confirmation") {
      // Find if this appointment has a pending payment that needs confirmation
      return pendingPayments.some(payment => payment.appointmentId === appt.id);
    }
    if (tabValue === "completed") return isPaid;
    return true;
  });

  // Count of payments needing confirmation
  const needsConfirmationCount = pendingPayments.length;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 flex justify-between items-center">
        <Typography variant="h5" component="h1" className="font-medium">
          Danh sách lịch hẹn hôm nay
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<AccessTimeOutlined />} 
          onClick={fetchAppointments}
        >
          Cập nhật
        </Button>
      </div>
      
      {/* Tab navigation */}
      <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${tabValue === 'all' ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setTabValue('all')}
        >
          Tất cả
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${tabValue === 'checked-in' ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setTabValue('checked-in')}
        >
          Đã check-in
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm rounded-t-lg flex items-center ${tabValue === 'needs_confirmation' ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setTabValue('needs_confirmation')}
        >
          <span>Cần xác nhận thanh toán</span>
          {needsConfirmationCount > 0 && (
            <Badge 
              badgeContent={needsConfirmationCount} 
              color="error" 
              className="ml-1"
            >
              <NotificationsActive fontSize="small" />
            </Badge>
          )}
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${tabValue === 'completed' ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setTabValue('completed')}
        >
          Đã hoàn thành
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-3 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <AccessTimeOutlined style={{ fontSize: 48 }} className="text-gray-400" />
          <Typography variant="h6" className="mt-2 text-gray-500">
            {tabValue === 'all' 
              ? 'Không có lịch hẹn nào hôm nay' 
              : tabValue === 'checked-in'
                ? 'Không có lịch hẹn nào đã check-in'
                : tabValue === 'needs_confirmation'
                  ? 'Không có thanh toán nào cần xác nhận'
                  : 'Không có lịch hẹn nào đã hoàn thành'}
          </Typography>
        </div>
      ) : (
        <div className="overflow-x-auto">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>STT</TableCell>
                <TableCell>Khách hàng</TableCell>
            <TableCell>Thời gian</TableCell>
            <TableCell>Dịch vụ</TableCell>
                <TableCell>Bác sĩ</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                <TableCell>Thanh toán</TableCell>
            <TableCell>Hành động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredAppointments.map((appt, idx) => {
            // Check if this appointment has a pending payment that needs confirmation
            const needsConfirmation = pendingPayments.some(payment => payment.appointmentId === appt.id);
            
            // Determine if the appointment is paid (check both isPaid and paid fields)
            const isPaid = appt.isPaid || appt.paid;
            
            return (
              <TableRow 
                key={appt.id} 
                className={needsConfirmation 
                  ? "bg-amber-50" // Highlight appointments with pending payments needing confirmation
                  : appt.checkedIn && !isPaid 
                    ? "bg-yellow-50" 
                    : isPaid 
                      ? "bg-green-50" 
                      : ""
                }
              >
                <TableCell>{idx + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <PersonOutlineOutlined className="text-gray-500 mr-2" fontSize="small" />
                    <div>
                      <div className="font-medium">{appt.patientName}</div>
                      <div className="text-xs text-gray-500">{appt.patientPhone}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatDateTime(appt.scheduledAt)}</TableCell>
                <TableCell>
                  <div className="max-w-xs truncate">{appt.service?.name}</div>
                  {appt.service?.basePrice && (
                    <div className="text-xs text-primary-600 font-medium">
                      {appt.service.basePrice.toLocaleString('vi-VN')} VNĐ
                    </div>
                  )}
                </TableCell>
                <TableCell>{appt.doctor?.name || "Chưa chỉ định"}</TableCell>
                <TableCell align="center">
                  <Chip 
                    size="small"
                    label={appt.checkedIn ? "Đã check-in" : "Chưa check-in"} 
                    color={appt.checkedIn ? "primary" : "default"}
                    icon={appt.checkedIn ? <CheckCircleOutlined /> : <AccessTimeOutlined />}
                  />
                </TableCell>
                <TableCell>
                  {isPaid ? (
                    <div className="flex flex-col">
                      <Chip 
                        size="small"
                        label="Đã thanh toán" 
                        color="success"
                        icon={<CheckCircleOutlined />}
                      />
                      {appt.paymentMethod && (
                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                          <CreditCardOutlined fontSize="inherit" className="mr-1" />
                          {appt.paymentMethod === "CASH" ? "Tiền mặt" : "QR/Online"}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <Chip 
                        size="small"
                        label={needsConfirmation ? "Chờ xác nhận" : "Chưa thanh toán"} 
                        color={needsConfirmation ? "warning" : "default"}
                        variant="outlined"
                        icon={needsConfirmation ? <NotificationsActive /> : <MoneyOffOutlined />}
                      />
                      {needsConfirmation && (
                        <Button
                          size="small"
                          variant="text"
                          color="success"
                          className="mt-1 text-xs p-0 min-w-0 normal-case"
                          onClick={() => handleQuickConfirmPayment(appt)}
                        >
                          Xác nhận ngay
                        </Button>
                      )}
                    </div>
                  )}
                </TableCell>
              <TableCell>
                {needsConfirmation ? (
                  <Button
                    size="small"
                    variant="contained"
                    color="warning"
                    onClick={() => handleOpenPaymentDialog(appt)}
                    startIcon={<PaymentOutlined />}
                  >
                    Xác nhận thanh toán
                  </Button>
                ) : isPaid ? (
                  <span className="text-sm text-green-600">Hoàn tất</span>
                ) : (
                  <span className="text-sm text-gray-500">Chờ thanh toán</span>
                )}
              </TableCell>
            </TableRow>
          )})}
        </TableBody>
      </Table>
        </div>
      )}

      {/* Payment Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
      >
        <DialogTitle>
          Xác nhận thanh toán
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <StaffPaymentComponent
              appointment={selectedAppointment}
              onPaymentComplete={handlePaymentComplete}
              onClose={() => setOpenDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: "", severity: "info" })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default StaffAppointmentList;
