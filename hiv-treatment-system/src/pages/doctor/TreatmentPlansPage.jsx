import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { UserRole } from '../../types/index.js';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TreatmentPlanEditor from '../../components/doctor/TreatmentPlanEditor';
import PatientSelector from '../../components/doctor/PatientSelector';
import doctorTreatmentService from '../../services/doctorTreatmentService';
import medicationService from '../../services/medicationService';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  BeakerIcon,
  CalendarIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const TreatmentPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientSelector, setShowPatientSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMedicationsModal, setShowMedicationsModal] = useState(false);
  const [currentMedications, setCurrentMedications] = useState([]);
  const [selectedPlanForMedications, setSelectedPlanForMedications] = useState(null);
  const [loadingMedications, setLoadingMedications] = useState(false);

  // Load treatment plans and patients data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Load treatment plans with optional filters
        const plansResponse = await doctorTreatmentService.getTreatmentPlans(
          statusFilter !== 'all' ? statusFilter : null,
          searchTerm || null
        );
        
        if (plansResponse.success && plansResponse.data) {
          setPlans(plansResponse.data);
          setFilteredPlans(plansResponse.data);
        } else {
          setError('Không thể tải danh sách phác đồ điều trị');
        }
        
        // Load patients available for treatment plans
        const patientsResponse = await doctorTreatmentService.getPatientsForTreatmentPlan();
        if (patientsResponse.success && patientsResponse.data) {
          // Add additional flags for UI display
          const enhancedPatients = patientsResponse.data.map(patient => ({
            ...patient,
            hasCompletedAppointment: true, // We assume if they're in this list they have completed appointments
          }));
          setPatients(enhancedPatients);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [statusFilter, searchTerm]);

  // Apply filters when searchTerm or statusFilter changes
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const refreshData = () => {
    // Re-fetch data with current filters
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const plansResponse = await doctorTreatmentService.getTreatmentPlans(
          statusFilter !== 'all' ? statusFilter : null,
          searchTerm || null
        );
        
        if (plansResponse.success && plansResponse.data) {
          setPlans(plansResponse.data);
          setFilteredPlans(plansResponse.data);
        } else {
          setError('Không thể tải danh sách phác đồ điều trị');
        }
      } catch (err) {
        console.error("Error refreshing data:", err);
        setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  };

  const handleCreatePlan = () => {
    console.log("Create plan button clicked");
    console.log("Current patients:", patients);
    console.log("Patients array length:", patients.length);
    
    // Check if patient data is loaded
    if (!patients || patients.length === 0) {
      console.log("No patients available, attempting to load data");
      
      // Try to load patients if not available
      doctorTreatmentService.getPatientsForTreatmentPlan()
        .then(response => {
          if (response.success && response.data) {
            const enhancedPatients = response.data.map(patient => ({
              ...patient,
              hasCompletedAppointment: true,
            }));
            setPatients(enhancedPatients);
            
            // Now proceed with selection
            setEditingPlan(null);
            setSelectedPatient(null);
            setError(null);
            setShowPatientSelector(true);
          } else {
            setError("Không thể tải danh sách bệnh nhân. Vui lòng thử lại sau.");
          }
        })
        .catch(err => {
          console.error("Error loading patients:", err);
          setError("Đã xảy ra lỗi khi tải danh sách bệnh nhân: " + (err.message || "Unknown error"));
        });
      
      return;
    }
    
    setEditingPlan(null);
    setSelectedPatient(null);
    setError(null);
    setShowPatientSelector(true);
    console.log("showPatientSelector set to:", true);
  };

  const handleSelectPatient = (patient) => {
    console.log("HandleSelectPatient called with patient:", patient);
    
    // First update the patient
    setSelectedPatient(patient);
    
    // Then close the patient selector
    setShowPatientSelector(false);
    
    // Ensure we don't have an editing plan (we're creating a new one)
    setEditingPlan(null);
    
    // Finally, show the editor with a slight delay to ensure state updates
    console.log("Setting showEditor to true");
    setTimeout(() => {
    setShowEditor(true);
      console.log("ShowEditor set to true!");
    }, 10);
    
    // Log state after update to verify
    setTimeout(() => {
      console.log("State after patient selection: ", {
        showEditor,
        showPatientSelector,
        patientId: selectedPatient?.id
      });
    }, 100);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    // Create patient object from plan data
    if (plan.patientId && plan.patientName) {
      const patientFromPlan = {
        id: plan.patientId,
        name: plan.patientName,
      };
      setSelectedPatient(patientFromPlan);
    } else if (plan.patientId) {
      // If only patientId is available, look up in patients list
      const patient = patients.find(p => p.id === plan.patientId);
      if (patient) {
    setSelectedPatient(patient);
      }
    }
    setShowEditor(true);
  };

  const handleViewMedications = async (plan) => {
    setSelectedPlanForMedications(plan);
    setLoadingMedications(true);
    try {
      const response = await medicationService.getMedicationsByTreatmentPlan(plan.id);
      if (response.success && response.data) {
        setCurrentMedications(response.data);
      } else {
        setCurrentMedications([]);
      }
    } catch (err) {
      console.error("Error loading medications:", err);
      setCurrentMedications([]);
    } finally {
      setLoadingMedications(false);
      setShowMedicationsModal(true);
    }
  };

  const handleSavePlan = async (planData) => {
    console.log("handleSavePlan called in TreatmentPlansPage with data:", planData);
    setIsLoading(true);
    setError(null);
    try {
      let response;
      
    if (editingPlan) {
        // Update existing plan
        console.log("Updating existing plan:", editingPlan.id);
        response = await doctorTreatmentService.updateTreatmentPlan(
          editingPlan.id,
          planData
        );
        
        if (response.success) {
          // Update medications if provided
          if (planData.medications && planData.medications.length > 0) {
            console.log("Updating medications for plan:", editingPlan.id);
            const medicationResponse = await doctorTreatmentService.addMultipleMedicationsToTreatmentPlan(
              editingPlan.id,
              planData.medications
            );
            
            // Check if there was an error adding medications
            if (!medicationResponse.success) {
              console.error("Error adding medications:", medicationResponse);
              setError(medicationResponse.message || 'Không thể thêm thuốc vào phác đồ điều trị');
              setIsLoading(false);
              return;
            }
          }
          
          console.log("Plan updated successfully");
          alert(`Đã cập nhật phác đồ điều trị thành công cho bệnh nhân ${selectedPatient?.name || 'đã chọn'}`);
        } else {
          // Show error message and keep editor open if there was an error
          console.error("Error updating plan:", response);
          setError(response.message || 'Không thể cập nhật phác đồ điều trị');
          setIsLoading(false);
          return;
        }
    } else {
        // Create new plan with appointment ID
        console.log("Creating new treatment plan for patient:", planData.patientId);
        const appointmentId = planData.appointmentId;
        
        // If no appointmentId provided, try to find one for this patient
        if (!appointmentId) {
          console.log("No appointmentId provided, looking for completed appointments");
          // Find a completed appointment for this patient
          const appointmentsResponse = await doctorTreatmentService.getCompletedAppointments(planData.patientId);
          if (appointmentsResponse.success && appointmentsResponse.data && appointmentsResponse.data.length > 0) {
            // Use the most recent completed appointment
            console.log("Found completed appointment:", appointmentsResponse.data[0]);
            planData.appointmentId = appointmentsResponse.data[0].id;
          } else {
            // Show error if no appointment is available
            console.error("No completed appointments found");
            
            // Ask if user wants to proceed without an appointment
            if (window.confirm('Không tìm thấy cuộc hẹn hoàn thành nào cho bệnh nhân này. Bạn có muốn tạo phác đồ điều trị mà không liên kết với cuộc hẹn không?')) {
              // Proceed without appointment - this will use a default value or null on backend
              console.log("Proceeding without appointment link");
              planData.skipAppointmentCheck = true;
            } else {
              // User canceled, show error message and stop
              setError('Cần có ít nhất một cuộc hẹn đã hoàn thành để tạo phác đồ điều trị');
              setIsLoading(false);
              return;
            }
          }
        }

        // Create a separate medications array
        const medications = [...(planData.medications || [])];
        console.log("Medications to add:", medications.length);
        
        // Remove medications from the main payload
        const planDataWithoutMeds = {...planData};
        delete planDataWithoutMeds.medications;
        
        // Create the treatment plan
        console.log("Creating treatment plan with data:", planDataWithoutMeds);
        response = await doctorTreatmentService.createTreatmentPlan(planDataWithoutMeds);
        console.log("Create treatment plan response:", response);
        
        if (response.success && response.data) {
          // Show success message
          console.log("Plan created successfully with ID:", response.data.id);
          alert(`Đã tạo phác đồ điều trị mới thành công cho bệnh nhân ${selectedPatient?.name || 'đã chọn'}`);
          
          if (medications.length > 0) {
          // Add medications to the newly created plan
            console.log("Adding medications to new plan");
            try {
              const medicationResponse = await doctorTreatmentService.addMultipleMedicationsToTreatmentPlan(
            response.data.id,
                medications
              );
              
              // Check if there was an error adding medications
              if (!medicationResponse.success) {
                console.warn("Error adding medications to new plan:", medicationResponse);
                alert(`Lưu ý: Phác đồ đã được tạo nhưng có lỗi khi thêm thuốc: ${medicationResponse.message || 'Vui lòng thêm thuốc thủ công sau'}`);
              } else {
                console.log("Medications added successfully");
              }
            } catch (medError) {
              console.error("Exception when adding medications:", medError);
              alert(`Phác đồ đã được tạo thành công nhưng không thể thêm thuốc: ${medError.message || 'Vui lòng thêm thuốc thủ công sau'}`);
            }
          }
        } else if (!response.success) {
          console.error("Error creating treatment plan:", response);
          if (response.message?.includes("appointment")) {
            // Handle specific appointment-related errors
            setError("Không thể tạo phác đồ điều trị: Lỗi liên quan đến cuộc hẹn. " + 
              "Vui lòng đảm bảo bệnh nhân có ít nhất một cuộc hẹn đã hoàn thành.");
          } else {
            setError(response.message || 'Không thể tạo phác đồ điều trị');
          }
          setIsLoading(false);
          return;
        }
      }
      
        // Refresh the plans list
      console.log("Refreshing data after save");
        refreshData();
        // Close the editor
      console.log("Closing editor");
    setShowEditor(false);
    setEditingPlan(null);
    setSelectedPatient(null);
    } catch (err) {
      console.error("Error in handleSavePlan:", err);
      setError(err.message || 'Đã xảy ra lỗi khi lưu phác đồ điều trị');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phác đồ điều trị này?')) {
      setIsLoading(true);
      try {
        const response = await doctorTreatmentService.deleteTreatmentPlan(planId);
        
        if (response.success) {
          // Remove deleted plan from state
      setPlans(plans.filter(plan => plan.id !== planId));
          setFilteredPlans(filteredPlans.filter(plan => plan.id !== planId));
        } else {
          setError('Không thể xóa phác đồ điều trị');
        }
      } catch (err) {
        console.error("Error deleting treatment plan:", err);
        setError(err.message || 'Đã xảy ra lỗi khi xóa phác đồ điều trị');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDiscontinuePlan = async (planId) => {
    if (window.confirm('Bạn có chắc chắn muốn ngừng phác đồ điều trị này?')) {
      setIsLoading(true);
      try {
        console.log(`Attempting to discontinue treatment plan ${planId}`);
        const plan = plans.find(p => p.id === planId);
        console.log('Current plan data:', plan);
        
        // Ensure the plan is not already discontinued
        if (plan && plan.status === 'DISCONTINUED') {
          console.log('Plan is already discontinued');
          setError('Phác đồ này đã được ngừng trước đó');
          setIsLoading(false);
          return;
        }
        
        const response = await doctorTreatmentService.updateTreatmentPlanStatus(planId, 'DISCONTINUED');
        console.log('Discontinue response:', response);
        
        if (response && response.success) {
          // Update plan status in state
          const updatedPlans = plans.map(plan => 
            plan.id === planId ? { ...plan, status: 'DISCONTINUED' } : plan
          );
          setPlans(updatedPlans);
          
          // Update filtered plans based on current filter
          if (statusFilter !== 'all' && statusFilter !== 'DISCONTINUED') {
            // If current filter is not 'all' or 'DISCONTINUED', remove the plan from filtered view
            setFilteredPlans(filteredPlans.filter(plan => plan.id !== planId));
          } else {
            // Otherwise update the plan in filtered view
            setFilteredPlans(filteredPlans.map(plan => 
              plan.id === planId ? { ...plan, status: 'DISCONTINUED' } : plan
            ));
          }
          
          // Show success message
          alert('Phác đồ đã được ngừng thành công');
        } else {
          console.error('Failed to discontinue plan:', response);
          setError(response?.message || 'Không thể ngừng phác đồ điều trị');
        }
      } catch (err) {
        console.error("Error discontinuing treatment plan:", err);
        setError(err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi ngừng phác đồ điều trị');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpdateStatus = async (planId, newStatus) => {
    // Confirm status change with appropriate message
    let confirmMessage = '';
    switch (newStatus) {
      case 'ACTIVE':
        confirmMessage = 'Bạn có chắc chắn muốn đánh dấu phác đồ này là đang điều trị?';
        break;
      case 'PAUSED':
        confirmMessage = 'Bạn có chắc chắn muốn tạm dừng phác đồ này?';
        break;
      case 'COMPLETED':
        confirmMessage = 'Bạn có chắc chắn muốn đánh dấu phác đồ này là đã hoàn thành?';
        break;
      case 'DISCONTINUED':
        confirmMessage = 'Bạn có chắc chắn muốn ngừng phác đồ này? Hành động này không thể hoàn tác.';
        break;
      default:
        confirmMessage = `Bạn có chắc chắn muốn thay đổi trạng thái phác đồ thành "${newStatus}"?`;
    }
    
    if (!window.confirm(confirmMessage)) {
      // Reset the select dropdown to current status
      const currentPlan = plans.find(p => p.id === planId);
      if (currentPlan) {
        // Force re-render to reset dropdown
        setFilteredPlans([...filteredPlans]);
      }
      return;
    }
    
    setIsLoading(true);
    try {
      console.log(`Updating treatment plan ${planId} status to ${newStatus}`);
      const response = await doctorTreatmentService.updateTreatmentPlanStatus(planId, newStatus);
      console.log('Status update response:', response);
      
      if (response && response.success) {
        // Update plan status in state
        const updatedPlans = plans.map(plan => 
          plan.id === planId ? { ...plan, status: newStatus } : plan
        );
        setPlans(updatedPlans);
        
        // Update filtered plans based on current filter
        if (statusFilter !== 'all' && statusFilter !== newStatus) {
          // If current filter doesn't match new status, remove the plan from filtered view
          setFilteredPlans(filteredPlans.filter(plan => plan.id !== planId));
        } else {
          // Otherwise update the plan in filtered view
          setFilteredPlans(filteredPlans.map(plan => 
            plan.id === planId ? { ...plan, status: newStatus } : plan
          ));
        }
        
        // Show success message with appropriate text
        let successMessage = '';
        switch (newStatus) {
          case 'ACTIVE':
            successMessage = 'Phác đồ đã được đánh dấu là đang điều trị';
            break;
          case 'PAUSED':
            successMessage = 'Phác đồ đã được tạm dừng';
            break;
          case 'COMPLETED':
            successMessage = 'Phác đồ đã được đánh dấu là hoàn thành';
            break;
          case 'DISCONTINUED':
            successMessage = 'Phác đồ đã được ngừng';
            break;
          default:
            successMessage = 'Trạng thái phác đồ đã được cập nhật';
        }
        alert(successMessage);
      } else {
        console.error('Failed to update plan status:', response);
        setError(response?.message || 'Không thể cập nhật trạng thái phác đồ điều trị');
        
        // Reset the select dropdown to current status
        const currentPlan = plans.find(p => p.id === planId);
        if (currentPlan) {
          // Force re-render to reset dropdown
          setFilteredPlans([...filteredPlans]);
        }
      }
    } catch (err) {
      console.error("Error updating treatment plan status:", err);
      setError(err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi cập nhật trạng thái');
      
      // Reset the select dropdown to current status
      const currentPlan = plans.find(p => p.id === planId);
      if (currentPlan) {
        // Force re-render to reset dropdown
        setFilteredPlans([...filteredPlans]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Status display helpers
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'discontinued':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Đang điều trị';
      case 'completed':
        return 'Hoàn thành';
      case 'discontinued':
        return 'Đã ngừng';
      case 'paused':
        return 'Tạm dừng';
      default:
        return status || 'Không xác định';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout currentRole={UserRole.DOCTOR}>
        <div className="p-4 flex justify-center items-center h-screen">
          <div className="text-center">
            <ArrowPathIcon className="animate-spin h-10 w-10 mx-auto text-blue-600" />
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout currentRole={UserRole.DOCTOR}>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-600 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
            <h2 className="text-lg font-semibold">Thông báo</h2>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex space-x-3">
          <Button variant="primary" onClick={refreshData}>
            <ArrowPathIcon className="h-5 w-5 mr-2" />
              Làm mới
            </Button>
            <Button variant="outline" onClick={() => setError(null)}>
              <XMarkIcon className="h-5 w-5 mr-2" />
              Đóng
                        </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentRole={UserRole.DOCTOR}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Quản lý phác đồ điều trị</h1>
            <p className="text-gray-600">Quản lý và theo dõi phác đồ điều trị của bệnh nhân</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={refreshData}>
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Làm mới
            </Button>
            <button 
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-md flex items-center shadow-md"
              onClick={() => {
                console.log("Raw button clicked");
                handleCreatePlan();
              }}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Tạo phác đồ điều trị mới
            </button>
          </div>
        </div>
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-gray-500 hover:text-gray-700 ml-2"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Filter and Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Tìm kiếm phác đồ điều trị..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
        </div>
            <div className="flex">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={handleFilterChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-2 sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang điều trị</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="DISCONTINUED">Đã ngừng</option>
                  <option value="PAUSED">Tạm dừng</option>
                </select>
                </div>
              </div>
            </div>
        </div>

        {/* Treatment Plans List */}
        <div className="space-y-4">
          {filteredPlans.length === 0 ? (
            <Card className="p-6 text-center">
              <BeakerIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Không tìm thấy phác đồ điều trị</h3>
              <p className="text-gray-500 mt-2">
                {searchTerm
                  ? 'Không có kết quả phù hợp với tìm kiếm của bạn.'
                  : statusFilter !== 'all'
                  ? `Không có phác đồ điều trị nào với trạng thái "${getStatusText(statusFilter)}".`
                  : 'Chưa có phác đồ điều trị nào được tạo.'}
              </p>
              {searchTerm || statusFilter !== 'all' ? (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                >
                  Xóa bộ lọc
                </Button>
              ) : (
                <Button variant="primary" className="mt-4" onClick={handleCreatePlan}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Tạo phác đồ điều trị mới
                </Button>
              )}
            </Card>
            ) : (
            filteredPlans.map((plan) => (
              <Card key={plan.id} className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                      <div className="flex-1">
                    <div className="flex items-center">
                      <BeakerIcon className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-bold">
                          {plan.description ? plan.description.length > 50 
                            ? plan.description.substring(0, 50) + '...' 
                            : plan.description 
                            : `Phác đồ điều trị HIV #${plan.id}`} 
                        </h3>
                        <p className="text-sm text-gray-600"> Bệnh nhân: {""}
                          {plan.patientName || 'Không có thông tin bệnh nhân'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Trạng thái</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium mt-1 inline-flex items-center w-fit ${getStatusColor(plan.status)}`}>
                            {getStatusText(plan.status)}
                          </span>
                </div>

                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Ngày bắt đầu</span>
                        <span className="text-sm font-medium">{new Date(plan.startDate).toLocaleDateString('vi-VN')}</span>
                    </div>

                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">Ngày kết thúc</span>
                        <span className="text-sm font-medium">
                          {plan.endDate ? new Date(plan.endDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                        </span>
                    </div>
                      
                      {plan.nextAppointmentDate && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">Lịch hẹn tiếp theo</span>
                          <span className="text-sm font-medium">{new Date(plan.nextAppointmentDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      )}
                    </div>

                    {plan.description && (
                      <div className="mt-4">
                        <span className="text-xs text-gray-500">Mô tả</span>
                        <p className="text-sm text-gray-700 line-clamp-2">{plan.description}</p>
                          </div>
                        )}
                </div>

                  <div className="flex flex-row lg:flex-col gap-2 mt-4 lg:mt-0 justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                      className="flex items-center"
                          onClick={() => handleViewMedications(plan)}
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Xem thuốc
                    </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className={`flex items-center ${plan.status === 'COMPLETED' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => plan.status !== 'COMPLETED' && handleEditPlan(plan)}
                          disabled={plan.status === 'COMPLETED'}
                          title={plan.status === 'COMPLETED' ? 'Không thể chỉnh sửa phác đồ đã hoàn thành' : ''}
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          {plan.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Chỉnh sửa'}
                    </Button>
                        
                        <div className="relative">
                          <select
                            className={`w-full px-3 py-2 text-sm border rounded-md ${
                              plan.status === 'DISCONTINUED' ? 'bg-gray-100 text-gray-500' : 'bg-white'
                            }`}
                            value={plan.status}
                            onChange={(e) => handleUpdateStatus(plan.id, e.target.value)}
                            disabled={plan.status === 'DISCONTINUED'}
                          >
                            <option value="ACTIVE">Đang điều trị</option>
                            <option value="PAUSED">Tạm dừng</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="DISCONTINUED">Ngừng phác đồ</option>
                          </select>
                        </div>
                  </div>
                </div>
              </Card>
            ))
          )}
                </div>
      </div>

      {/* Treatment Plan Editor */}
      {(() => {
        console.log("Treatment Plan Editor render check - showEditor:", showEditor, "selectedPatient:", selectedPatient);
        return showEditor && (
        <TreatmentPlanEditor
          isOpen={showEditor}
            onClose={() => {
              console.log("Closing editor");
              setShowEditor(false);
            }}
          onSave={handleSavePlan}
          plan={editingPlan}
          patient={selectedPatient}
        />
        );
      })()}

      {/* Patient Selector Modal */}
      {showPatientSelector ? (
        <PatientSelector 
          patients={patients || []} 
          onSelect={(patient) => {
            console.log("Patient selected:", patient);
            handleSelectPatient(patient);
          }} 
          onClose={() => {
            console.log("Closing patient selector");
            setShowPatientSelector(false);
          }}
          title="Chọn bệnh nhân để tạo phác đồ điều trị"
        />
      ) : null}

      {/* Medications Modal */}
      {showMedicationsModal && selectedPlanForMedications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Danh sách thuốc điều trị</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Phác đồ:</span> {selectedPlanForMedications.description || `#${selectedPlanForMedications.id}`} - 
                    <span className="font-medium"> Bệnh nhân:</span> {selectedPlanForMedications.patientName || 'Không có thông tin'}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${getStatusColor(selectedPlanForMedications.status)}`}>
                    {getStatusText(selectedPlanForMedications.status)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {loadingMedications ? (
                <div className="text-center py-8">
                  <ArrowPathIcon className="animate-spin h-10 w-10 mx-auto text-blue-600" />
                  <p className="mt-4 text-gray-600">Đang tải dữ liệu thuốc...</p>
                </div>
              ) : currentMedications.length === 0 ? (
                <div className="text-center py-8">
                  <BeakerIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Không tìm thấy thuốc nào trong phác đồ điều trị này</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {currentMedications.map((medication) => (
                    <div key={medication.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-lg text-blue-800">{medication.medication?.name || medication.name || 'Không có tên thuốc'}</h3>
                            <p className="text-gray-600 text-sm">{medication.medication?.description || medication.genericName || ''}</p>
                            {(medication.medication?.category || medication.medicationType) && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                  {medication.medication?.category || medication.medicationType}
                                </span>
                                {medication.medication?.dosageForm && (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                                    {medication.medication.dosageForm}
                                  </span>
                                )}
                                {medication.medication?.strength && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                    {medication.medication.strength}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            medication.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                            medication.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                            medication.status === 'DISCONTINUED' ? 'bg-red-100 text-red-800' :
                            medication.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {medication.status === 'ACTIVE' ? 'Đang sử dụng' : 
                             medication.status === 'COMPLETED' ? 'Hoàn thành' :
                             medication.status === 'DISCONTINUED' ? 'Đã ngừng' :
                             medication.status === 'PAUSED' ? 'Tạm dừng' :
                             medication.isActive ? 'Đang sử dụng' : 'Đã ngừng'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-xs text-gray-500 uppercase mb-1">Liều lượng</p>
                            <p className="font-medium">{medication.dosage}</p>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-xs text-gray-500 uppercase mb-1">Tần suất</p>
                            <p className="font-medium">
                              {medication.frequency === 'ONCE_DAILY' ? 'Một lần mỗi ngày' :
                               medication.frequency === 'TWICE_DAILY' ? 'Hai lần mỗi ngày' :
                               medication.frequency === 'THREE_TIMES_DAILY' ? 'Ba lần mỗi ngày' :
                               medication.frequency === 'FOUR_TIMES_DAILY' ? 'Bốn lần mỗi ngày' :
                               medication.frequency === 'AS_NEEDED' ? 'Khi cần' :
                               medication.frequency}
                            </p>
                          </div>
                          
                          {medication.medication?.manufacturer && (
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-xs text-gray-500 uppercase mb-1">Nhà sản xuất</p>
                              <p className="font-medium">{medication.medication.manufacturer}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase mb-1">Ngày bắt đầu</span>
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="font-medium">
                                {medication.startDate ? new Date(medication.startDate).toLocaleDateString('vi-VN') : 'N/A'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase mb-1">Ngày kết thúc</span>
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="font-medium">
                                {medication.endDate ? new Date(medication.endDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase mb-1">Ngày kê đơn</span>
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="font-medium">
                                {medication.prescriptionDate ? new Date(medication.prescriptionDate).toLocaleDateString('vi-VN') : 
                                 medication.createdAt ? new Date(medication.createdAt).toLocaleDateString('vi-VN') :
                                 new Date(medication.startDate).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {medication.instructions && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                            <div className="flex">
                              <DocumentTextIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs text-blue-600 font-medium mb-1">Hướng dẫn sử dụng</p>
                                <p className="text-sm">{medication.instructions}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(medication.medication?.sideEffects || (medication.sideEffects && medication.sideEffects.length > 0)) && (
                            <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                              <div className="flex">
                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs text-yellow-700 font-medium mb-1">Tác dụng phụ có thể gặp</p>
                                  <p className="text-sm">{
                                    medication.medication?.sideEffects || 
                                    (Array.isArray(medication.sideEffects) ? medication.sideEffects.join(', ') : medication.sideEffects)
                                  }</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {medication.medication?.contraindications && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-md">
                              <div className="flex">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs text-red-700 font-medium mb-1">Chống chỉ định</p>
                                  <p className="text-sm">{medication.medication.contraindications}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {medication.schedules && medication.schedules.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2 flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1 text-gray-500" />
                              Lịch uống thuốc
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {medication.schedules.map((schedule, idx) => (
                                <div key={idx} className="flex items-center p-3 bg-indigo-50 border border-indigo-100 rounded-md">
                                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                    <span className="font-bold text-indigo-700">{schedule.timeOfDay || schedule.formattedTime}</span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-indigo-800">{schedule.dosageAmount}</p>
                                    {schedule.notes && <p className="text-xs text-indigo-600">{schedule.notes}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
              </div>
            </div>
                ))}
              </div>
            )}
          </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <Button variant="primary" onClick={() => setShowMedicationsModal(false)}>
                Đóng
              </Button>
            </div>
          </div>
      </div>
      )}
    </Layout>
  );
};

export default TreatmentPlansPage; 