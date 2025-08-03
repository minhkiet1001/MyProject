import React from "react";
import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/layout/Layout";
import HeroSection from "./components/guest/HeroSection";
import { UserRole } from "./types/index.js";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotificationsPage from "./pages/NotificationsPage";
import ResourcesPage from "./pages/guest/ResourcesPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// InfoPage component cho bệnh nhân
const InfoPage = () => {
  const infoLinks = [
    {
      name: "Trang chủ",
      href: "/customer/dashboard",
      description: "Tổng quan về dịch vụ của chúng tôi",
    },
    {
      name: "Giới thiệu",
      href: "/customer/info",
      description: "Thông tin về chúng tôi và sứ mệnh của chúng tôi",
    },
    {
      name: "Lịch hẹn",
      href: "/customer/appointments",
      description: "Đặt lịch hẹn với bác sĩ chuyên khoa",
    },
    {
      name: "Xét nghiệm",
      href: "/customer/test-results",
      description: "Xem kết quả xét nghiệm và theo dõi sức khỏe",
    },

    {
      name: "Thuốc điều trị",
      href: "/customer/medications",
      description: "Quản lý thuốc và lịch uống thuốc",
    },
    {
      name: "Blog",
      href: "/customer/blog",
      description: "Tin tức và bài viết về sức khỏe và điều trị HIV",
    },
    {
      name: "Liên hệ",
      href: "/customer/support",
      description: "Thông tin liên hệ và hỗ trợ",
    },
  ];

  return (
    <Layout
      currentRole={UserRole.CUSTOMER}
      userName="Nguyễn Văn An"
      pageTitle="Thông Tin"
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Các trang thông tin
        </h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {infoLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition duration-150"
            >
              <h2 className="text-xl font-semibold text-primary-600 mb-2">
                {link.name}
              </h2>
              <p className="text-gray-600">{link.description}</p>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
};

// Các trang cho Khách
import HomePage from "./pages/guest/HomePage";
import AboutPage from "./pages/guest/AboutPage";
import ServicesPage from "./pages/guest/ServicesPage";
import BlogPage from "./pages/guest/BlogPage";
import PublicSchedulePage from "./pages/guest/PublicSchedulePage";
import DoctorsPage from "./pages/guest/DoctorsPage";

// Các trang cho Bệnh nhân
import DashboardPage from "./pages/customer/DashboardPage";
import AppointmentsPage from "./pages/customer/AppointmentsPage";
import TestResultsPage from "./pages/customer/TestResultsPage";
import MedicationsPage from "./pages/customer/MedicationsPage";
import CustomerResourcesPage from "./pages/customer/ResourcesPage";
import OnlineConsultationPage from "./pages/customer/OnlineConsultationPage";
import AppointmentSelectionPage from "./pages/customer/AppointmentSelectionPage";
import InvoicesPage from "./pages/customer/InvoicesPage";
import PaymentResultPage from "./pages/customer/PaymentResultPage";

// Các trang cho Bác sĩ
import DoctorDashboardPage from "./pages/doctor/DashboardPage";
import DoctorPatientsPage from "./pages/doctor/PatientsPage";
import DoctorAppointmentsPage from "./pages/doctor/AppointmentsPage";
import DoctorTreatmentPlansPage from "./pages/doctor/TreatmentPlansPage";
import DoctorCalendarPage from "./pages/doctor/DoctorCalendarPage";
import NewTreatmentPlanPage from "./pages/doctor/NewTreatmentPlanPage";
import DoctorOnlineConsultationPage from "./pages/doctor/OnlineConsultationPage";

// Các trang cho Nhân viên
import StaffDashboardPage from "./pages/staff/DashboardPage";
import StaffLabRequestsPage from "./pages/staff/LabRequestsPage";
import StaffAppointmentList from "./pages/staff/StaffAppointmentList";

// ProfilePage component - Placeholder cho trang hồ sơ người dùng
const ProfilePage = () => (
  <Layout currentRole={UserRole.STAFF}>
    <div className="p-8">Trang hồ sơ cá nhân</div>
  </Layout>
);

// Các trang cho Quản lý
import ManagerDashboardPage from "./pages/manager/DashboardPage";
import ManagerDoctorsPage from "./pages/manager/DoctorsPage";
import DoctorSchedulePage from "./pages/manager/DoctorSchedulePage";

// Các trang cho Quản trị
import AdminDashboardPage from "./pages/admin/DashboardPage";
import AdminUsersPage from "./pages/admin/UsersPage";


// Placeholder cho các trang quản trị chưa triển khai
const AdminNewUserPage = () => (
  <Layout currentRole={UserRole.ADMIN}>
    <div className="p-8">Trang thêm người dùng mới</div>
  </Layout>
);
const AdminEditUserPage = () => (
  <Layout currentRole={UserRole.ADMIN}>
    <div className="p-8">Trang chỉnh sửa người dùng</div>
  </Layout>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Các trang Khách */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/resources/support" element={<ResourcesPage />} />
        <Route path="/resources/treatment" element={<ResourcesPage />} />
        <Route path="/resources/living-with-hiv" element={<ResourcesPage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/schedule" element={<PublicSchedulePage />} />

        {/* Các trang Xác thực */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Các trang Bệnh nhân */}
        <Route
          path="/customer"
          element={<Navigate to="/customer/dashboard" replace />}
        />
        
        {/* Payment Result Page */}
        <Route path="/payment-result" element={<PaymentResultPage />} />
        
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/info"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <InfoPage />
            </ProtectedRoute>
          }
        />

        {/* Redirect old dashboard route */}
        <Route
          path="/dashboard"
          element={<Navigate to="/customer/dashboard" replace />}
        />

        {/* Trang lựa chọn loại lịch hẹn */}
        <Route
          path="/customer/appointment-selection"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <AppointmentSelectionPage />
            </ProtectedRoute>
          }
        />

        {/* Lịch hẹn */}
        <Route
          path="/customer/appointments"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <AppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/appointments/upcoming"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <AppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/appointments/history"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <AppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/appointments/new"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <AppointmentsPage />
            </ProtectedRoute>
          }
        />

        {/* Kết quả xét nghiệm */}
        <Route path="/customer/test-results" element={<TestResultsPage />} />
        <Route
          path="/customer/test-results/latest"
          element={<TestResultsPage />}
        />
        <Route
          path="/customer/test-results/history"
          element={<TestResultsPage />}
        />
        <Route
          path="/customer/test-results/compare"
          element={<TestResultsPage />}
        />

        {/* Thuốc */}
        <Route path="/customer/medications" element={<MedicationsPage />} />
        <Route
          path="/customer/medications/current"
          element={<MedicationsPage />}
        />
        <Route
          path="/customer/medications/history"
          element={<MedicationsPage />}
        />
        <Route
          path="/customer/medications/refill"
          element={<MedicationsPage />}
        />

        {/* Hóa đơn */}
        <Route
          path="/customer/invoices"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <InvoicesPage />
            </ProtectedRoute>
          }
        />

        {/* Tài liệu */}
        <Route path="/customer/resources" element={<CustomerResourcesPage />} />
        <Route
          path="/customer/resources/treatment"
          element={<CustomerResourcesPage />}
        />
        <Route
          path="/customer/resources/living-with-hiv"
          element={<CustomerResourcesPage />}
        />
        <Route
          path="/customer/resources/support"
          element={<CustomerResourcesPage />}
        />

        {/* Thông tin cá nhân */}

        <Route path="/customer/support" element={<InfoPage />} />

        {/* Redirect old routes */}
        <Route
          path="/education"
          element={<Navigate to="/resources" replace />}
        />
        <Route
          path="/customer/education"
          element={<Navigate to="/customer/resources" replace />}
        />

        {/* Tư vấn trực tuyến */}
        <Route
          path="/customer/online-consultation"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <OnlineConsultationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/online-consultation/new"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <OnlineConsultationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/appointments/online/:appointmentId"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <OnlineConsultationPage />
            </ProtectedRoute>
          }
        />

        {/* Các trang Bác sĩ */}
        <Route
          path="/doctor"
          element={<Navigate to="/doctor/dashboard" replace />}
        />
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute allowedRoles={["DOCTOR"]}>
              <DoctorDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients"
          element={
            <ProtectedRoute allowedRoles={["DOCTOR"]}>
              <DoctorPatientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/treatment-plans"
          element={
            <ProtectedRoute allowedRoles={["DOCTOR"]}>
              <DoctorTreatmentPlansPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute allowedRoles={["DOCTOR"]}>
              <DoctorAppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments/online/:appointmentId"
          element={
            <ProtectedRoute allowedRoles={["DOCTOR"]}>
              <DoctorOnlineConsultationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/calendar"
          element={
            <ProtectedRoute allowedRoles={["DOCTOR"]}>
              <DoctorCalendarPage />
            </ProtectedRoute>
          }
        />

        {/* Staff Routes */}
        <Route path="/staff">
          <Route path="" element={<Navigate to="/staff/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={["STAFF"]}>
                <StaffDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="lab-requests"
            element={
              <ProtectedRoute allowedRoles={["STAFF"]}>
                <StaffLabRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/staff/appointment" element={<StaffAppointmentList />} />
          <Route
            path="profile"
            element={
              <ProtectedRoute allowedRoles={["STAFF"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Các trang Quản lý */}
        <Route
          path="/manager"
          element={<Navigate to="/manager/dashboard" replace />}
        />
        <Route path="/manager/dashboard" element={<ManagerDashboardPage />} />
        <Route path="/manager/doctors" element={<ManagerDoctorsPage />} />
        <Route
          path="/manager/doctor-schedule"
          element={<DoctorSchedulePage />}
        />

        {/* Các trang Quản trị */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/users/new" element={<AdminNewUserPage />} />
        <Route
          path="/admin/users/:userId/edit"
          element={<AdminEditUserPage />}
        />
    

        {/* Unauthorized Page */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* 404 Page - Must be last */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
