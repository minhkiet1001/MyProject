import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { UserRole } from '../../types/index.js';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DoctorDetailModal from '../../components/manager/DoctorDetailModal';
import AddDoctorModal from '../../components/manager/AddDoctorModal';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import managerDoctorService from '../../services/managerDoctorService';
import { toast } from 'react-toastify';

const DoctorsPage = () => {
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDoctorDetailModal, setShowDoctorDetailModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [specialties, setSpecialties] = useState([]);

  // Load doctors data from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await managerDoctorService.getAllDoctors();
        if (response.success) {
          setDoctors(response.data);
          
          // Extract unique specialties from doctors data
          const uniqueSpecialties = [...new Set(response.data
            .map(doctor => doctor.specialty)
            .filter(specialty => specialty))];
          setSpecialties(uniqueSpecialties.map(name => ({ id: name, name })));
        } else {
          setError(response.message || 'Failed to load doctors');
        }
      } catch (err) {
        setError(err.message || 'Failed to load doctors');
        console.error('Error loading doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Handle updating a doctor
  const handleSaveDoctor = async (updatedDoctor) => {
    try {
      const formattedData = managerDoctorService.formatDoctorData(updatedDoctor);
      const response = await managerDoctorService.updateDoctor(updatedDoctor.id, formattedData);
      
      if (response.success) {
        setDoctors(prev => prev.map(doctor => 
          doctor.id === updatedDoctor.id ? response.data : doctor
        ));
        toast.success('Thông tin bác sĩ đã được cập nhật thành công');
      } else {
        toast.error(response.message || 'Không thể cập nhật thông tin bác sĩ');
      }
    } catch (err) {
      console.error('Error updating doctor:', err);
      toast.error(err.message || 'Không thể cập nhật thông tin bác sĩ');
    }
  };

  // Handle creating a new doctor
  const handleSaveNewDoctor = async (newDoctor) => {
    try {
      // newDoctor from modal is already processed through the service
      setDoctors(prev => [...prev, newDoctor]);
      toast.success('Bác sĩ mới đã được thêm thành công');
    } catch (err) {
      console.error('Error saving new doctor:', err);
      toast.error(err.message || 'Không thể thêm bác sĩ mới');
    }
  };

  // Handle activating/deactivating a doctor
  const handleToggleStatus = async (doctorId, active) => {
    try {
      const response = await managerDoctorService.updateDoctorStatus(doctorId, active);
      
      if (response.success) {
        setDoctors(prev => prev.map(doctor => 
          doctor.id === doctorId ? response.data : doctor
        ));
        
        toast.success(active 
          ? 'Bác sĩ đã được kích hoạt thành công' 
          : 'Bác sĩ đã được vô hiệu hóa thành công');
      } else {
        toast.error(response.message || 'Không thể thay đổi trạng thái bác sĩ');
      }
    } catch (err) {
      console.error('Error toggling doctor status:', err);
      toast.error(err.message || 'Không thể thay đổi trạng thái bác sĩ');
    }
  };

  // Handle deleting a doctor
  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bác sĩ này không?')) {
      try {
        const response = await managerDoctorService.deleteDoctor(doctorId);
        
        if (response.success) {
          // Update local state by filtering out the deleted doctor
          setDoctors(prev => prev.filter(doctor => doctor.id !== doctorId));
          toast.success('Đã xóa bác sĩ thành công');
        } else {
          toast.error(response.message || 'Không thể xóa bác sĩ');
        }
      } catch (err) {
        console.error('Error deleting doctor:', err);
        toast.error(err.message || 'Không thể xóa bác sĩ');
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = typeof dateString === 'string' 
        ? parseISO(dateString) 
        : new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid date';
    }
  };

  // Generate status badge
  const getStatusBadge = (isActive) => {
    if (isActive === true || isActive === 'true') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Đang hoạt động
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Không hoạt động
        </span>
      );
    }
  };

  // View doctor details
  const handleViewDoctor = async (doctorId) => {
    try {
      setLoading(true);
      const response = await managerDoctorService.getDoctorById(doctorId);
      
      if (response.success) {
        setSelectedDoctor(response.data);
    setShowDoctorDetailModal(true);
      } else {
        toast.error(response.message || 'Không thể tải thông tin bác sĩ');
      }
    } catch (err) {
      console.error('Error loading doctor details:', err);
      toast.error(err.message || 'Không thể tải thông tin bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  // Close doctor details modal
  const handleCloseDoctorDetails = () => {
    setShowDoctorDetailModal(false);
    setSelectedDoctor(null);
  };

  // Filter doctors based on search and filters
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && doctor.isActive === true) ||
      (statusFilter === 'inactive' && doctor.isActive === false);

    const matchesSpecialty =
      specialtyFilter === 'all' ||
      doctor.specialty === specialtyFilter;

    return matchesSearch && matchesStatus && matchesSpecialty;
  });

  return (
    <Layout currentRole={UserRole.MANAGER} pageTitle="Quản lý bác sĩ">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Danh sách Bác sĩ</h1>
          <div className="mt-4 md:mt-0">
          <Button
              color="primary"
            onClick={() => setShowAddDoctorModal(true)}
              className="w-full md:w-auto"
          >
              Thêm bác sĩ mới
          </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Bộ lọc</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
              Tìm kiếm
            </label>
            <input
              type="text"
              id="search"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Tên, Email, Chuyên khoa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
              Trạng thái
            </label>
            <select
              id="status"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
                  <option value="all">Tất cả</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
            </select>
          </div>
          <div>
                <label
                  htmlFor="specialty"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
              Chuyên khoa
            </label>
            <select
              id="specialty"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
                  <option value="all">Tất cả</option>
              {specialties.map((specialty) => (
                <option key={specialty.id} value={specialty.name}>
                  {specialty.name}
                </option>
              ))}
            </select>
          </div>
            </div>
          </div>
        </Card>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <Card className="mb-6 bg-red-50 border border-red-200">
            <div className="p-4 text-red-700">{error}</div>
          </Card>
        )}

        {/* Doctors list */}
        {!loading && !error && (
          <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Bác sĩ
                  </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Liên hệ
                  </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Chuyên môn
                  </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                    Trạng thái
                  </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ngày tham gia
                  </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {doctor.avatarUrl ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={doctor.avatarUrl}
                                  alt={doctor.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                  <span className="text-primary-800 font-medium text-sm">
                                    {doctor.name?.charAt(0)}
                                  </span>
                                </div>
                              )}
                        </div>
                        <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {doctor.name}
                              </div>
                              {doctor.degree && (
                                <div className="text-xs text-gray-500">
                                  {doctor.degree}
                                </div>
                              )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{doctor.email}</div>
                          <div className="text-sm text-gray-500">{doctor.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{doctor.specialty}</div>
                          {doctor.experienceYears && (
                            <div className="text-sm text-gray-500">
                              {doctor.experienceYears} năm kinh nghiệm
                            </div>
                          )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(doctor.isActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(doctor.createdAt)}
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleViewDoctor(doctor.id)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Chi tiết
                          </button>
                      <button 
                            onClick={() => handleToggleStatus(doctor.id, !doctor.isActive)}
                            className={`${
                              doctor.isActive ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"
                            }`}
                          >
                            {doctor.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                      </button>
                      <button 
                            onClick={() => handleDeleteDoctor(doctor.id)}
                            className="text-red-600 hover:text-red-900"
                      >
                            Xóa
                      </button>
                    </td>
                  </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-4 whitespace-nowrap text-center text-gray-500"
                      >
                        Không tìm thấy bác sĩ nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
        )}
      </div>

      {/* Modals */}
      {showAddDoctorModal && (
        <AddDoctorModal
          isOpen={showAddDoctorModal}
          onClose={() => setShowAddDoctorModal(false)}
          onSave={handleSaveNewDoctor}
        />
      )}
      {showDoctorDetailModal && selectedDoctor && (
        <DoctorDetailModal
          isOpen={showDoctorDetailModal}
          doctor={selectedDoctor}
          onClose={handleCloseDoctorDetails}
          onSave={handleSaveDoctor}
        />
      )}
    </Layout>
  );
};

export default DoctorsPage; 