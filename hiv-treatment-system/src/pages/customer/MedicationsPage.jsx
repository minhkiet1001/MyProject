import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { UserRole } from '../../types/index.js';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import medicationService from '../../services/medicationService';
import authService from '../../services/authService';
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CalendarIcon,
  BellIcon,
  DocumentTextIcon,
  HeartIcon,
  ShieldCheckIcon,
  XMarkIcon,
  EyeIcon,
  BeakerIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const MedicationsPage = () => {
  const [selectedMedicationId, setSelectedMedicationId] = useState(null);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medicationsByTime, setMedicationsByTime] = useState({});
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  // Fetch medications when component mounts
  useEffect(() => {
    fetchMedications();
  }, []);

  // Fetch medications from backend
  const fetchMedications = async () => {
    try {
      setLoading(true);
      const response = await medicationService.getPatientMedications();
      
      if (response.success && response.data) {
        // Process the medications data
        const medsData = response.data.medications || [];
        setMedications(processMedicationsData(medsData));
        
        // Set medications by time if available
        if (response.data.medicationsByTime) {
          setMedicationsByTime(response.data.medicationsByTime);
        }
      } else {
        setError('Failed to load medications data');
      }
    } catch (err) {
      console.error('Error fetching medications:', err);
      setError('Error loading medications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Process medications data from API to match our UI format
  const processMedicationsData = (medsData) => {
    return medsData.map(med => {
      // Extract medication details
      const medication = med.medication || {};
      
      // Convert dates from strings to Date objects
      const startDate = med.startDate ? new Date(med.startDate) : new Date();
      const endDate = med.endDate ? new Date(med.endDate) : null;
      
      // Calculate remaining days until next refill
      const nextRefillDate = calculateNextRefillDate(startDate);
      const remainingDays = calculateRemainingDays(nextRefillDate);
      
      // Determine if medication is active
      const isActive = med.status === 'ACTIVE' || med.status === 'active';
      
      return {
        id: med.id,
        name: medication.name || 'Unknown Medication',
        genericName: medication.genericName || medication.description || '',
        dosage: med.dosage || medication.strength || '',
        frequency: med.frequency || 'As prescribed',
        timing: med.schedules && med.schedules.length > 0 
          ? med.schedules[0].formattedTime || med.schedules[0].timeOfDay || '8:00 AM'
          : '8:00 AM',
        startDate: startDate,
        endDate: endDate,
        purpose: medication.description || 'HIV Treatment',
        prescribedBy: med.prescribedBy || 'Your Doctor',
        instructions: med.instructions || 'Take as directed by your healthcare provider',
        sideEffects: medication.sideEffects 
          ? medication.sideEffects.split(',').map(effect => effect.trim())
          : ['Consult your doctor about possible side effects'],
        isActive: isActive,
        category: medication.category || 'HIV Medication',
        nextRefill: nextRefillDate,
        remainingDays: remainingDays,
        adherenceRate: Math.floor(Math.random() * 20) + 80, // Placeholder for adherence rate
        schedules: med.schedules || []
      };
    });
  };

  // Helper function to calculate next refill date (30 days from start by default)
  const calculateNextRefillDate = (startDate) => {
    const refillDate = new Date(startDate);
    refillDate.setDate(refillDate.getDate() + 30);
    return refillDate;
  };

  // Helper function to calculate remaining days
  const calculateRemainingDays = (targetDate) => {
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Filter active medications
  const activeMedications = medications.filter(med => med.isActive);
  const inactiveMedications = medications.filter(med => !med.isActive);

  // Selected medication details
  const selectedMedication = selectedMedicationId
    ? medications.find(med => med.id === selectedMedicationId)
    : null;

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Generate medication schedule for the week
  const generateWeeklySchedule = () => {
    const schedule = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      const daySchedule = {
        date,
        medications: activeMedications.map(med => ({
          ...med,
          taken: i < 0, // Past days are marked as taken
          time: med.timing
        }))
      };
      
      schedule.push(daySchedule);
    }
    
    return schedule;
  };

  const weeklySchedule = generateWeeklySchedule();

  // Loading state
  if (loading) {
    return (
      <Layout currentRole={UserRole.CUSTOMER} userName={currentUser?.name || "Bệnh nhân"}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin thuốc...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout currentRole={UserRole.CUSTOMER} userName={currentUser?.name || "Bệnh nhân"}>
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl max-w-2xl mx-auto mt-8">
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
            <h2 className="text-xl font-semibold text-red-700">Không thể tải thông tin thuốc</h2>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            variant="primary" 
            className="w-full"
            onClick={fetchMedications}
          >
            Thử lại
          </Button>
        </div>
      </Layout>
    );
  }

  // Modal Component for Medication Details
  const MedicationModal = ({ medication, isOpen, onClose }) => {
    if (!isOpen || !medication) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full mr-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{medication.name}</h2>
                  <p className="text-gray-600">{medication.genericName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <InformationCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Liều lượng:</span>
                      <span className="font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded">{medication.dosage}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Tần suất:</span>
                      <span className="font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded">{medication.frequency}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Thời gian:</span>
                      <span className="font-semibold text-purple-700 bg-purple-100 px-3 py-1 rounded">{medication.timing}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 block mb-1">Mục đích:</span>
                      <span className="text-gray-900 font-medium">{medication.purpose}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Bác sĩ kê đơn:</span>
                      <span className="text-gray-900 font-medium">{medication.prescribedBy}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Danh mục:</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{medication.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Components (for medications with components) */}
            {medication.components && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BeakerIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Thành phần hoạt chất
                </h3>
                <div className="space-y-4">
                  {medication.components.map((component, idx) => (
                    <div key={idx} className="border-l-4 border-blue-300 pl-4 bg-blue-50 p-4 rounded-r-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{component.name}</h4>
                        <span className="text-blue-600 font-bold text-lg">{component.dose}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded">
                          {component.class}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{component.mechanism}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions and Side Effects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  Hướng dẫn sử dụng
                </h3>
                <p className="text-sm text-yellow-700 leading-relaxed">{medication.instructions}</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  Tác dụng phụ có thể gặp
                </h3>
                <div className="space-y-2">
                  {medication.sideEffects.map((effect, idx) => (
                    <div key={idx} className="flex items-start bg-white p-3 rounded-lg">
                      <span className="text-red-500 mr-3 mt-0.5 font-bold">•</span>
                      <span className="text-sm text-red-700">{effect}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Refill and Statistics */}
            {medication.isActive && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Lịch tái khám & nhận thuốc
                  </h3>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-purple-700">Ngày tái khám:</span>
                      <span className="font-semibold text-purple-900">{formatDate(medication.nextRefill)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-700">Còn lại:</span>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded font-medium">
                        {medication.remainingDays} ngày
                      </span>
                    </div>
                  </div>
                </div>

                {medication.adherenceRate && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                      <ShieldCheckIcon className="h-5 w-5 mr-2" />
                      Thống kê tuân thủ
                    </h3>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">{medication.adherenceRate}%</div>
                        <div className="text-sm text-green-700">Tỷ lệ tuân thủ điều trị</div>
                        <div className="mt-3 text-xs text-green-600">
                          Hiệu quả: {medication.effectiveness || 'Rất cao'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Modal Component for Weekly Schedule
  const ScheduleModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <ClockIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Lịch trình uống thuốc tuần này</h2>
                  <p className="text-gray-600">Theo dõi và quản lý lịch uống thuốc hàng ngày</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weeklySchedule.map((day, index) => (
                <div key={index} className={`p-5 rounded-xl border-2 ${
                  index === 0 
                    ? 'bg-blue-50 border-blue-300 shadow-md' 
                    : 'bg-gray-50 border-gray-200 hover:border-blue-200 hover:shadow-sm'
                } transition-all`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {day.date.toLocaleDateString('vi-VN', { weekday: 'long' })}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {day.date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                    {index === 0 && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        Hôm nay
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {day.medications.map((med) => (
                      <div key={med.id} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{med.name}</h4>
                          <div className="flex items-center space-x-2">
                            {day.taken ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            ) : (
                              <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{med.dosage}</span>
                          <span className="bg-gray-100 px-2 py-1 rounded">{med.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal Component for Medication History
  const HistoryModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-gray-100 rounded-full mr-4">
                  <ClockIcon className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Lịch sử thuốc điều trị</h2>
                  <p className="text-gray-600">Các thuốc đã sử dụng trong quá trình điều trị</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {inactiveMedications.length > 0 ? (
              <div className="space-y-4">
                {inactiveMedications.map((medication) => (
                  <div key={medication.id} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-200 rounded-lg">
                          <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{medication.name}</h3>
                          <p className="text-sm text-gray-600">{medication.genericName}</p>
                        </div>
                      </div>
                      <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        Đã ngừng
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Thời gian sử dụng:</div>
                        <div className="font-medium text-gray-900">
                          {medication.startDate.toLocaleDateString('vi-VN')} - {medication.endDate.toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Liều lượng:</div>
                        <div className="font-medium text-gray-900">{medication.dosage}</div>
                      </div>
                    </div>
                    
                    {medication.reasonStopped && (
                      <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                        <div className="text-sm text-blue-600 font-medium mb-1">Lý do ngừng thuốc:</div>
                        <div className="text-sm text-blue-800">{medication.reasonStopped}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có lịch sử thuốc</h3>
                <p className="text-gray-500">Không có thuốc nào đã ngừng sử dụng.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Modal Component for Medication Reminders
  const ReminderModal = ({ isOpen, onClose, medications }) => {
    if (!isOpen) return null;
    
    const [reminderSettings, setReminderSettings] = useState({
      enableReminders: true,
      notifyBeforeMinutes: 15,
      soundEnabled: true,
      vibrateEnabled: true,
      dailyDigest: true,
      digestTime: "20:00"
    });
    
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setReminderSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    };
    
    const saveSettings = () => {
      // Here you would save the settings to your backend
      // For now we'll just simulate success
      setTimeout(() => {
        alert("Cài đặt lời nhắc đã được lưu thành công!");
        onClose();
      }, 500);
  };

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <BellIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Cài đặt lời nhắc uống thuốc</h2>
                  <p className="text-gray-600">Tùy chỉnh thông báo nhắc nhở uống thuốc</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* General Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Cài đặt chung</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Bật lời nhắc uống thuốc</h4>
                  <p className="text-sm text-gray-600">Nhận thông báo khi đến giờ uống thuốc</p>
                </div>
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="enableReminders"
                      className="sr-only peer"
                      checked={reminderSettings.enableReminders}
                      onChange={handleChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Nhắc trước thời gian uống thuốc</h4>
                  <p className="text-sm text-gray-600">Nhận thông báo trước khi đến giờ uống thuốc</p>
                </div>
                <div className="flex items-center">
                  <select
                    name="notifyBeforeMinutes"
                    value={reminderSettings.notifyBeforeMinutes}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  >
                    <option value="0">Đúng giờ</option>
                    <option value="5">5 phút</option>
                    <option value="10">10 phút</option>
                    <option value="15">15 phút</option>
                    <option value="30">30 phút</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Âm thanh</h4>
                  <p className="text-sm text-gray-600">Phát âm thanh khi nhận thông báo</p>
                </div>
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="soundEnabled"
                      className="sr-only peer"
                      checked={reminderSettings.soundEnabled}
                      onChange={handleChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Rung</h4>
                  <p className="text-sm text-gray-600">Rung khi nhận thông báo</p>
                </div>
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="vibrateEnabled"
                      className="sr-only peer"
                      checked={reminderSettings.vibrateEnabled}
                      onChange={handleChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Daily Digest */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Tóm tắt hàng ngày</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Nhận tóm tắt hàng ngày</h4>
                  <p className="text-sm text-gray-600">Nhận thông báo tóm tắt lịch uống thuốc hàng ngày</p>
                </div>
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="dailyDigest"
                      className="sr-only peer"
                      checked={reminderSettings.dailyDigest}
                      onChange={handleChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Thời gian nhận tóm tắt</h4>
                  <p className="text-sm text-gray-600">Chọn thời gian nhận thông báo tóm tắt</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="time"
                    name="digestTime"
                    value={reminderSettings.digestTime}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <Button 
                variant="primary" 
                className="w-full"
                onClick={saveSettings}
              >
                Lưu cài đặt
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout currentRole={UserRole.CUSTOMER} userName={currentUser?.name || "Bệnh nhân"}>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Thuốc điều trị của tôi</h1>
              <p className="text-gray-600 mt-1">Quản lý thuốc và lịch trình điều trị HIV do bác sĩ chỉ định</p>
            </div>
            <div className="flex space-x-3">
              {/* <Button variant="primary" className="flex items-center" onClick={() => setShowReminderModal(true)}>
                <BellIcon className="h-4 w-4 mr-2" />
                Đặt lời nhắc
              </Button> */}
            </div>
          </div>
        </div>

        {/* No medications state */}
        {activeMedications.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <InformationCircleIcon className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có thuốc điều trị</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Hiện tại bạn không có thuốc điều trị nào được chỉ định. Vui lòng liên hệ với bác sĩ của bạn để biết thêm thông tin.
            </p>
            <Button variant="primary">Đặt lịch khám</Button>
          </div>
        )}

        {/* Current Medications - Horizontal Layout */}
        {activeMedications.length > 0 && (
        <Card className="mb-6">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Thuốc điều trị hiện tại theo phác đồ</h2>
                    <p className="text-gray-600 mt-1">Phác đồ điều trị do bác sĩ chỉ định</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {activeMedications.length} thuốc đang dùng
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeMedications.map((medication) => (
                <div 
                  key={medication.id}
                  className="border rounded-xl p-5 cursor-pointer transition-all hover:shadow-md border-gray-200 hover:border-green-200"
                  onClick={() => {
                    setSelectedMedicationId(medication.id);
                    setShowMedicationModal(true);
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{medication.name}</h3>
                        <p className="text-sm text-gray-600">{medication.dosage}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-medium">
                          {medication.timing}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{medication.frequency}</p>
                      </div>
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center p-2 bg-white rounded-lg border">
                      <div className="text-sm font-bold text-blue-600">{medication.remainingDays}</div>
                      <div className="text-xs text-gray-600">Ngày còn lại</div>
                    </div>
                    {medication.adherenceRate && (
                      <div className="text-center p-2 bg-white rounded-lg border">
                        <div className="text-sm font-bold text-purple-600">{medication.adherenceRate}%</div>
                        <div className="text-xs text-gray-600">Tuân thủ</div>
                      </div>
                    )}
                    <div className="text-center p-2 bg-white rounded-lg border">
                      <div className="text-sm font-bold text-green-600">Hiệu quả</div>
                      <div className="text-xs text-gray-600">Rất cao</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {medication.category}
                    </span>
                    <span className="text-gray-600">
                        Bắt đầu: {formatDate(medication.startDate).split(',')[1]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        )}

        {/* Main Content - Simplified Layout with Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Schedule Summary */}
          <Card>
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Lịch hôm nay</h3>
                    <p className="text-gray-600 mt-1">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  </div>
                </div>
                <Button 
                  variant="primary" 
                  className="flex items-center"
                  onClick={() => setShowScheduleModal(true)}
                >
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Xem lịch tuần
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {activeMedications.map((medication) => (
                  <div key={medication.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{medication.name}</h4>
                          <p className="text-sm text-gray-600">{medication.dosage}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-medium">
                            {medication.timing}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{medication.frequency}</p>
                        </div>
                        <div className="h-6 w-6 border-2 border-gray-300 rounded-full hover:border-green-500 cursor-pointer transition-colors"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {medication.category}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedMedicationId(medication.id);
                          setShowMedicationModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Medication History & Actions */}
          <Card>
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <ClockIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Quản lý & Lịch sử</h3>
                    <p className="text-gray-600 mt-1">Theo dõi và quản lý thuốc điều trị</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {/* <Button 
                  variant="outline" 
                  className="flex items-center justify-center"
                  onClick={() => setShowReminderModal(true)}
                >
                  <BellIcon className="h-4 w-4 mr-2" />
                  Đặt lời nhắc
                </Button> */}
              
              </div>

              {/* Medication History */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Lịch sử thuốc</h4>
                  {inactiveMedications.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center"
                      onClick={() => setShowHistoryModal(true)}
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Xem tất cả
                    </Button>
                  )}
                </div>
                
                {inactiveMedications.length > 0 ? (
                  <div className="space-y-3">
                    {inactiveMedications.slice(0, 3).map((medication) => (
                      <div key={medication.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="p-1 bg-gray-200 rounded">
                              <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{medication.name}</h5>
                              <p className="text-xs text-gray-600">{medication.dosage}</p>
                            </div>
                          </div>
                          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                            Đã ngừng
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          <p className="mb-1">
                            {medication.startDate.toLocaleDateString('vi-VN')} - {medication.endDate.toLocaleDateString('vi-VN')}
                          </p>
                          {medication.reasonStopped && (
                            <p className="text-blue-600 font-medium">Lý do: {medication.reasonStopped}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h5 className="text-sm font-medium text-gray-900 mb-1">Chưa có lịch sử thuốc</h5>
                    <p className="text-xs text-gray-500">Không có thuốc nào đã ngừng sử dụng</p>
                  </div>
                )}
              </div>

              {/* Additional Actions */}
              <div className="pt-4 border-t border-gray-200">
                {/* <Button variant="outline" className="w-full flex items-center justify-center text-sm">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                  Báo cáo tác dụng phụ
                </Button> */}
              </div>
            </div>
          </Card>
        </div>

        {/* Educational Content - Simplified */}
        <div className="mt-8">
          <Card>
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <HeartIcon className="h-6 w-6 mr-2 text-indigo-600" />
                Thông tin quan trọng về điều trị HIV
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-5 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 mr-2" />
                    Tầm quan trọng của việc tuân thủ
                  </h4>
                  <p className="text-sm text-green-800 leading-relaxed">
                    Uống thuốc đúng giờ, đúng liều là chìa khóa thành công trong điều trị HIV. 
                    Tuân thủ tốt giúp duy trì tải lượng virus ở mức không phát hiện được, 
                    bảo vệ hệ miễn dịch và ngăn ngừa kháng thuốc.
                  </p>
                </div>

                <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <InformationCircleIcon className="h-5 w-5 mr-2" />
                    U=U: Undetectable = Untransmittable
                  </h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Khi tải lượng virus không phát hiện được (dưới 50 copies/mL), 
                    bạn không thể lây truyền HIV cho người khác qua đường tình dục. 
                    Đây là một trong những thành tựu y học quan trọng nhất.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Components */}
      {selectedMedication && (
        <MedicationModal
          medication={selectedMedication}
          isOpen={showMedicationModal}
          onClose={() => setShowMedicationModal(false)}
        />
      )}

      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />

      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

      <ReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        medications={medications}
      />
    </Layout>
  );
};

export default MedicationsPage;