import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, addMonths, subMonths, isSameMonth, isToday, isSameDay, parseISO, getDate, getMonth, getYear } from 'date-fns';
import { vi } from 'date-fns/locale';
import Layout from '../../components/layout/Layout';
import { UserRole } from '../../types/index.js';
import doctorService from '../../services/doctorService';
import authService from '../../services/authService';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon, 
  ClockIcon, 
  MinusIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const DoctorCalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workSchedule, setWorkSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [stats, setStats] = useState({
    totalDays: 30,
    workDays: 0,
    restDays: 30,
    morningShifts: 0,
    afternoonShifts: 0,
    fullDayShifts: 0
  });

  // Get doctor ID on component mount
  useEffect(() => {
    const fetchDoctorId = async () => {
      try {
        // Get current user
        const user = authService.getCurrentUser();
        
        if (!user) {
          throw new Error('Không tìm thấy thông tin người dùng');
        }
        
        // If user already has doctorId in their profile, use it directly
        if (user.doctorId) {
          setDoctorId(user.doctorId);
        } else {
          // Otherwise get doctor profile by user ID
          try {
            const doctorProfileResponse = await doctorService.getDoctorProfile(user.id);
            
            if (!doctorProfileResponse.success) {
              throw new Error(doctorProfileResponse.message || 'Không thể lấy thông tin bác sĩ');
            }
            
            const doctorData = doctorProfileResponse.data;
            setDoctorId(doctorData.id);
          } catch (profileError) {
            console.error('Error fetching doctor profile:', profileError);
            throw new Error('Không tìm thấy hồ sơ bác sĩ cho người dùng này');
          }
        }
      } catch (err) {
        console.error('Error fetching doctor information:', err);
        setError('Lỗi khi tải thông tin bác sĩ: ' + (err.message || 'Lỗi không xác định'));
      }
    };
    
    fetchDoctorId();
  }, []);

  // Fetch doctor's monthly work schedule when month or doctorId changes
  useEffect(() => {
    if (doctorId) {
      fetchWorkSchedule();
    }
  }, [currentMonth, doctorId]);

  const fetchWorkSchedule = async () => {
    try {
      setIsLoading(true);
      const year = getYear(currentMonth);
      const month = getMonth(currentMonth) + 1; // JavaScript months are 0-indexed
      
      // Call the actual API endpoint with doctor ID
      const response = await doctorService.getDoctorMonthlySchedule(doctorId, year, month);
      
      // Debug: Log the response to see its structure
      console.log('Schedule API response:', response);
      
      if (response.success) {
        let scheduleData = [];
        
        // Check if response.data has a workSchedule property (backend returns DoctorScheduleResponseDTO)
        if (response.data && response.data.workSchedule && Array.isArray(response.data.workSchedule)) {
          scheduleData = response.data.workSchedule
            .filter(scheduleItem => {
              // Only include days where the doctor is working (not "off" days)
              return scheduleItem.workStatus !== 'off' && scheduleItem.shifts && scheduleItem.shifts.length > 0;
            })
            .map(scheduleItem => {
              // Parse date from string
              const date = parseISO(scheduleItem.date);
              
              // Extract shifts
              const shifts = [];
              if (scheduleItem.shifts && Array.isArray(scheduleItem.shifts)) {
                scheduleItem.shifts.forEach(shift => {
                  if (shift.type === 'morning') shifts.push('morning');
                  if (shift.type === 'afternoon') shifts.push('afternoon');
                });
              }
              
              // Create timeSlots array from shifts - exactly matching the shift times
              const timeSlots = scheduleItem.shifts && Array.isArray(scheduleItem.shifts) 
                ? scheduleItem.shifts.map(shift => `${shift.start} - ${shift.end}`)
                : [];
              
              return {
                date,
                shifts,
                timeSlots,
                workStatus: scheduleItem.workStatus,
                notes: scheduleItem.notes,
                location: scheduleItem.location
              };
            });
          
          // Also update stats if available
          if (response.data.monthlyStats) {
            setStats({
              totalDays: response.data.monthlyStats.totalDays || 30,
              workDays: response.data.monthlyStats.workingDays || 0,
              restDays: response.data.monthlyStats.offDays || 30,
              morningShifts: scheduleData.filter(day => day.shifts.includes('morning')).length,
              afternoonShifts: scheduleData.filter(day => day.shifts.includes('afternoon')).length,
              fullDayShifts: response.data.monthlyStats.fullDays || 0
            });
          }
        } else {
          console.warn('Unexpected response format:', response.data);
        }
        
        console.log('Transformed schedule data:', scheduleData);
        setWorkSchedule(scheduleData);
        calculateWorkStats(scheduleData);
        setError(null);
      } else {
        console.error('API returned error:', response.message);
        setError('Không thể tải lịch làm việc: ' + response.message);
        setWorkSchedule([]);
      }
    } catch (err) {
      console.error('Error fetching work schedule:', err);
      setError('Lỗi khi tải lịch làm việc: ' + (err.message || 'Lỗi không xác định'));
      setWorkSchedule([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics for the month
  const calculateWorkStats = (schedule) => {
    const daysInMonth = new Date(
      getYear(currentMonth), 
      getMonth(currentMonth) + 1, 
      0
    ).getDate();
    
    const workDays = schedule.length;
    const morningShifts = schedule.filter(day => day.shifts.includes('morning')).length;
    const afternoonShifts = schedule.filter(day => day.shifts.includes('afternoon')).length;
    const fullDayShifts = schedule.filter(day => 
      day.shifts.includes('morning') && day.shifts.includes('afternoon')
    ).length;
    
    setStats({
      totalDays: daysInMonth,
      workDays: workDays,
      restDays: daysInMonth - workDays,
      morningShifts,
      afternoonShifts,
      fullDayShifts
    });
  };

  const renderHeader = () => {
    const dateFormat = "MMMM yyyy";

    return (
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-t-lg border-b border-blue-200">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="flex items-center justify-center p-2 rounded-full hover:bg-blue-100 transition-all duration-300"
        >
          <ChevronLeftIcon className="h-5 w-5 text-blue-600" />
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900 bg-white px-4 py-1 rounded-full shadow-sm">
          {format(currentMonth, dateFormat, { locale: vi })}
        </h2>
        
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="flex items-center justify-center p-2 rounded-full hover:bg-blue-100 transition-all duration-300"
        >
          <ChevronRightIcon className="h-5 w-5 text-blue-600" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const daysOfWeek = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const days = [];

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="py-2 text-center text-sm font-medium text-gray-700 uppercase bg-indigo-50 border-b border-indigo-100" key={i}>
          {daysOfWeek[i]}
        </div>
      );
    }

    return <div className="grid grid-cols-7">{days}</div>;
  };

  const getWorkShiftsForDay = (date) => {
    if (!date) return null;
    
    // Find the exact schedule for this date
    return workSchedule.find(scheduleDay => 
      isSameDay(scheduleDay.date, date)
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const rows = [];
    let days = [];

    // Get total days in month
    const daysInMonth = getDate(monthEnd);
    
    // Create calendar grid with only days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const formattedDate = format(date, "d");
      const daySchedule = getWorkShiftsForDay(date);
      
      days.push(
        <div
          key={date.toString()}
          className={`min-h-[120px] p-2 border relative calendar-day ${
            isToday(date) ? 'bg-blue-50 border-blue-300' : 'bg-white'
          } ${isSameDay(date, selectedDate) ? 'selected ring-2 ring-blue-500 ring-opacity-70 shadow-md' : ''} 
          hover:shadow-lg transition-all duration-300 hover:z-10`}
          onClick={() => setSelectedDate(date)}
        >
          <div className={`absolute top-0 right-0 mt-1 mr-1 w-6 h-6 flex items-center justify-center text-xs rounded-full
            ${isToday(date) ? 'bg-blue-500 text-white' : 'text-gray-600'}`}>
            {formattedDate}
          </div>

          <div className="pt-7 space-y-1.5">
            {daySchedule && daySchedule.shifts.includes('morning') && (
              <div className="bg-blue-100 text-blue-800 border border-blue-300 text-xs rounded-md px-1.5 py-1 flex items-center space-x-1">
                <ClockIcon className="h-3 w-3" />
                {/* Find the exact morning shift time */}
                {daySchedule.timeSlots.find(slot => slot.toLowerCase().includes('morning')) || 
                 <span>Ca sáng</span>}
              </div>
            )}
            
            {daySchedule && daySchedule.shifts.includes('afternoon') && (
              <div className="bg-amber-100 text-amber-800 border border-amber-300 text-xs rounded-md px-1.5 py-1 flex items-center space-x-1">
                <ClockIcon className="h-3 w-3" />
                {/* Find the exact afternoon shift time */}
                {daySchedule.timeSlots.find(slot => slot.toLowerCase().includes('afternoon')) || 
                 <span>Ca chiều</span>}
              </div>
            )}

            {/* Display any additional specific time slots */}
            {daySchedule && daySchedule.timeSlots && daySchedule.timeSlots.map((slot, index) => (
              <div 
                key={index}
                className="bg-amber-100 text-amber-800 border border-amber-300 text-xs rounded-md px-1.5 py-1 flex items-center space-x-1"
              >
                <ClockIcon className="h-3 w-3" />
                <span>{slot}</span>
              </div>
            ))}
            
            {(!daySchedule || (daySchedule.shifts.length === 0 && !daySchedule.timeSlots?.length)) && (
              <div className="flex items-center justify-center h-10 text-xs text-gray-400 mt-2">
                <MinusIcon className="h-4 w-4 mr-1" />
                <span>Nghỉ</span>
              </div>
            )}
          </div>
        </div>
      );
      
      // Create a new row for each week
      if (days.length === 7 || day === daysInMonth) {
        // If it's the last day of the month and not a complete row, add empty cells
        if (day === daysInMonth && days.length < 7) {
          const emptyCells = 7 - days.length;
          for (let i = 0; i < emptyCells; i++) {
            days.push(
              <div key={`empty-${i}`} className="min-h-[120px] p-2 border relative bg-white"></div>
            );
          }
        }
        
        rows.push(
          <div className="grid grid-cols-7" key={`row-${day}`}>
            {days}
          </div>
        );
        days = [];
      }
    }

    return <div className="calendar">{rows}</div>;
  };

  const renderStats = () => {
    return (
      <div className="mt-5 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600" />
          Thống kê tháng này
        </h4>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tổng số ngày:</span>
            <span className="text-sm font-medium text-gray-900">{stats.totalDays}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Ngày làm việc:</span>
            <span className="text-sm font-medium text-blue-600">{stats.workDays}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Ngày nghỉ:</span>
            <span className="text-sm font-medium text-gray-900">{stats.restDays}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Ca bán thời gian:</span>
            <span className="text-sm font-medium text-gray-900">{stats.workDays}</span>
          </div>
          
          <div className="h-px bg-gray-200 my-2"></div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tổng giờ làm:</span>
            <span className="text-sm font-medium text-blue-600">4h</span>
          </div>
        </div>
      </div>
    );
  };

  const renderDateInfo = () => {
    const daySchedule = getWorkShiftsForDay(selectedDate);
    
    return (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          {format(selectedDate, "EEEE, dd MMMM yyyy", { locale: vi })}
        </h3>
        
        {isToday(selectedDate) && (
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Hôm nay
            </span>
          </div>
        )}
        
        {!daySchedule && (
          <div className="py-4 text-center">
            <div className="flex flex-col items-center justify-center">
              <MinusIcon className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500">Nghỉ</p>
            </div>
          </div>
        )}
        
        {daySchedule && (
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h4 className="font-medium text-gray-700">Chi tiết - Thứ Ba, 24 tháng 6, 2025</h4>
              </div>
              
              <div className="p-4">
                <div className="space-y-3">
                  {daySchedule.shifts && daySchedule.shifts.includes('morning') && (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Ca sáng (8:00-12:00)</span>
                    </div>
                  )}
                  
                  {daySchedule.shifts && daySchedule.shifts.includes('afternoon') && (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-sm">Ca chiều (15:00-17:00)</span>
                    </div>
                  )}
                  
                  {daySchedule.timeSlots && daySchedule.timeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-sm">{slot}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {renderStats()}
      </div>
    );
  };

  return (
    <Layout currentRole={UserRole.DOCTOR}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <CalendarIcon className="h-8 w-8 text-primary-500 mr-3" />
              Lịch làm việc
            </h1>
            <p className="text-gray-600 mt-2 ml-11">
              Xem lịch trình làm việc và ca trực của bạn
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchWorkSchedule}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Làm mới
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Lỗi! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Legend */}
        <div className="bg-white rounded-lg p-4 mb-6 border shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <InformationCircleIcon className="h-5 w-5 mr-1 text-blue-500" />
            Chú thích
          </h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm">Ca sáng (8:00-12:00)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
              <span className="text-sm">Ca chiều (13:30-17:30)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
              <span className="text-sm">Nghỉ (Không làm việc)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 shadow-md rounded-lg hover:shadow-xl transition-all duration-300">
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              {renderHeader()}
              {renderDays()}
              {isLoading ? (
                <div className="flex justify-center items-center p-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                renderCells()
                )}
            </div>
          </div>

          {/* Selected date info */}
          <div className="shadow-md rounded-lg hover:shadow-xl transition-all duration-300">
            <div className="bg-white rounded-lg p-4 border border-gray-200 h-full">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                renderDateInfo()
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorCalendarPage; 