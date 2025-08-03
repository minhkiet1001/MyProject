import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { UserRole } from '../../types/index.js';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Calendar from '../../components/common/Calendar';
import { Link } from 'react-router-dom';
import guestService from '../../services/guestService';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  PhoneIcon,
  AcademicCapIcon,
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const PublicSchedulePage = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('doctors'); // 'doctors' | 'calendar'
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState({
    doctors: true,
    slots: false
  });
  const [error, setError] = useState({
    doctors: null,
    slots: null
  });

  // Load doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(prev => ({ ...prev, doctors: true }));
        // Get available doctors (those with schedules)
        const response = await guestService.getAvailableDoctors();
        
        if (response.success && response.data) {
          // Process doctor data to add required fields
          const processedDoctors = response.data.map(doctor => ({
            ...doctor,
            experienceText: `${doctor.experienceYears || doctor.experience || 0} năm kinh nghiệm`,
            // Parse workingDays from string to array if needed
            workingDays: doctor.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            // Default fields that might not be in API
            phone: doctor.phone || "(024) 3123-xxxx",
            location: doctor.location || "Phòng khám, Tầng 1",
            shifts: doctor.shifts || [
              { type: 'morning', startTime: '08:00', endTime: '12:00', maxPatients: 8 },
              { type: 'afternoon', startTime: '13:00', endTime: '17:00', maxPatients: 8 }
            ],
          }));
          setDoctors(processedDoctors);
          setError(prev => ({ ...prev, doctors: null }));
        } else {
          setError(prev => ({ 
            ...prev, 
            doctors: 'Không thể tải thông tin bác sĩ. Vui lòng thử lại sau.' 
          }));
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError(prev => ({ 
          ...prev, 
          doctors: 'Đã xảy ra lỗi khi tải thông tin bác sĩ.' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, doctors: false }));
      }
    };

    fetchDoctors();
  }, []);

  // Load available slots when a doctor and date are selected
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDoctor || !selectedDate) return;
      
      try {
        setLoading(prev => ({ ...prev, slots: true }));
        // Format date to YYYY-MM-DD
        const formattedDate = selectedDate.toISOString().split('T')[0];
        
        const response = await guestService.getAvailableSlots(
          selectedDoctor.id, 
          formattedDate
        );
        
        if (response.success && response.data) {
          setAvailableSlots(response.data);
          setError(prev => ({ ...prev, slots: null }));
        } else {
          setAvailableSlots([]);
          setError(prev => ({ 
            ...prev, 
            slots: 'Không thể tải thông tin lịch khám. Vui lòng thử lại sau.' 
          }));
        }
      } catch (err) {
        console.error('Error fetching available slots:', err);
        setAvailableSlots([]);
        setError(prev => ({ 
          ...prev, 
          slots: 'Đã xảy ra lỗi khi tải thông tin lịch khám.' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, slots: false }));
      }
    };

    if (viewMode === 'calendar' && selectedDoctor) {
      fetchAvailableSlots();
    }
  }, [selectedDoctor, selectedDate, viewMode]);

  // Filter doctors based on search and specialty
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'all' || doctor.specialtyCode === specialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

  // Generate time slots for a doctor on a specific date
  const generateTimeSlots = (doctor, date) => {
    if (!date) return [];
    
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(date).getDay()];
    
    if (!doctor.workingDays?.includes(dayOfWeek)) {
      return [];
    }

    // If we have real available slots from the API, use those
    if (availableSlots.length > 0) {
      return availableSlots.map(slot => ({
        id: slot.id || `slot-${slot.startTime}`,
        startTime: slot.startTime,
        endTime: slot.endTime,
        shift: slot.startTime < '12:00' ? 'morning' : 'afternoon',
        isAvailable: slot.isAvailable,
        shiftName: slot.startTime < '12:00' ? 'Buổi sáng' : 'Buổi chiều'
      }));
    }

    // Fallback to generated slots if API data isn't available
    const slots = [];
    if (doctor.shifts) {
      doctor.shifts.forEach(shift => {
        const startTime = new Date(`${date}T${shift.startTime}`);
        const endTime = new Date(`${date}T${shift.endTime}`);
        const slotDuration = 30; // 30 minutes per slot
        
        let currentTime = new Date(startTime);
        while (currentTime < endTime) {
          const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
          if (slotEnd <= endTime) {
            // Random availability (70% chance of being available)
            const isAvailable = Math.random() > 0.3;
            slots.push({
              id: `${shift.type}-${currentTime.getHours()}-${currentTime.getMinutes()}`,
              startTime: currentTime.toTimeString().slice(0, 5),
              endTime: slotEnd.toTimeString().slice(0, 5),
              shift: shift.type,
              isAvailable,
              shiftName: shift.type === 'morning' ? 'Buổi sáng' : 'Buổi chiều'
            });
          }
          currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
        }
      });
    }

    return slots;
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(new Date());
    setViewMode('calendar');
  };

  const handleSlotSelect = (date, slot) => {
    // Redirect to login page with appointment info
    const appointmentData = {
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      date: date,
      timeSlot: slot,
      returnUrl: '/customer/appointment-selection'
    };
    
    // Store appointment data in sessionStorage for after login
    sessionStorage.setItem('pendingAppointment', JSON.stringify(appointmentData));
    
    // Redirect to login
    window.location.href = `/login?redirect=${encodeURIComponent('/customer/appointment-selection')}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWeekDates = (startDate) => {
    const dates = [];
    const start = new Date(startDate);
    start.setDate(start.getDate() - start.getDay() + 1); // Start from Monday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeek);
  
  const translateDayOfWeek = (day) => {
    const days = {
      monday: 'Thứ 2',
      tuesday: 'Thứ 3',
      wednesday: 'Thứ 4',
      thursday: 'Thứ 5',
      friday: 'Thứ 6',
      saturday: 'Thứ 7',
      sunday: 'Chủ nhật'
    };
    return days[day] || day;
  };

  return (
    <Layout currentRole={UserRole.GUEST} pageTitle="Lịch khám - Đặt lịch hẹn">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Đặt lịch khám với bác sĩ chuyên khoa</h1>
          <p className="text-primary-100">
            Xem lịch làm việc của các bác sĩ và đặt lịch hẹn một cách dễ dàng
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-4">
          <Button
            variant={viewMode === 'doctors' ? 'primary' : 'outline'}
            onClick={() => setViewMode('doctors')}
          >
            <UserIcon className="h-4 w-4 mr-2" />
            Danh sách bác sĩ
          </Button>
          {selectedDoctor && (
            <Button
              variant={viewMode === 'calendar' ? 'primary' : 'outline'}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Lịch khám - {selectedDoctor.name}
            </Button>
          )}
        </div>

        {viewMode === 'doctors' ? (
          <>
            {/* Search and Filter */}
            <Card>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm bác sĩ theo tên hoặc chuyên khoa..."
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
                </div>
              </div>
            </Card>

            {/* Loading State */}
            {loading.doctors && (
              <Card className="text-center py-12">
                <ArrowPathIcon className="h-12 w-12 mx-auto text-primary-500 animate-spin" />
                <p className="mt-4 text-gray-500">Đang tải thông tin bác sĩ...</p>
              </Card>
            )}

            {/* Error State */}
            {error.doctors && !loading.doctors && (
              <Card className="text-center py-12 bg-red-50">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
                  <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-red-800">Đã xảy ra lỗi</h3>
                <p className="mt-2 text-red-700">{error.doctors}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Tải lại trang
                </button>
              </Card>
            )}

            {/* Doctors List */}
            {!loading.doctors && !error.doctors && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredDoctors.map(doctor => (
                  <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
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

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          {doctor.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <PhoneIcon className="h-4 w-4 mr-2" />
                          {doctor.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <AcademicCapIcon className="h-4 w-4 mr-2" />
                          {doctor.education || doctor.degree || "Đại học Y khoa"}
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-gray-700 line-clamp-2">{doctor.bio}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Ngày làm việc:</span>
                          <div className="flex space-x-1 mt-1">
                            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, index) => {
                              const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                              const isWorking = doctor.workingDays?.includes(dayNames[index]);
                              return (
                                <span
                                  key={day}
                                  className={`px-2 py-1 text-xs rounded ${
                                    isWorking ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                                  }`}
                                >
                                  {day}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <Link to="/login">
                          <Button
                            variant="primary"
                          >
                            Đăng nhập để đặt lịch
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!loading.doctors && !error.doctors && filteredDoctors.length === 0 && (
              <Card>
                <div className="p-8 text-center">
                  <UserIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Không tìm thấy bác sĩ nào phù hợp</p>
                </div>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Calendar View */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedDoctor?.avatarUrl || selectedDoctor?.avatar || "https://via.placeholder.com/100"}
                      alt={selectedDoctor?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedDoctor?.name}</h3>
                      <p className="text-primary-600">{selectedDoctor?.specialty}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setViewMode('doctors')}
                  >
                    Chọn bác sĩ khác
                  </Button>
                </div>

                {/* Week Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newWeek = new Date(currentWeek);
                      newWeek.setDate(newWeek.getDate() - 7);
                      setCurrentWeek(newWeek);
                    }}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  
                  <h4 className="text-lg font-medium">
                    {weekDates[0].toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                  </h4>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newWeek = new Date(currentWeek);
                      newWeek.setDate(newWeek.getDate() + 7);
                      setCurrentWeek(newWeek);
                    }}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>

                {/* Loading State for Slots */}
                {loading.slots && (
                  <div className="text-center py-8">
                    <ArrowPathIcon className="h-8 w-8 mx-auto text-primary-500 animate-spin" />
                    <p className="mt-4 text-gray-500">Đang tải lịch khám...</p>
                  </div>
                )}

                {/* Error State for Slots */}
                {error.slots && !loading.slots && (
                  <div className="text-center py-8 bg-red-50 rounded-lg">
                    <ExclamationCircleIcon className="h-8 w-8 mx-auto text-red-500" />
                    <p className="mt-4 text-red-700">{error.slots}</p>
                    <button 
                      onClick={() => {
                        setError(prev => ({...prev, slots: null}));
                        setSelectedDate(new Date());
                      }}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                      Thử lại
                    </button>
                  </div>
                )}

                {/* Weekly Calendar */}
                {!loading.slots && !error.slots && (
                  <div className="grid grid-cols-7 gap-4">
                    {weekDates.map((date, index) => {
                      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
                      const isWorkingDay = selectedDoctor?.workingDays?.includes(dayOfWeek);
                      const isToday = date.toDateString() === new Date().toDateString();
                      const isPast = date < new Date().setHours(0, 0, 0, 0);
                      
                      // Mark the date as selected
                      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                      
                      // If the date is selected, fetch slots for this day
                      if (isSelected) {
                        setSelectedDate(date);
                      }
                      
                      const timeSlots = isWorkingDay && !isPast ? 
                        generateTimeSlots(selectedDoctor, date.toISOString().split('T')[0]) : 
                        [];

                      return (
                        <div 
                          key={index} 
                          className={`border rounded-lg p-3 cursor-pointer ${
                            isSelected ? 'border-primary-500 bg-primary-50' : 
                            isPast ? 'bg-gray-50 opacity-70' : 
                            isToday ? 'border-primary-300' : ''
                          }`}
                          onClick={() => !isPast && isWorkingDay && setSelectedDate(date)}
                        >
                          <div className={`text-center mb-3 ${
                            isToday ? 'text-primary-600 font-bold' : 
                            isPast ? 'text-gray-500' : 
                            'text-gray-700'
                          }`}>
                            <div className="text-sm font-medium">{dayNames[date.getDay()]}</div>
                            <div className="text-lg">{date.getDate()}</div>
                          </div>

                          {isPast ? (
                            <div className="text-center text-gray-400 text-sm">Đã qua</div>
                          ) : !isWorkingDay ? (
                            <div className="text-center text-gray-400 text-sm">Không làm việc</div>
                          ) : isSelected && loading.slots ? (
                            <div className="text-center py-2">
                              <ArrowPathIcon className="h-4 w-4 mx-auto text-primary-500 animate-spin" />
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {timeSlots.map(slot => (
                                <Link
                                  key={slot.id}
                                  to="/login"
                                  className={`w-full text-xs p-1 rounded transition-colors block text-center ${
                                    slot.isAvailable
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : 'bg-red-100 text-red-700 cursor-not-allowed pointer-events-none'
                                  }`}
                                >
                                  {slot.startTime}
                                  {slot.isAvailable ? '' : ' (Đã đặt)'}
                                </Link>
                              ))}
                              
                              {timeSlots.length === 0 && isSelected && !loading.slots && (
                                <div className="text-center text-gray-400 text-xs p-2">
                                  Không có lịch khám
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Legend */}
                <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
                    <span>Có thể đặt</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-100 rounded mr-2"></div>
                    <span>Đã đặt</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-100 rounded mr-2"></div>
                    <span>Không làm việc</span>
                  </div>
                </div>

                {/* Login Notice */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm text-blue-700">
                        <strong>Lưu ý:</strong> Bạn cần đăng nhập để có thể đặt lịch hẹn. 
                        <Link to="/login" className="ml-1 underline hover:text-blue-800">
                          Đăng nhập ngay
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default PublicSchedulePage; 