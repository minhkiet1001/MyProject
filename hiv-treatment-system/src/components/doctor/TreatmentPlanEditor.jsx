import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  ClockIcon,
  BeakerIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import TreatmentPlanPatientInfo from './TreatmentPlanPatientInfo';
import medicationService from '../../services/medicationService';
import MedicationScheduleEditor from './MedicationScheduleEditor';

const TreatmentPlanEditor = ({ 
  isOpen,
  onClose,
  onSave, 
  plan = null,
  patient = null,
  appointment = null,
  isEmbedded = false,
  disabled = false
}) => {
  console.log("TreatmentPlanEditor rendered with:", {
    isOpen,
    hasOnClose: !!onClose,
    hasOnSave: !!onSave,
    hasPlan: !!plan,
    hasPatient: !!patient,
    patientId: patient?.id,
    hasAppointment: !!appointment,
    appointmentId: appointment?.id,
    isEmbedded,
    disabled
  });

  // Get doctor name from localStorage or use a default value
  const doctorName = localStorage.getItem('doctorName') || 'Bác sĩ điều trị';

  const [planData, setPlanData] = useState({
    appointmentId: plan?.appointmentId || appointment?.id || null,
    patientId: plan?.patientId || patient?.id || appointment?.userId || null,
    description: plan?.description || '',
    name: plan?.name || '',
    startDate: plan?.startDate || new Date().toISOString().split('T')[0],
    endDate: plan?.endDate || '',
    status: plan?.status || 'ACTIVE',
    medicationNotes: plan?.medicationNotes || '',
    sideEffects: plan?.sideEffects || '',
    healthStatus: plan?.healthStatus || 'STABLE',
    healthNotes: plan?.healthNotes || '',
    medications: plan?.medications || []
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableMedications, setAvailableMedications] = useState([]);
  const [isUnderReview, setIsUnderReview] = useState(appointment?.status === "UNDER_REVIEW");
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Load real medications from the API
  useEffect(() => {
    const fetchMedications = async () => {
      setIsLoading(true);
      try {
        const response = await medicationService.getAllMedications();
        if (response.success && response.data) {
          console.log("Fetched medications from API:", response.data);
          setAvailableMedications(response.data);
        } else {
          console.error("Failed to fetch medications:", response);
        }
      } catch (error) {
        console.error("Error fetching medications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedications();
  }, []);

  
  // Initialize with existing plan data if provided
  useEffect(() => {
    if (plan) {
      setPlanData({
        ...plan,
        startDate: plan.startDate ? new Date(plan.startDate).toISOString().split('T')[0] : '',
        endDate: plan.endDate ? new Date(plan.endDate).toISOString().split('T')[0] : '',
        medications: plan.medications || []
      });
    }
  }, [plan]);

  // Update data when patient or appointment changes
  useEffect(() => {
    console.log("useEffect in TreatmentPlanEditor - Patient or appointment changed:", { patient, appointment });
    
    let updatedData = {};
    
    if (patient) {
      updatedData.patientId = patient.id;
    }
    
    if (appointment) {
      updatedData = {
        ...updatedData,
        appointmentId: appointment.id,
        patientId: appointment.userId,
        // Set default end date to 3 months from now if not set
        endDate: (() => {
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 3);
          return endDate.toISOString().split('T')[0];
        })()
      };
    }
    
    if (Object.keys(updatedData).length > 0) {
      setPlanData(prevData => ({
        ...prevData,
        ...updatedData
      }));
    }
  }, [patient, appointment]);

  // Check for drug interactions and contraindications
  const checkMedicationSafety = (medicationId) => {
    const medication = availableMedications.find(med => med.id === medicationId);
    if (!medication || !patient) return { warnings: [], contraindications: [] };

    const warnings = [];
    const contraindications = [];

    // Check allergies if available in patient data
    if (patient.allergies) {
    patient.allergies.forEach(allergy => {
        if (medication.contraindications && medication.contraindications.some(contra => 
        contra.toLowerCase().includes(allergy.toLowerCase())
      )) {
        contraindications.push(`Dị ứng ${allergy}`);
      }
    });
    }

    // Check comorbidities if available
    if (patient.comorbidities) {
    patient.comorbidities.forEach(condition => {
        if (condition.includes('thận') && medication.contraindications && medication.contraindications.includes('Suy thận nặng')) {
        warnings.push('Cần theo dõi chức năng thận');
      }
        if (condition.includes('gan') && medication.sideEffects && medication.sideEffects.includes('Độc tính gan')) {
        warnings.push('Cần theo dõi chức năng gan');
      }
    });
    }

    // Check interactions with current medications if available
    if (patient.currentMedications) {
      patient.currentMedications.forEach(currentMed => {
        if (medication.interactions && medication.interactions.includes(currentMed.name)) {
        warnings.push(`Tương tác với ${currentMed.name}`);
      }
    });
    }

    return { warnings, contraindications };
  };

  // Get latest test result for a specific test type
  const getLatestTestResult = (testType) => {
    if (!patient || !patient.testResults) return null;
    return patient.testResults.find(result => result.testType === testType);
  };

  const addMedication = () => {
    console.log("Adding new medication to plan");
    // Get doctor name from localStorage
    const currentDoctorName = localStorage.getItem('doctorName') || doctorName || 'Bác sĩ điều trị';
    console.log("Current doctor name for new medication:", currentDoctorName);
    
    const newMedication = {
      medicationId: '',
      dosage: '',
      frequency: 'ONCE_DAILY',
      startDate: planData.startDate || new Date().toISOString().split('T')[0],
      endDate: planData.endDate || '',
      instructions: '',
      prescribedBy: currentDoctorName
    };
    
    console.log("Created new medication with:", newMedication);
    
    setPlanData(prevData => ({
      ...prevData,
      medications: [...prevData.medications, newMedication]
    }));
    
    console.log("Updated medications array:", [...planData.medications, newMedication]);
  };

  const updateMedication = (index, field, value) => {
    const updatedMedications = [...planData.medications];
    
    if (field === 'medicationId') {
      const selectedMed = availableMedications.find(med => med.id === parseInt(value));
      if (selectedMed) {
      updatedMedications[index] = {
        ...updatedMedications[index],
          medicationId: parseInt(value),
          name: selectedMed.name
        };
      }
    } else {
      updatedMedications[index] = { ...updatedMedications[index], [field]: value };
    }
    
    // Ensure prescribedBy is always set
    if (!updatedMedications[index].prescribedBy) {
      updatedMedications[index].prescribedBy = doctorName;
    }
    
    setPlanData({
      ...planData,
      medications: updatedMedications
    });
  };

  const removeMedication = (index) => {
    const updatedMedications = [...planData.medications];
    updatedMedications.splice(index, 1);
    setPlanData({
      ...planData,
      medications: updatedMedications
    });
  };

  const addMonitoring = () => {
    const newMonitoring = {
      id: Date.now(),
      testId: '',
      frequency: '',
      nextDue: '',
      notes: '',
      isActive: true
    };
    
    setPlanData({
      ...planData,
      monitoring: [...planData.monitoring, newMonitoring]
    });
  };

  const updateMonitoring = (index, field, value) => {
    const updatedMonitoring = [...planData.monitoring];
    updatedMonitoring[index] = {
      ...updatedMonitoring[index],
      [field]: value
    };

    // Auto-populate test details when test is selected
    if (field === 'testId') {
      const selectedTest = availableTests.find(test => test.id === value);
      if (selectedTest) {
        updatedMonitoring[index] = {
          ...updatedMonitoring[index],
          name: selectedTest.name,
          frequency: selectedTest.frequency,
          normalRange: selectedTest.normalRange
        };
      }
    }

    setPlanData({
      ...planData,
      monitoring: updatedMonitoring
    });
  };

  const removeMonitoring = (index) => {
    const updatedMonitoring = planData.monitoring.filter((_, i) => i !== index);
    setPlanData({
      ...planData,
      monitoring: updatedMonitoring
    });
  };

  const addGoal = () => {
    const newGoal = {
      id: Date.now(),
      description: '',
      targetDate: '',
      status: 'pending',
      priority: 'medium'
    };
    
    setPlanData({
      ...planData,
      goals: [...planData.goals, newGoal]
    });
  };

  const updateGoal = (index, field, value) => {
    const updatedGoals = [...planData.goals];
    updatedGoals[index] = {
      ...updatedGoals[index],
      [field]: value
    };

    setPlanData({
      ...planData,
      goals: updatedGoals
    });
  };

  const removeGoal = (index) => {
    const updatedGoals = planData.goals.filter((_, i) => i !== index);
    setPlanData({
      ...planData,
      goals: updatedGoals
    });
  };

  const validatePlan = () => {
    const newErrors = {};

    // Basic validation
    if (!planData.patientId) {
      newErrors.patientId = 'Bệnh nhân là trường bắt buộc';
    }
    
    // Check description instead of name (since we use description in the form)
    if (!planData.description) {
      newErrors.description = 'Tên kế hoạch là trường bắt buộc';
    }

    if (!planData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu là trường bắt buộc';
    }
    
    // Validate date ranges
    if (planData.startDate && planData.endDate) {
      const startDate = new Date(planData.startDate);
      const endDate = new Date(planData.endDate);
      
      if (endDate < startDate) {
        newErrors.endDate = 'Ngày kết thúc kế hoạch phải sau ngày bắt đầu';
      }
    }
    
    // Validate medications
    if (planData.medications.length === 0) {
      newErrors.medications = 'Phải có ít nhất một loại thuốc trong kế hoạch';
    } else {
      planData.medications.forEach((medication, index) => {
        if (!medication.medicationId) {
          newErrors[`medication_${index}`] = 'Vui lòng chọn thuốc';
        }
        
        if (!medication.dosage) {
          newErrors[`dosage_${index}`] = 'Vui lòng nhập liều lượng';
      }
      });
    }
    
    // Set errors and return the errors object
    setErrors(newErrors);
    console.log("Validation errors:", newErrors);
    return newErrors;
  };

  const handleSave = async () => {
    try {
    setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      // Basic validation first
      const validationErrors = validatePlan();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsLoading(false);
        return;
      }
      
      // Removed lab results check for the appointment

      console.log("Saving plan data:", planData);
      
      // Format medications array correctly
      const formattedPlan = {
        ...planData,
        medications: planData.medications.map(med => ({
          ...med,
          // Ensure medication ID is a number
          medicationId: med.medicationId ? parseInt(med.medicationId, 10) : null,
          // Ensure dates are in ISO format
          startDate: med.startDate,
          endDate: med.endDate,
          // Ensure prescribedBy is set
          prescribedBy: med.prescribedBy || doctorName
        })).filter(med => med.medicationId)
      };

      console.log("Formatted plan data for saving:", formattedPlan);
      
      if (onSave) {
        await onSave(formattedPlan);
      }
      
      // Clear any form errors
      setErrors({});
      
      // Show success message if not handled by parent
      if (!onSave) {
        setSuccess("Kế hoạch điều trị đã được lưu thành công");
      }
    } catch (err) {
      console.error("Error in handleSave:", err);
      setError(err.message || "Có lỗi xảy ra khi lưu kế hoạch điều trị");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'Thông tin chung', icon: DocumentTextIcon },
    { id: 'medications', name: 'Thuốc điều trị', icon: BeakerIcon },
    { id: 'monitoring', name: 'Theo dõi', icon: ClockIcon }
  ];

  if (!isOpen) return null;

  // Define the content of the component
  const renderContent = () => (
    <>
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
      
      {/* Error and Success Messages */}
      {(Object.keys(errors).length > 0 || success || error) && (
        <div className="mb-4">
          {Object.keys(errors).length > 0 && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 mb-3">
              <p className="font-medium">Vui lòng sửa các lỗi sau:</p>
              <ul className="list-disc list-inside text-sm">
                {errors.description && <li>Tên kế hoạch là trường bắt buộc</li>}
                {errors.patientId && <li>Bệnh nhân là trường bắt buộc</li>}
                {errors.startDate && <li>Ngày bắt đầu là trường bắt buộc</li>}
                {errors.endDate && <li>{errors.endDate}</li>}
                {errors.medications && <li>{errors.medications}</li>}
                {errors.submit && <li>{errors.submit}</li>}
              </ul>
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 mb-3">
              <p>{success}</p>
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 mb-3">
              <p>{error}</p>
            </div>
          )}
        </div>
      )}
          
          {/* Tab Content */}
          <div className="space-y-6">
            {/* General Information Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên kế hoạch <span className="text-red-500">*</span>
              </label>
              <Input
                      value={planData.description}
                      onChange={(e) => setPlanData({...planData, description: e.target.value})}
                      placeholder="VD: Kế hoạch điều trị ARV bậc 1"
                      error={errors.description}
              />
            </div>
            
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái sức khỏe
                    </label>
                    <select
                      value={planData.healthStatus}
                      onChange={(e) => setPlanData({...planData, healthStatus: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="STABLE">Ổn định</option>
                      <option value="IMPROVING">Đang cải thiện</option>
                      <option value="DECLINING">Đang suy giảm</option>
                      <option value="CRITICAL">Nguy kịch</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày bắt đầu
              </label>
              <Input
                type="date"
                value={planData.startDate}
                onChange={(e) => setPlanData({...planData, startDate: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày kết thúc
              </label>
              <Input
                type="date"
                value={planData.endDate}
                onChange={(e) => setPlanData({...planData, endDate: e.target.value})}
                    />
            </div>
          </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú về thuốc
                    </label>
                    <textarea
                      value={planData.medicationNotes}
                      onChange={(e) => setPlanData({...planData, medicationNotes: e.target.value})}
                      placeholder="Ghi chú về thuốc và liệu trình điều trị"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    />
        </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tác dụng phụ cần theo dõi
                    </label>
                    <textarea
                      value={planData.sideEffects}
                      onChange={(e) => setPlanData({...planData, sideEffects: e.target.value})}
                      placeholder="Các tác dụng phụ cần theo dõi trong quá trình điều trị"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    />
                  </div>
      </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú về sức khỏe
                  </label>
                  <textarea
                    value={planData.healthNotes}
                    onChange={(e) => setPlanData({...planData, healthNotes: e.target.value})}
                    placeholder="Ghi chú về tình trạng sức khỏe của bệnh nhân"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
            />
          </div>
              </div>
      )}

            {/* Medications Tab */}
      {activeTab === 'medications' && (
              <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Thuốc điều trị</h3>
              <Button variant="outline" onClick={addMedication}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Thêm thuốc
              </Button>
            </div>

            {/* Guidance box */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-800 mb-2">Hướng dẫn kê đơn thuốc</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                <li>Chọn thuốc từ danh sách có sẵn</li>
                <li>Nhập liều lượng kê đơn (hàm lượng thuốc, ví dụ: 300mg, 200mg/5ml)</li>
                <li>Chọn tần suất sử dụng thuốc phù hợp</li>
                <li>Thiết lập lịch uống thuốc cụ thể với số lượng uống mỗi lần (ví dụ: 1 viên)</li>
                <li>Thêm hướng dẫn sử dụng chi tiết nếu cần</li>
                <li>Đặt ngày bắt đầu và kết thúc (nếu có) cho từng loại thuốc</li>
              </ul>
            </div>

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {errors.medications && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.medications}</p>
              </div>
            )}

            {planData.medications.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Chưa có thuốc nào được thêm vào kế hoạch</p>
                <Button 
                  variant="outline" 
                  onClick={addMedication}
                  className="mt-3"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Thêm thuốc đầu tiên
                </Button>
              </div>
            ) : (
            <div className="space-y-4">
              {planData.medications.map((medication, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-gray-900">Thuốc #{index + 1}</h4>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => removeMedication(index)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Thuốc <span className="text-red-500">*</span>
                      </label>
                      <select
                            value={medication.medicationId || ''}
                        onChange={(e) => updateMedication(index, 'medicationId', e.target.value)}
                        className={`w-full px-2 py-1 text-sm border rounded-md ${
                          errors[`medication_${index}`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                            <option value="">-- Chọn thuốc --</option>
                            {availableMedications.map(med => (
                          <option key={med.id} value={med.id}>
                            {med.name} ({med.genericName || 'Thuốc HIV'})
                          </option>
                        ))}
                      </select>
                      {errors[`medication_${index}`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`medication_${index}`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Liều lượng kê đơn <span className="text-red-500">*</span>
                      </label>
                          <Input
                        value={medication.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                            placeholder="VD: 300mg, 200mg/5ml"
                        className="text-sm"
                            error={errors[`dosage_${index}`]}
                          />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tần suất <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={medication.frequency || 'ONCE_DAILY'}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                          >
                            <option value="ONCE_DAILY">Một lần mỗi ngày</option>
                            <option value="TWICE_DAILY">Hai lần mỗi ngày</option>
                            <option value="THREE_TIMES_DAILY">Ba lần mỗi ngày</option>
                            <option value="FOUR_TIMES_DAILY">Bốn lần mỗi ngày</option>
                        <option value="EVERY_OTHER_DAY">Cách ngày</option>
                        <option value="WEEKLY">Hàng tuần</option>
                        <option value="MONTHLY">Hàng tháng</option>
                      </select>
                    </div>

                    {/* Add MedicationScheduleEditor component here */}
                    {medication.medicationId && (
                      <div className="col-span-2 mt-2">
                        <MedicationScheduleEditor 
                          medicationId={medication.medicationId} 
                          disabled={disabled}
                          onSchedulesUpdated={(schedules) => {
                            console.log("Schedules updated:", schedules);
                            // Optional: Store schedules in medication object if needed
                            updateMedication(index, 'schedules', schedules);
                          }}
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                            Ngày bắt đầu
                      </label>
                          <Input
                            type="date"
                        value={medication.startDate || ''}
                            onChange={(e) => updateMedication(index, 'startDate', e.target.value)}
                        className="text-sm"
                      />
                  </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                            Ngày kết thúc
                      </label>
                      <Input
                            type="date"
                        value={medication.endDate || ''}
                            onChange={(e) => updateMedication(index, 'endDate', e.target.value)}
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Hướng dẫn sử dụng
                      </label>
                      <textarea
                        value={medication.instructions || ''}
                        onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                        placeholder="Hướng dẫn sử dụng thuốc"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        rows="2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Bác sĩ kê đơn
                      </label>
                      <Input
                            value={medication.prescribedBy || doctorName}
                            onChange={(e) => updateMedication(index, 'prescribedBy', e.target.value)}
                        placeholder="Bác sĩ kê đơn"
                        className="text-sm bg-gray-50 font-medium text-gray-700"
                      />
                        </div>
                    </div>
                </div>
              ))}
              </div>
            )}
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tính năng theo dõi đang được phát triển</p>
            </div>
          </div>
        )}
      </div>
    </>
  );

  // Render based on isEmbedded prop
  return isEmbedded ? (
    // Embedded version - just the content
    <div className="space-y-4">
      {/* Success/Error Messages */}
      {success && (
        <div className="mb-3 p-2 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm">
          <div className="flex">
            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
            <p>{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-3 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
          <div className="flex">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {/* General validation errors */}
      {errors.general && (
        <div className="mb-3 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
          <div className="flex">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
            <p>{errors.general}</p>
          </div>
        </div>
      )}
      
      {errors.submit && (
        <div className="mb-3 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
          <div className="flex">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
            <p>{errors.submit}</p>
          </div>
        </div>
      )}

      {/* Simplified content for embedded mode */}
      <div className="space-y-4">
        <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên phác đồ <span className="text-red-500">*</span>
                      </label>
          <Input
            value={planData.description}
            onChange={(e) => setPlanData({...planData, description: e.target.value})}
            placeholder="VD: Kế hoạch điều trị ARV bậc 1"
            error={errors.description}
                      />
                    </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày bắt đầu <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={planData.startDate}
              onChange={(e) => setPlanData({...planData, startDate: e.target.value})}
              error={errors.startDate}
            />
                </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày kết thúc <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={planData.endDate}
              onChange={(e) => setPlanData({...planData, endDate: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thuốc điều trị <span className="text-red-500">*</span>
          </label>
          <div className="flex justify-end mb-2">
                    <Button
                      variant="outline"
                        onClick={addMedication}
              size="sm"
                      >
              <PlusIcon className="h-3 w-3 mr-1" />
                        Thêm thuốc
                  </Button>
                </div>
          
          {planData.medications.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">Chưa có thuốc nào được thêm vào kế hoạch</p>
            </div>
          ) : (
            <div className="space-y-3">
              {planData.medications.map((medication, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-gray-900">Thuốc #{index + 1}</h4>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => removeMedication(index)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Thuốc <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={medication.medicationId || ''}
                        onChange={(e) => updateMedication(index, 'medicationId', e.target.value)}
                        className={`w-full px-2 py-1 text-sm border rounded-md ${
                          errors[`medication_${index}`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">-- Chọn thuốc --</option>
                        {availableMedications.map(med => (
                          <option key={med.id} value={med.id}>
                            {med.name} ({med.genericName || 'Thuốc HIV'})
                          </option>
                        ))}
                      </select>
                      {errors[`medication_${index}`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`medication_${index}`]}</p>
              )}
            </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Liều lượng kê đơn <span className="text-red-500">*</span>
                      </label>
                          <Input
                        value={medication.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                            placeholder="VD: 300mg, 200mg/5ml"
                        className="text-sm"
                            error={errors[`dosage_${index}`]}
                          />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tần suất <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={medication.frequency || 'ONCE_DAILY'}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      >
                        <option value="ONCE_DAILY">Một lần mỗi ngày</option>
                        <option value="TWICE_DAILY">Hai lần mỗi ngày</option>
                        <option value="THREE_TIMES_DAILY">Ba lần mỗi ngày</option>
                        <option value="FOUR_TIMES_DAILY">Bốn lần mỗi ngày</option>
                        <option value="EVERY_OTHER_DAY">Cách ngày</option>
                        <option value="WEEKLY">Hàng tuần</option>
                        <option value="MONTHLY">Hàng tháng</option>
                      </select>
                    </div>

                    {/* Add MedicationScheduleEditor component here */}
                    {medication.medicationId && (
                      <div className="col-span-2 mt-2">
                        <MedicationScheduleEditor 
                          medicationId={medication.medicationId} 
                          disabled={disabled}
                          onSchedulesUpdated={(schedules) => {
                            console.log("Schedules updated:", schedules);
                            // Optional: Store schedules in medication object if needed
                            updateMedication(index, 'schedules', schedules);
                          }}
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                            Ngày bắt đầu
                      </label>
                          <Input
                            type="date"
                        value={medication.startDate || ''}
                            onChange={(e) => updateMedication(index, 'startDate', e.target.value)}
                        className="text-sm"
                      />
                  </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                            Ngày kết thúc
                      </label>
                      <Input
                            type="date"
                        value={medication.endDate || ''}
                            onChange={(e) => updateMedication(index, 'endDate', e.target.value)}
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Hướng dẫn sử dụng
                      </label>
                      <textarea
                        value={medication.instructions || ''}
                        onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                        placeholder="Hướng dẫn sử dụng thuốc"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        rows="2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Bác sĩ kê đơn
                      </label>
                      <Input
                        value={medication.prescribedBy || doctorName}
                        onChange={(e) => updateMedication(index, 'prescribedBy', e.target.value)}
                        placeholder="Bác sĩ kê đơn"
                        className="text-sm bg-gray-50 font-medium text-gray-700"
                      />
                    </div>
                  </div>
                </div>
              ))}
                </div>
            )}
          {errors.medications && (
            <p className="mt-1 text-xs text-red-600">{errors.medications}</p>
          )}
                  </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú
          </label>
          <textarea
            value={planData.medicationNotes}
            onChange={(e) => setPlanData({...planData, medicationNotes: e.target.value})}
            placeholder="Ghi chú về thuốc và liệu trình điều trị"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 text-sm"
            rows="2"
          />
              </div>
                </div>

      {/* Footer */}
      <div className="pt-4 flex justify-end">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isLoading || disabled}
          className="flex items-center"
          size="sm"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang lưu...
            </>
          ) : disabled ? (
            <>
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              Đã lưu kế hoạch
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              Lưu kế hoạch
            </>
            )}
        </Button>
                  </div>
    </div>
  ) : (
    // Full modal version
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold text-gray-800">
            {plan ? 'Chỉnh sửa kế hoạch điều trị' : 'Tạo kế hoạch điều trị mới'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Patient info */}
        <div className="p-4 border-b">
          <TreatmentPlanPatientInfo patient={patient} />
        </div>
        
        {/* Content */}
        <div className="p-6">
          {renderContent()}
                </div>
        
        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
          {errors.submit && (
            <div className="mr-auto p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
          )}
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
        </Button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              console.log("Save button clicked directly");
              handleSave();
            }}
            disabled={isLoading || disabled}
            className={`px-4 py-2 ${disabled ? 'bg-gray-400' : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'} text-white font-medium rounded-md flex items-center transition-colors`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang lưu...</span>
              </>
            ) : disabled ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h1a2 2 0 012 2v7a2 2 0 01-2 2H8a2 2 0 01-2-2v-7a2 2 0 012-2h1v5.586l-1.293-1.293zM15 3a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5a2 2 0 012-2h2z" />
                </svg>
                <span>Đã lưu kế hoạch</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h1a2 2 0 012 2v7a2 2 0 01-2 2H8a2 2 0 01-2-2v-7a2 2 0 012-2h1v5.586l-1.293-1.293zM15 3a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5a2 2 0 012-2h2z" />
                </svg>
                <span>{plan ? 'Cập nhật' : 'Tạo kế hoạch'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TreatmentPlanEditor; 