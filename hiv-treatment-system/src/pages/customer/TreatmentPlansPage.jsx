import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { UserRole } from '../../types/index.js';
import medicalRecordsService from '../../services/medicalRecordsService';
import {
  BeakerIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  HeartIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const TreatmentPlansPage = () => {
  const navigate = useNavigate();
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [activePlans, setActivePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'all'

  // Load treatment plans on component mount
  useEffect(() => {
    loadTreatmentPlans();
  }, []);

  const loadTreatmentPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load both active and all treatment plans
      const [activeResponse, allResponse] = await Promise.all([
        medicalRecordsService.getActiveTreatmentPlans(),
        medicalRecordsService.getTreatmentPlans()
      ]);
      
      if (activeResponse.success) {
        setActivePlans(activeResponse.data || []);
      }
      
      if (allResponse.success) {
        setTreatmentPlans(allResponse.data || []);
      }
      
      if (!activeResponse.success && !allResponse.success) {
        setError('Không thể tải phác đồ điều trị');
      }
    } catch (err) {
      console.error('Error loading treatment plans:', err);
      setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate) return 'N/A';
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} ngày`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} tháng`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return remainingMonths > 0 ? `${years} năm ${remainingMonths} tháng` : `${years} năm`;
    }
  };

  const handleViewDetails = (plan) => {
    setSelectedPlan(plan);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedPlan(null);
    setShowDetailModal(false);
  };

  const getCurrentPlans = () => {
    return activeTab === 'active' ? activePlans : treatmentPlans;
  };

  // Loading state
  if (loading) {
    return (
      <ProtectedRoute>
        <Layout currentRole={UserRole.CUSTOMER}>
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <ArrowPathIcon className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Đang tải phác đồ điều trị...</p>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Error state
  if (error) {
    return (
      <ProtectedRoute>
        <Layout currentRole={UserRole.CUSTOMER}>
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không thể tải dữ liệu</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={loadTreatmentPlans} variant="primary">
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Thử lại
                </Button>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout currentRole={UserRole.CUSTOMER}>
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Phác đồ điều trị</h1>
                <p className="text-gray-600 mt-1">
                  Theo dõi các phác đồ điều trị hiện tại và trong quá khứ
                </p>
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={loadTreatmentPlans} 
                  variant="outline"
                  className="flex items-center"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Làm mới
                </Button>
                <Button 
                  onClick={() => navigate('/customer/appointments')} 
                  variant="primary"
                  className="flex items-center"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Đặt lịch khám
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'active'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Đang điều trị ({activePlans.length})
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'all'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Tất cả ({treatmentPlans.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Treatment Plans List */}
          {getCurrentPlans().length === 0 ? (
            <Card className="text-center py-12">
              <BeakerIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'active' ? 'Chưa có phác đồ điều trị hiện tại' : 'Chưa có phác đồ điều trị'}
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'active' 
                  ? 'Bạn hiện tại chưa có phác đồ điều trị nào đang được thực hiện.'
                  : 'Bạn chưa có phác đồ điều trị nào được ghi nhận trong hệ thống.'
                }
              </p>
              <Button 
                onClick={() => navigate('/customer/appointments')} 
                variant="primary"
              >
                Đặt lịch tư vấn điều trị
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {getCurrentPlans().map((plan, index) => (
                <Card key={plan.id || index} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                          <BeakerIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Phác đồ điều trị #{plan.id}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              medicalRecordsService.getTreatmentPlanStatusColor(plan.status)
                            }`}>
                              {plan.statusName || medicalRecordsService.getTreatmentPlanStatusText(plan.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Mã cuộc hẹn: #{plan.appointmentId}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Doctor Information - only show if available */}
                        {plan.doctorName && (
                          <div className="flex items-center text-sm text-gray-600">
                            <UserIcon className="h-4 w-4 mr-2" />
                            <div>
                              <span className="font-medium">Bác sĩ:</span>
                              <br />
                              <span>{plan.doctorName}</span>
                            </div>
                          </div>
                        )}

                        {/* Service Name */}
                        {plan.serviceName && (
                          <div className="flex items-center text-sm text-gray-600">
                            <HeartIcon className="h-4 w-4 mr-2" />
                            <div>
                              <span className="font-medium">Dịch vụ:</span>
                              <br />
                              <span>{plan.serviceName}</span>
                            </div>
                          </div>
                        )}

                        {/* Appointment Date */}
                        {plan.appointmentDate && (
                          <div className="flex items-center text-sm text-gray-600">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            <div>
                              <span className="font-medium">Ngày khám:</span>
                              <br />
                              <span>{formatDate(plan.appointmentDate)}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          <div>
                            <span className="font-medium">Bắt đầu:</span>
                            <br />
                            <span>{formatDate(plan.startDate)}</span>
                          </div>
                        </div>
                        
                        {plan.endDate && (
                          <div className="flex items-center text-sm text-gray-600">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            <div>
                              <span className="font-medium">Kết thúc:</span>
                              <br />
                              <span>{formatDate(plan.endDate)}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center text-sm text-gray-600">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          <div>
                            <span className="font-medium">Thời gian:</span>
                            <br />
                            <span>
                              {plan.durationDays 
                                ? `${plan.durationDays} ngày` 
                                : calculateDuration(plan.startDate, plan.endDate)
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Treatment Description */}
                      {plan.description && (
                        <div className="mb-4">
                          <span className="text-sm font-medium text-gray-700">Mô tả điều trị: </span>
                          <span className="text-sm text-gray-600">
                            {plan.description.length > 150 
                              ? `${plan.description.substring(0, 150)}...` 
                              : plan.description
                            }
                          </span>
                        </div>
                      )}

                      {/* Medication Notes */}
                      {plan.medicationNotes && (
                        <div className="mb-4">
                          <span className="text-sm font-medium text-gray-700">Ghi chú thuốc: </span>
                          <span className="text-sm text-gray-600">
                            {plan.medicationNotes.length > 100 
                              ? `${plan.medicationNotes.substring(0, 100)}...` 
                              : plan.medicationNotes
                            }
                          </span>
                        </div>
                      )}

                      {/* Next Appointment */}
                      {plan.nextAppointmentDate && (
                        <div className="flex items-center text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          <span>
                            <strong>Lịch hẹn tiếp theo:</strong> {formatDate(plan.nextAppointmentDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      <Button
                        onClick={() => handleViewDetails(plan)}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Chi tiết
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Detail Modal */}
          {showDetailModal && selectedPlan && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Chi tiết phác đồ điều trị #{selectedPlan.id}
                    </h2>
                    <button
                      onClick={closeDetailModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Status and Basic Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Thông tin cơ bản
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Trạng thái:</span>
                          <p className="text-sm mt-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              medicalRecordsService.getTreatmentPlanStatusColor(selectedPlan.status)
                            }`}>
                              {selectedPlan.statusName || medicalRecordsService.getTreatmentPlanStatusText(selectedPlan.status)}
                            </span>
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Mã cuộc hẹn:</span>
                          <p className="text-sm text-gray-900 mt-1">#{selectedPlan.appointmentId}</p>
                        </div>
                        
                        {/* Doctor Information - only show if available */}
                        {selectedPlan.doctorName && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Bác sĩ điều trị:</span>
                            <p className="text-sm text-gray-900 mt-1 flex items-center">
                              <UserIcon className="h-4 w-4 mr-1 text-blue-600" />
                              {selectedPlan.doctorName}
                            </p>
                          </div>
                        )}

                        {/* Service Name */}
                        {selectedPlan.serviceName && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Dịch vụ:</span>
                            <p className="text-sm text-gray-900 mt-1 flex items-center">
                              <HeartIcon className="h-4 w-4 mr-1 text-green-600" />
                              {selectedPlan.serviceName}
                            </p>
                          </div>
                        )}

                        {/* Appointment Date */}
                        {selectedPlan.appointmentDate && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Ngày khám ban đầu:</span>
                            <p className="text-sm text-gray-900 mt-1">{formatDate(selectedPlan.appointmentDate)}</p>
                          </div>
                        )}

                        <div>
                          <span className="text-sm font-medium text-gray-700">Ngày bắt đầu điều trị:</span>
                          <p className="text-sm text-gray-900 mt-1">{formatDate(selectedPlan.startDate)}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Ngày kết thúc:</span>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedPlan.endDate ? formatDate(selectedPlan.endDate) : 'Chưa xác định'}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Thời gian điều trị:</span>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedPlan.durationDays 
                              ? `${selectedPlan.durationDays} ngày` 
                              : calculateDuration(selectedPlan.startDate, selectedPlan.endDate)
                            }
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Ngày tạo:</span>
                          <p className="text-sm text-gray-900 mt-1">{formatDate(selectedPlan.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Treatment Description */}
                    {selectedPlan.description && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Mô tả phác đồ điều trị
                        </h3>
                        <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">
                          {selectedPlan.description}
                        </p>
                      </div>
                    )}

                    {/* Medication Notes */}
                    {selectedPlan.medicationNotes && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Ghi chú về thuốc
                        </h3>
                        <p className="text-gray-700 bg-green-50 p-4 rounded-lg">
                          {selectedPlan.medicationNotes}
                        </p>
                      </div>
                    )}

                    {/* Side Effects */}
                    {selectedPlan.sideEffects && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Tác dụng phụ và lưu ý
                        </h3>
                        <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg">
                          {selectedPlan.sideEffects}
                        </p>
                      </div>
                    )}

                    {/* Next Appointment */}
                    {selectedPlan.nextAppointmentDate && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Lịch hẹn tiếp theo
                        </h3>
                        <div className="flex items-center text-blue-600 bg-blue-50 p-4 rounded-lg">
                          <CalendarIcon className="h-5 w-5 mr-3" />
                          <div>
                            <p className="font-medium">
                              {formatDate(selectedPlan.nextAppointmentDate)}
                            </p>
                            <p className="text-sm text-blue-500">
                              Vui lòng đến đúng giờ để theo dõi tiến triển điều trị
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Thời gian cập nhật
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tạo lúc:</span>
                          <span className="text-gray-900">{formatDateTime(selectedPlan.createdAt)}</span>
                        </div>
                        {selectedPlan.updatedAt && selectedPlan.updatedAt !== selectedPlan.createdAt && (
                          <div className="flex justify-between text-sm mt-2">
                            <span className="text-gray-600">Cập nhật lúc:</span>
                            <span className="text-gray-900">{formatDateTime(selectedPlan.updatedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <Button onClick={closeDetailModal} variant="outline">
                      Đóng
                    </Button>
                    <Button 
                      onClick={() => navigate('/customer/test-results')} 
                      variant="primary"
                    >
                      Xem kết quả xét nghiệm
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default TreatmentPlansPage; 