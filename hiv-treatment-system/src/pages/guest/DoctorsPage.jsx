import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { UserRole } from '../../types/index.js';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';
import guestService from '../../services/guestService';
import {
  UserIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PhoneIcon,
  AcademicCapIcon,
  CalendarIcon,
  ClockIcon,
  CheckBadgeIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const DoctorsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'experience'
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await guestService.getAllDoctors();
        if (response.success && response.data) {
          // Process doctor data to add required fields
          const processedDoctors = response.data.map(doctor => ({
            ...doctor,
            experienceText: `${doctor.experienceYears || doctor.experience || 0} năm kinh nghiệm`,
            // Parse workingDays from string to array if needed
            workingDays: doctor.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            // Default fields that might not be in API
   
            shifts: doctor.shifts || [
              { type: 'Buổi sáng', time: '08:00 - 12:00' },
              { type: 'Buổi chiều', time: '13:00 - 17:00' }
            ],
            bio: doctor.bio || `Bác sĩ chuyên khoa ${doctor.specialty} với ${doctor.experienceYears || doctor.experience || 0} năm kinh nghiệm.`,
            achievements: doctor.achievements || [
              'Chứng chỉ điều trị HIV/AIDS',
              'Thành viên Hội Y khoa Việt Nam'
            ],
            specializations: doctor.specializations || [
              'Điều trị HIV/AIDS',
              'Tư vấn sức khỏe'
            ],
            publications: doctor.publications || []
          }));
          setDoctors(processedDoctors);
        } else {
          setError('Không thể tải thông tin bác sĩ. Vui lòng thử lại sau.');
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Đã xảy ra lỗi khi tải thông tin bác sĩ.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Filter and sort doctors
  const filteredAndSortedDoctors = doctors
    .filter(doctor => {
      const matchesSearch = doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specializations?.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSpecialty = specialtyFilter === 'all' || doctor.specialtyCode === specialtyFilter;
      return matchesSearch && matchesSpecialty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'experience':
          return (b.experienceYears || b.experience || 0) - (a.experienceYears || a.experience || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const DoctorDetailModal = ({ doctor, isOpen, onClose }) => {
    if (!isOpen || !doctor) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
          
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={doctor.avatarUrl || doctor.avatar || "https://via.placeholder.com/100"}
                    alt={doctor.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{doctor.name}</h2>
                    <p className="text-lg text-primary-600 font-medium">{doctor.specialty}</p>
                    <p className="text-gray-600">{doctor.experienceText}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Contact & Schedule */}
                <div className="space-y-6">
                  {/* Contact Information */}
                  <Card>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <MapPinIcon className="h-4 w-4 mr-3 text-gray-400" />
                          <span>{doctor.location || "Trung tâm Y tế"}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <PhoneIcon className="h-4 w-4 mr-3 text-gray-400" />
                          <span>{doctor.phone || "Liên hệ qua tổng đài"}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <EnvelopeIcon className="h-4 w-4 mr-3 text-gray-400" />
                          <span>{doctor.email || "Thông tin không khả dụng"}</span>
                        </div>
                    
                      </div>
                    </div>
                  </Card>

                  {/* Working Schedule */}
                  <Card>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Lịch làm việc</h3>
                      <div className="space-y-3">
                       
                        <div className="flex items-center text-sm">
                          <ClockIcon className="h-4 w-4 mr-3 text-gray-400" />
                          <div>
                            <div className="font-medium">Giờ làm việc</div>
                            <div className="text-gray-600">{doctor.workingHours || "08:00 - 17:00"}</div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="font-medium text-sm mb-2">Ca làm việc:</div>
                          {doctor.shifts && doctor.shifts.map((shift, index) => (
                            <div key={index} className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>{shift.type}:</span>
                              <span>{shift.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center block"
                    >
                      Đăng nhập để đặt lịch
                    </Link>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Biography */}
                  <Card>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Giới thiệu</h3>
                      <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
                    </div>
                  </Card>

                  {/* Education */}
                  <Card>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Học vấn</h3>
                      <div className="flex items-center">
                        <AcademicCapIcon className="h-5 w-5 mr-3 text-gray-400" />
                        <span className="text-gray-700">{doctor.education || doctor.degree || "Đại học Y khoa"}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Specializations */}
                  {doctor.specializations && doctor.specializations.length > 0 && (
                    <Card>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Chuyên môn</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {doctor.specializations.map((spec, index) => (
                            <div key={index} className="flex items-center">
                              <CheckBadgeIcon className="h-4 w-4 mr-2 text-green-500" />
                              <span className="text-sm text-gray-700">{spec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  )}

                
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout currentRole={UserRole.GUEST} pageTitle="Đội ngũ bác sĩ">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Đội ngũ bác sĩ chuyên khoa</h1>
          <p className="text-primary-100">
            Gặp gỡ các chuyên gia hàng đầu trong lĩnh vực điều trị HIV/AIDS
          </p>
        </div>

        {/* Search and Filter */}
        <Card>
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bác sĩ theo tên, chuyên khoa hoặc chuyên môn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Tất cả chuyên khoa</option>
                <option value="infectious">Bác sĩ Nhiễm trùng</option>
                <option value="internal">Bác sĩ Nội khoa</option>
                <option value="psychology">Bác sĩ Tâm lý</option>
                <option value="gynecology">Bác sĩ Sản phụ khoa</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="name">Sắp xếp theo tên</option>
                <option value="experience">Sắp xếp theo kinh nghiệm</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="text-center py-12">
            <ArrowPathIcon className="h-12 w-12 mx-auto text-primary-500 animate-spin" />
            <p className="mt-4 text-gray-500">Đang tải thông tin bác sĩ...</p>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="text-center py-12 bg-red-50">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-red-800">Đã xảy ra lỗi</h3>
            <p className="mt-2 text-red-700">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Tải lại trang
            </button>
          </Card>
        )}

        {/* Doctors Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedDoctors.map(doctor => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <img
                      src={doctor.avatarUrl || doctor.avatar || "https://via.placeholder.com/100"}
                      alt={doctor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-primary-600 font-medium">{doctor.specialty}</p>
                      <p className="text-sm text-gray-600">{doctor.experienceText}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      {doctor.location || "Trung tâm Y tế"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      {doctor.workingHours || "8:00 - 17:00"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {doctor.workingDays ? 
                        doctor.workingDays.slice(0, 3).map(day => {
                          const days = {
                            monday: 'Thứ 2',
                            tuesday: 'Thứ 3',
                            wednesday: 'Thứ 4',
                            thursday: 'Thứ 5',
                            friday: 'Thứ 6',
                            saturday: 'Thứ 7',
                            sunday: 'Chủ nhật'
                          };
                          return days[day];
                        }).join(', ') + (doctor.workingDays.length > 3 ? '...' : '')
                        : 'Thứ 2 - Thứ 6'}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-700 line-clamp-3">{doctor.bio}</p>
                  </div>

                  {doctor.specializations && doctor.specializations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Chuyên môn chính:</h4>
                      <div className="flex flex-wrap gap-1">
                        {doctor.specializations.slice(0, 2).map((spec, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                        {doctor.specializations.length > 2 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{doctor.specializations.length - 2} khác
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDoctor(doctor)}
                      className="w-full"
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && filteredAndSortedDoctors.length === 0 && (
          <Card>
            <div className="p-8 text-center">
              <UserIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Không tìm thấy bác sĩ nào phù hợp với tiêu chí tìm kiếm</p>
            </div>
          </Card>
        )}

        {/* Call to Action */}
        <Card>
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sẵn sàng đặt lịch hẹn?
            </h3>
            <p className="text-gray-600 mb-4">
              Đăng nhập để đặt lịch hẹn với bác sĩ chuyên khoa của chúng tôi
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/login">
                <Button variant="primary">
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline">
                  Đăng ký tài khoản
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Doctor Detail Modal */}
        <DoctorDetailModal
          doctor={selectedDoctor}
          isOpen={!!selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
        />
      </div>
    </Layout>
  );
};

export default DoctorsPage; 