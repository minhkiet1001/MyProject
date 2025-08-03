import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { UserRole } from '../../types/index.js';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DoctorDetailModal from '../../components/manager/DoctorDetailModal';
import { format, parseISO, startOfWeek, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import managerScheduleService from '../../services/managerScheduleService';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ArrowPathIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [showDoctorDetailModal, setShowDoctorDetailModal] = useState(false);
  const [selectedDoctorDetail, setSelectedDoctorDetail] = useState(null);
  const [error, setError] = useState('');

  // Tính toán ngày đầu và ngày cuối của tuần hiện tại
  const startDate = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Bắt đầu từ thứ 2
  const endDate = addDays(startDate, 6); // Kết thúc vào chủ nhật

  // Load doctors when component mounts
  useEffect(() => {
    loadDoctors();
  }, []);

  // Load schedules when doctors or selectedWeek changes
  useEffect(() => {
    if (doctors.length > 0) {
      loadSchedules();
    }
  }, [doctors, selectedWeek]);

  const loadDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await managerScheduleService.getAllDoctors();
      if (response.success) {
        setDoctors(response.data);
      } else {
        setError(response.message || 'Không thể tải danh sách bác sĩ');
      }
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra khi tải danh sách bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    setLoading(true);
    setError('');
    
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');
    
    console.log('Loading schedules for period:', formattedStartDate, 'to', formattedEndDate);
    
    try {
      // Luôn lấy lịch của tất cả bác sĩ
      const promises = doctors.map(doctor => 
        managerScheduleService.getDoctorSchedules(doctor.id, formattedStartDate, formattedEndDate)
      );
      
      // Chờ tất cả promise hoàn thành
      const results = await Promise.all(promises);
      
      // Gộp kết quả từ tất cả các bác sĩ
      let allSchedules = [];
      results.forEach((response, index) => {
        if (response.success && Array.isArray(response.data)) {
          console.log(`Doctor ${doctors[index].id} (${doctors[index].name}): ${response.data.length} schedules`);
          allSchedules = [...allSchedules, ...response.data];
        }
      });
      
      console.log('Total schedules loaded:', allSchedules.length);
      
      // Debug mẫu dữ liệu để phân tích định dạng
      if (allSchedules.length > 0) {
        console.log('Sample schedule data (all doctors):', allSchedules[0]);
      }
      
      setSchedules(allSchedules);
    } catch (err) {
      console.error('Error loading schedules:', err);
      setError(err.message || 'Đã có lỗi xảy ra khi tải lịch làm việc');
    } finally {
      setLoading(false);
    }
  };

  // Handle view doctor details
  const handleViewDoctorDetails = (doctor) => {
    setSelectedDoctorDetail(doctor);
    setShowDoctorDetailModal(true);
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const prevWeek = new Date(selectedWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setSelectedWeek(prevWeek);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const nextWeek = new Date(selectedWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setSelectedWeek(nextWeek);
  };

  // Format date for display
  const formatDate = (date) => {
    return format(date, 'dd/MM', { locale: vi });
  };

  // Quick stats for display
  const quickStats = [
    {
      title: 'Tổng bác sĩ',
      value: doctors.length.toString(),
      icon: UserIcon,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Lịch tuần này',
      value: schedules.length.toString(),
      icon: CalendarIcon,
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'Thời lượng trung bình',
      value: schedules.length > 0 
        ? `${Math.round(schedules.reduce((sum, s) => sum + (s.slotDurationMinutes || 30), 0) / schedules.length)} phút` 
        : '30 phút',
      icon: ClockIcon,
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  // Lọc các lịch làm việc của bác sĩ vào ngày cụ thể
  const getSchedulesForDoctorAndDate = (doctorId, dateStr) => {
    return schedules.filter(schedule => {
      const doctorMatch = schedule.doctorId.toString() === doctorId.toString();
      
      // Xử lý định dạng ngày
      let dateMatch = false;
      if (schedule.date) {
        if (typeof schedule.date === 'string' && schedule.date.includes('T')) {
          // Định dạng ISO
          const scheduleDate = format(parseISO(schedule.date), 'yyyy-MM-dd');
          dateMatch = scheduleDate === dateStr;
        } else {
          // Định dạng yyyy-MM-dd
          dateMatch = schedule.date === dateStr;
        }
      }
      
      return doctorMatch && dateMatch;
    });
  };

  // Kiểm tra xem bác sĩ có lịch vào ngày cụ thể không
  const doctorHasSchedule = (doctorId, dateStr) => {
    const doctorSchedules = getSchedulesForDoctorAndDate(doctorId, dateStr);
    return doctorSchedules.length > 0;
  };
  
  return (
    <Layout currentRole={UserRole.MANAGER}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Lịch làm việc của các bác sĩ</h1>
              <Button 
            onClick={() => loadSchedules()}
            className="flex items-center space-x-2"
              >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Làm mới</span>
              </Button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                    </div>
                  </div>
                </Card>
            ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9v4a1 1 0 11-2 0v-4a1 1 0 112 0zm0-4a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
                    </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                  </div>
        )}

        {/* Doctor Schedule Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doctor List */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Danh sách bác sĩ</h3>
              
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Đang tải...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {doctors.map((doctor) => (
                    <div 
                      key={doctor.id} 
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewDoctorDetails(doctor)}
                    >
                      <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <UserIcon className="h-6 w-6 text-primary-600" />
          </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{doctor.name}</h4>
                        <p className="text-sm text-gray-500">{doctor.specialty}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          doctor.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {doctor.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                    </div>
                  </div>
                ))}
                  
                  {doctors.length === 0 && !loading && (
                    <p className="text-center text-gray-500 py-4">Chưa có bác sĩ nào</p>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Schedule Calendar */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Lịch tuần</h3>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={goToPreviousWeek} disabled={loading}>←</Button>
                  <span className="text-sm font-medium text-gray-900 px-4">
                    {format(startDate, 'dd/MM')} - {format(endDate, 'dd/MM/yyyy')}
                  </span>
                  <Button variant="outline" size="sm" onClick={goToNextWeek} disabled={loading}>→</Button>
                  </div>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Đang tải lịch làm việc...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Bác sĩ</th>
                        {[...Array(7)].map((_, index) => {
                          const currentDate = addDays(startDate, index);
                          return (
                            <th key={index} className="text-center py-3 px-2 text-sm font-medium text-gray-500">
                              <div>{format(currentDate, 'EEE', { locale: vi })}</div>
                              <div>{formatDate(currentDate)}</div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {/* Hiển thị tất cả bác sĩ */}
                      {doctors.map((doctor) => (
                        <tr key={doctor.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                <UserIcon className="h-4 w-4 text-primary-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                                <div className="text-xs text-gray-500">{doctor.specialty}</div>
                              </div>
                            </div>
                          </td>
                          {[...Array(7)].map((_, dayIndex) => {
                            const currentDate = addDays(startDate, dayIndex);
                            const formattedDate = format(currentDate, 'yyyy-MM-dd');
                            
                            // Sử dụng hàm trợ giúp để lọc lịch làm việc
                            const daySchedules = getSchedulesForDoctorAndDate(doctor.id, formattedDate);
                            const hasSchedules = daySchedules.length > 0;
                            
                            return (
                              <td key={dayIndex} className={`py-4 px-2 text-center ${hasSchedules ? 'bg-green-50' : ''}`}>
                                {hasSchedules ? (
                                  <div 
                                    className="space-y-1 cursor-pointer"
                                    onClick={() => handleViewDoctorDetails(doctor)}
                                  >
                                    {/* Hiển thị ca làm việc của bác sĩ */}
                                    <div className="flex items-center justify-center">
                                      <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
                                      <span className="text-sm font-medium text-green-700">Có lịch</span>
                                    </div>
                                    
                                    {/* Hiển thị số ca làm việc và thời gian đầu tiên */}
                                    <div className="text-xs font-medium text-gray-800">
                                      {daySchedules.length > 1 ? `${daySchedules.length} ca` : '1 ca'}
                                    </div>
                                    
                                    {/* Hiển thị giờ làm việc ca đầu tiên */}
                                    <div className="text-xs text-gray-600">
                                      {daySchedules[0]?.startTime?.substring(0, 5)}-{daySchedules[0]?.endTime?.substring(0, 5)}
                    </div>
                  </div>
                                ) : (
                                  <div className="text-sm text-gray-400">-</div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      
                      {doctors.length === 0 && (
                        <tr>
                          <td colSpan="8" className="py-6 text-center text-gray-500">
                            Không có bác sĩ nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
              </div>
              )}
            </Card>
          </div>
        </div>

        {/* Doctor Detail Modal */}
        {showDoctorDetailModal && selectedDoctorDetail && (
          <DoctorDetailModal
            isOpen={showDoctorDetailModal}
            onClose={() => setShowDoctorDetailModal(false)}
            doctor={selectedDoctorDetail}
            onSave={() => {
              // Reload doctors and schedules when changes are made
              loadDoctors();
              loadSchedules();
            }}
            defaultTab="schedule"
          />
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage; 