import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { UserRole } from '../../types/index.js';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';
import doctorService from '../../services/doctorService';
import authService from '../../services/authService';

const PatientsPage = () => {
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [noDoctorProfile, setNoDoctorProfile] = useState(false);
  
  // Fetch doctor ID and load patients on component mount
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        // Get current user
        const user = authService.getCurrentUser();
        
        if (!user) {
          throw new Error('Không tìm thấy thông tin người dùng');
        }
        
        console.log('Current user:', user);
        
        // Get doctor profile with user ID
        try {
          const doctorProfileResponse = await doctorService.getDoctorProfile(user.id);
          
          console.log('Doctor profile response:', doctorProfileResponse);
          
          if (!doctorProfileResponse.success) {
            setNoDoctorProfile(true);
            setDoctorName(user.name || 'Bác sĩ');
            setLoading(false);
            console.error('Doctor profile not successful:', doctorProfileResponse);
            return;
          }
          
          const doctorData = doctorProfileResponse.data;
          setDoctorId(doctorData.id);
          setDoctorName(doctorData.name || user.name || 'Bác sĩ');
          
          console.log('Doctor ID set to:', doctorData.id);
          
          // Now that we have the doctor ID, fetch patients
          await fetchPatients(doctorData.id);
        } catch (profileError) {
          console.error('Error fetching doctor profile:', profileError);
          setNoDoctorProfile(true);
          setDoctorName(user.name || 'Bác sĩ');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching doctor information:', err);
        setError(err.message || 'Không thể lấy thông tin bác sĩ');
        setLoading(false);
      }
    };
    
    fetchDoctorInfo();
  }, []);
  
  // Fetch patients data
  const fetchPatients = async (docId) => {
    try {
      setLoading(true);
      console.log('Fetching patients for doctor ID:', docId);
      
      const response = await doctorService.getPatients(docId);
      
      console.log('Patients response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Không thể lấy danh sách bệnh nhân');
      }
      
      // Transform the data to match our component's expected structure
      const transformedData = (response.data || []).map(patient => ({
        id: patient.id,
        name: patient.name,
        patientId: patient.patientCode || `BN${patient.id}`,
        age: patient.age || calculateAge(patient.birthdate),
        gender: patient.gender,
        status: patient.healthStatus || 'new',
        enrollmentDate: patient.enrollmentDate ? new Date(patient.enrollmentDate) : new Date(),
        lastVisit: patient.lastVisitDate ? new Date(patient.lastVisitDate) : new Date(),
        contactNumber: patient.phone || 'Không có',
        email: patient.email || 'Không có',
        viralLoad: patient.viralLoad || 'Không có dữ liệu',
        cd4Count: patient.cd4Count || 'Không có dữ liệu',
        currentMedications: patient.currentMedications || [],
        notes: patient.healthNotes || 'Không có ghi chú'
      }));
      
      console.log('Transformed patient data:', transformedData);
      
      setPatients(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err.message || 'Không thể lấy danh sách bệnh nhân');
    } finally {
      setLoading(false);
    }
  };
  
  // Search patients
  const handleSearch = async () => {
    try {
      setLoading(true);
      
      if (!searchTerm.trim()) {
        // If search term is empty, fetch all patients
        await fetchPatients(doctorId);
        return;
      }
      
      const response = await doctorService.searchPatients(doctorId, searchTerm);
      
      if (!response.success) {
        throw new Error(response.message || 'Không thể tìm kiếm bệnh nhân');
      }
      
      // Transform the data
      const transformedData = (response.data || []).map(patient => ({
        id: patient.id,
        name: patient.name,
        patientId: patient.patientCode || `BN${patient.id}`,
        age: patient.age || calculateAge(patient.birthdate),
        gender: patient.gender,
        status: patient.healthStatus || 'new',
        enrollmentDate: patient.enrollmentDate ? new Date(patient.enrollmentDate) : new Date(),
        lastVisit: patient.lastVisitDate ? new Date(patient.lastVisitDate) : new Date(),
        contactNumber: patient.phone || 'Không có',
        email: patient.email || 'Không có',
        viralLoad: patient.viralLoad || 'Không có dữ liệu',
        cd4Count: patient.cd4Count || 'Không có dữ liệu',
        currentMedications: patient.currentMedications || [],
        notes: patient.healthNotes || 'Không có ghi chú'
      }));
      
      setPatients(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error searching patients:', err);
      setError(err.message || 'Không thể tìm kiếm bệnh nhân');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate age from birthdate
  const calculateAge = (birthdate) => {
    if (!birthdate) return 0;
    
    const dob = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  };

  // Filter patients based on search term and filters
  const filteredPatients = patients.filter((patient) => {
    if (statusFilter !== 'all' && patient.status !== statusFilter) {
      return false;
    }
    
    return true;
  });

  // Sort patients by lastVisit (most recent first)
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    return new Date(b.lastVisit) - new Date(a.lastVisit);
  });

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    try {
    return date.toLocaleDateString('vi-VN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    return doctorService.getPatientStatusColor(status);
  };

  // Get status text
  const getStatusText = (status) => {
    return doctorService.getPatientStatusText(status);
  };

  // Handle view patient details
  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
  };

  // Handle close patient details
  const handleClosePatientDetails = () => {
    setSelectedPatient(null);
  };
  
  // Handle search input key press
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Render message when doctor profile not found
  const renderNoDoctorProfile = () => {
    return (
      <div className="text-center py-10">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy hồ sơ bác sĩ</h3>
        <p className="mt-1 text-sm text-gray-500">
          Hệ thống không thể tìm thấy hồ sơ bác sĩ của bạn.
        </p>
        <div className="mt-6">
          <Button variant="primary">
            Liên hệ quản trị viên
          </Button>
        </div>
      </div>
    );
  };
  
  // Render empty patients list
  const renderEmptyPatients = () => {
    return (
      <div className="text-center py-10">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Không có bệnh nhân</h3>
        <p className="mt-1 text-sm text-gray-500">
          Hiện tại bạn chưa có bệnh nhân nào được phân công.
        </p>
      </div>
    );
  };

  return (
    <Layout currentRole={UserRole.DOCTOR} userName={doctorName || 'Bác sĩ'}>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-md border border-red-200">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách bệnh nhân</h1>
            <p className="mt-1 text-gray-500">
              Quản lý và theo dõi bệnh nhân của bạn
            </p>
          </div>
          
          {!noDoctorProfile && (
          <div className="mt-4 md:mt-0 flex items-center">
            <div className="relative mr-4">
              <input
                type="text"
                placeholder="Tìm kiếm bệnh nhân..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <Button
              variant="outline"
              className="flex items-center mr-2"
              onClick={handleSearch}
            >
              Tìm kiếm
            </Button>
            <Button
              variant="outline"
              className="flex items-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Bộ lọc
            </Button>
          </div>
          )}
        </div>

        {showFilters && (
          <Card className="mb-6">
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Lọc bệnh nhân</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="stable">Ổn định</option>
                  <option value="attention">Cần chú ý</option>
                  <option value="critical">Nguy hiểm</option>
                  <option value="new">Bệnh nhân mới</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
              </div>
            </div>
          </Card>
        )}

        {noDoctorProfile ? (
          renderNoDoctorProfile()
        ) : (
        <Card className="overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
                <span className="ml-3 text-gray-500">Đang tải dữ liệu...</span>
              </div>
            ) : sortedPatients.length === 0 ? (
              renderEmptyPatients()
            ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bệnh nhân
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chỉ số
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lần khám gần nhất
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium">{patient.name.charAt(0)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">{patient.patientId}</span> • {patient.age} tuổi, {patient.gender}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Tải lượng Virus: {patient.viralLoad}
                      </div>
                      <div className="text-sm text-gray-500">
                        CD4: {patient.cd4Count}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(patient.lastVisit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="text"
                        onClick={() => handleViewPatient(patient)}
                        className="text-primary-600 hover:text-primary-900 mr-2"
                      >
                        Chi tiết
                      </Button>
                      {/* <Link to={`/doctor/patients/${patient.id}`}>
                        <Button variant="outline" size="sm">
                          Hồ sơ
                        </Button>
                      </Link> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </Card>
        )}
      </div>

        {/* Patient Details Modal */}
        {selectedPatient && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Thông tin chi tiết bệnh nhân
                </h3>
                <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={handleClosePatientDetails}
                >
                    <span className="sr-only">Đóng</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <div className="flex items-center mb-6">
                  <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 text-xl font-medium">{selectedPatient.name.charAt(0)}</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{selectedPatient.name}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedPatient.patientId} • {selectedPatient.age} tuổi, {selectedPatient.gender}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Thông tin liên hệ</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="mb-3">
                        <p className="text-xs text-gray-500">Điện thoại</p>
                        <p className="text-sm font-medium">{selectedPatient.contactNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium">{selectedPatient.email}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Thông tin điều trị</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="mb-3">
                        <p className="text-xs text-gray-500">Ngày đăng ký</p>
                        <p className="text-sm font-medium">{formatDate(selectedPatient.enrollmentDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Lần khám gần nhất</p>
                        <p className="text-sm font-medium">{formatDate(selectedPatient.lastVisit)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Kết quả xét nghiệm gần nhất</h4>
                  <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                      <p className="text-xs text-gray-500">Tải lượng Virus</p>
                        <p className="text-sm font-medium">{selectedPatient.viralLoad}</p>
                      </div>
                      <div>
                      <p className="text-xs text-gray-500">Số lượng CD4</p>
                        <p className="text-sm font-medium">{selectedPatient.cd4Count}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Thuốc đang sử dụng</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedPatient.currentMedications && selectedPatient.currentMedications.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {selectedPatient.currentMedications.map((med, index) => (
                          <li key={index} className="py-2">
                            <div className="flex justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{med.name}</p>
                                <p className="text-xs text-gray-500">{med.dosage}</p>
                              </div>
                              <p className="text-xs text-gray-500">{med.frequency}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">Không có thông tin thuốc</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Ghi chú</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-line">{selectedPatient.notes}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {/* <Link to={`/doctor/patients/${selectedPatient.id}`}>
                  <Button variant="primary" className="w-full sm:w-auto sm:ml-3">
                    Xem hồ sơ chi tiết
                  </Button>
                </Link> */}
                <Button
                  variant="outline"
                  className="mt-3 w-full sm:mt-0 sm:w-auto"
                  onClick={handleClosePatientDetails}
                >
                  Đóng
                </Button>
              </div>
              </div>
            </div>
          </div>
        )}
    </Layout>
  );
};

export default PatientsPage; 