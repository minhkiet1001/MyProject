import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Input from '../common/Input';
import medicationScheduleService from '../../services/medicationScheduleService';

const MedicationScheduleEditor = ({ medicationId, onSchedulesUpdated, disabled = false }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    timeOfDay: '08:00',
    dosageAmount: '',
    daysOfWeek: '',
    notes: ''
  });

  // Define days of week options
  const daysOfWeekOptions = [
    { value: 'MON', label: 'T2' },
    { value: 'TUE', label: 'T3' },
    { value: 'WED', label: 'T4' },
    { value: 'THU', label: 'T5' },
    { value: 'FRI', label: 'T6' },
    { value: 'SAT', label: 'T7' },
    { value: 'SUN', label: 'CN' }
  ];

  // State for selected days
  const [selectedDays, setSelectedDays] = useState([]);

  // Update daysOfWeek string when selectedDays changes
  useEffect(() => {
    const daysString = selectedDays.join(',');
    setNewSchedule(prev => ({ ...prev, daysOfWeek: daysString }));
  }, [selectedDays]);

  // Fetch existing schedules when the component mounts or medicationId changes
  useEffect(() => {
    if (medicationId) {
      fetchSchedules();
    }
  }, [medicationId]);

  // Fetch schedules from the API
  const fetchSchedules = async () => {
    if (!medicationId) return;
    
    setLoading(true);
    try {
      const response = await medicationScheduleService.getSchedulesForMedication(medicationId);
      if (response && response.data) {
        setSchedules(response.data);
        if (onSchedulesUpdated) {
          onSchedulesUpdated(response.data);
        }
      } else {
        setError('Không thể tải lịch uống thuốc');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải lịch uống thuốc');
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create default schedules based on medication frequency
  const createDefaultSchedules = async () => {
    if (!medicationId) return;
    
    setLoading(true);
    try {
      const response = await medicationScheduleService.createDefaultSchedules(medicationId);
      if (response && response.data) {
        setSchedules(response.data);
        setSuccess('Đã tạo lịch uống thuốc mặc định');
        if (onSchedulesUpdated) {
          onSchedulesUpdated(response.data);
        }
      } else {
        setError('Không thể tạo lịch uống thuốc mặc định');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tạo lịch uống thuốc');
      console.error('Error creating default schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle day selection
  const handleDayToggle = (day) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  // Toggle all days
  const toggleAllDays = () => {
    if (selectedDays.length === daysOfWeekOptions.length) {
      // If all days are selected, deselect all
      setSelectedDays([]);
    } else {
      // Otherwise, select all days
      setSelectedDays(daysOfWeekOptions.map(day => day.value));
    }
  };

  // Reset form and selected days
  const resetForm = () => {
    setNewSchedule({
      timeOfDay: '08:00',
      dosageAmount: '',
      daysOfWeek: '',
      notes: ''
    });
    setSelectedDays([]);
    setShowAddSchedule(false);
    setEditingScheduleId(null);
  };

  // Start editing an existing schedule
  const startEditSchedule = (schedule) => {
    setEditingScheduleId(schedule.id);
    setNewSchedule({
      timeOfDay: schedule.timeOfDay,
      dosageAmount: schedule.dosageAmount,
      daysOfWeek: schedule.daysOfWeek || '',
      notes: schedule.notes || ''
    });
    
    // Set selected days based on the schedule's daysOfWeek
    if (schedule.daysOfWeek) {
      setSelectedDays(schedule.daysOfWeek.split(','));
    } else {
      setSelectedDays([]);
    }
    
    setShowAddSchedule(true);
  };

  // Add or update a schedule
  const saveSchedule = async () => {
    if (!medicationId || !newSchedule.timeOfDay || !newSchedule.dosageAmount) {
      setError('Vui lòng nhập thời gian và số lượng uống');
      return;
    }
    
    setLoading(true);
    try {
      if (editingScheduleId) {
        // Update existing schedule
        const response = await medicationScheduleService.updateSchedule(editingScheduleId, {
          timeOfDay: newSchedule.timeOfDay,
          dosageAmount: newSchedule.dosageAmount,
          daysOfWeek: newSchedule.daysOfWeek,
          notes: newSchedule.notes
        });
        
        if (response && response.data) {
          // Replace the updated schedule in the list
          const updatedSchedules = schedules.map(schedule => 
            schedule.id === editingScheduleId ? response.data : schedule
          );
          setSchedules(updatedSchedules);
          setSuccess('Đã cập nhật lịch uống thuốc');
          resetForm();
          if (onSchedulesUpdated) {
            onSchedulesUpdated(updatedSchedules);
          }
        } else {
          setError('Không thể cập nhật lịch uống thuốc');
        }
      } else {
        // Add new schedule
        const scheduleRequest = [{
          timeOfDay: newSchedule.timeOfDay,
          dosageAmount: newSchedule.dosageAmount,
          daysOfWeek: newSchedule.daysOfWeek,
          notes: newSchedule.notes
        }];
        
        const response = await medicationScheduleService.createCustomSchedules(medicationId, scheduleRequest);
        if (response && response.data) {
          setSchedules([...schedules, ...response.data]);
          setSuccess('Đã thêm lịch uống thuốc mới');
          resetForm();
          if (onSchedulesUpdated) {
            onSchedulesUpdated([...schedules, ...response.data]);
          }
        } else {
          setError('Không thể thêm lịch uống thuốc');
        }
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi lưu lịch uống thuốc');
      console.error('Error saving schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a schedule
  const deleteSchedule = async (scheduleId) => {
    if (!scheduleId) return;
    
    setLoading(true);
    try {
      const response = await medicationScheduleService.deleteSchedule(scheduleId);
      if (response) {
        const updatedSchedules = schedules.filter(schedule => schedule.id !== scheduleId);
        setSchedules(updatedSchedules);
        setSuccess('Đã xóa lịch uống thuốc');
        if (onSchedulesUpdated) {
          onSchedulesUpdated(updatedSchedules);
        }
      } else {
        setError('Không thể xóa lịch uống thuốc');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi xóa lịch uống thuốc');
      console.error('Error deleting schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format days of week for display
  const formatDaysOfWeek = (daysOfWeek) => {
    if (!daysOfWeek) return 'Hàng ngày';
    
    const dayMap = {
      'MON': 'Thứ 2',
      'TUE': 'Thứ 3',
      'WED': 'Thứ 4',
      'THU': 'Thứ 5',
      'FRI': 'Thứ 6',
      'SAT': 'Thứ 7',
      'SUN': 'Chủ nhật'
    };
    
    return daysOfWeek.split(',').map(day => dayMap[day] || day).join(', ');
  };

  if (!medicationId) {
    return (
      <div className="text-center py-4 text-gray-500">
        Vui lòng chọn thuốc trước khi thêm lịch uống
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Lịch uống thuốc</h4>
        <div className="flex space-x-2">
          {/* <Button
            variant="outline"
            size="xs"
            onClick={createDefaultSchedules}
            disabled={loading || disabled}
          >
            <ClockIcon className="h-3 w-3 mr-1" />
            Tạo lịch mặc định
          </Button> */}
          <Button
            variant="outline"
            size="xs"
            onClick={() => setShowAddSchedule(true)}
            disabled={loading || disabled || showAddSchedule}
          >
            <PlusIcon className="h-3 w-3 mr-1" />
            Thêm lịch
          </Button>
        </div>
      </div>

      <div className="text-xs text-gray-500 italic mb-2">
        <span className="font-medium">Lưu ý:</span> Liều lượng kê đơn là hàm lượng thuốc (mg, ml), còn số lượng uống là số viên/lượng thuốc cần uống mỗi lần.
      </div>

      {error && (
        <div className="p-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs">
          {error}
        </div>
      )}

      {success && (
        <div className="p-2 bg-green-50 border-l-4 border-green-500 text-green-700 text-xs">
          {success}
        </div>
      )}

      {loading && (
        <div className="text-center py-2">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent"></div>
          <span className="ml-2 text-xs text-gray-500">Đang xử lý...</span>
        </div>
      )}

      {showAddSchedule && (
        <div className="border border-blue-200 rounded-md p-3 bg-blue-50">
          <h5 className="text-xs font-medium text-blue-800 mb-2">
            {editingScheduleId ? 'Sửa lịch uống thuốc' : 'Thêm lịch uống thuốc mới'}
          </h5>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Thời gian <span className="text-red-500">*</span>
              </label>
              <Input
                type="time"
                value={newSchedule.timeOfDay}
                onChange={(e) => setNewSchedule({...newSchedule, timeOfDay: e.target.value})}
                className="text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Số lượng uống <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={newSchedule.dosageAmount}
                onChange={(e) => setNewSchedule({...newSchedule, dosageAmount: e.target.value})}
                placeholder="VD: 1 viên"
                className="text-xs"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Các ngày trong tuần
              </label>
              <div className="flex flex-wrap gap-2 bg-white p-2 rounded-md border border-gray-200">
                <button 
                  type="button"
                  onClick={toggleAllDays}
                  className={`text-xs px-2 py-1 rounded-md ${
                    selectedDays.length === daysOfWeekOptions.length 
                      ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {selectedDays.length === daysOfWeekOptions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
                {daysOfWeekOptions.map(day => (
                  <label 
                    key={day.value} 
                    className={`flex items-center cursor-pointer px-2 py-1 rounded-md ${
                      selectedDays.includes(day.value) 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day.value)}
                      onChange={() => handleDayToggle(day.value)}
                      className="sr-only" // Hide the actual checkbox
                    />
                    <span className="text-xs">{day.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Để trống = uống hàng ngày</p>
            </div>
            
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <Input
                type="text"
                value={newSchedule.notes}
                onChange={(e) => setNewSchedule({...newSchedule, notes: e.target.value})}
                placeholder="Ghi chú thêm (nếu có)"
                className="text-xs"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end space-x-2">
            <Button
              variant="outline"
              size="xs"
              onClick={resetForm}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              size="xs"
              onClick={saveSchedule}
              disabled={loading || !newSchedule.timeOfDay || !newSchedule.dosageAmount}
            >
              {editingScheduleId ? (
                <>Cập nhật</>
              ) : (
                <>
                  <PlusIcon className="h-3 w-3 mr-1" />
                  Thêm lịch
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {schedules.length === 0 ? (
        <div className="text-center py-3 bg-gray-50 rounded-md border border-gray-200">
          <p className="text-xs text-gray-500">Chưa có lịch uống thuốc nào</p>
          <p className="text-xs text-gray-400 mt-1">Bấm "Tạo lịch mặc định" hoặc "Thêm lịch" để thêm mới</p>
        </div>
      ) : (
        <div className="space-y-2">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 text-blue-500 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    {schedule.formattedTime || schedule.timeOfDay} - {schedule.dosageAmount}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDaysOfWeek(schedule.daysOfWeek)}
                    {schedule.notes && ` - ${schedule.notes}`}
                  </div>
                </div>
              </div>
              {!disabled && (
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => startEditSchedule(schedule)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    disabled={loading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => deleteSchedule(schedule.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    disabled={loading}
                  >
                    <TrashIcon className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicationScheduleEditor;
