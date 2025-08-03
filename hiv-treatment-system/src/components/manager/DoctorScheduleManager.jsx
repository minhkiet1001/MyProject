import React, { useState, useEffect } from "react";
import {
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import managerScheduleService from "../../services/managerScheduleService";
import Button from "../common/Button";
import {
  format,
  parseISO,
  addDays,
  startOfWeek,
  isSameDay,
  startOfDay,
  isBefore,
} from "date-fns";
import { vi } from "date-fns/locale";

const DoctorScheduleManager = ({ doctor, onSchedulesChanged }) => {
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addDays(new Date(), 30));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states for adding new schedule
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    doctorId: doctor?.id || null,
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "08:00",
    endTime: "17:00",
    slotDurationMinutes: 30,
    isAvailable: true,
  });

  // Batch schedule form
  const [batchSchedule, setBatchSchedule] = useState({
    doctorId: doctor?.id || null,
    dates: [],
    startTime: "08:00",
    endTime: "17:00",
    slotDurationMinutes: 30,
    isAvailable: true,
  });

  // Selected days for batch scheduling
  const [selectedDates, setSelectedDates] = useState([]);

  useEffect(() => {
    if (doctor && doctor.id) {
      loadDoctorSchedules();
      // Cập nhật doctorId trong các form
      setNewSchedule((prev) => ({ ...prev, doctorId: doctor.id }));
      setBatchSchedule((prev) => ({ ...prev, doctorId: doctor.id }));
    }
  }, [doctor, startDate, endDate]);

  const loadDoctorSchedules = async () => {
    if (!doctor || !doctor.id) return;

    setLoading(true);
    try {
      const formattedStartDate =
        managerScheduleService.formatDateForAPI(startDate);
      const formattedEndDate = managerScheduleService.formatDateForAPI(endDate);

      const response = await managerScheduleService.getDoctorSchedules(
        doctor.id,
        formattedStartDate,
        formattedEndDate
      );

      if (response.success && Array.isArray(response.data)) {
        setSchedules(response.data);
      } else {
        setError("Không thể tải lịch làm việc");
      }
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra khi tải lịch làm việc");
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    // Kiểm tra ngày có phải là ngày trong quá khứ không
    const today = startOfDay(new Date());
    if (isBefore(date, today)) {
      setError("Không thể chọn ngày trong quá khứ");
      return;
    }

    // Check if the date is already selected
    const dateStr = format(date, "yyyy-MM-dd");
    let updatedDates;

    if (selectedDates.includes(dateStr)) {
      // Remove date if already selected
      updatedDates = selectedDates.filter((d) => d !== dateStr);
    } else {
      // Add date if not selected
      updatedDates = [...selectedDates, dateStr];
    }

    // Update selectedDates state
    setSelectedDates(updatedDates);

    // Update the batch schedule with the same dates
    setBatchSchedule({
      ...batchSchedule,
      dates: updatedDates,
      doctorId: doctor?.id,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule({
      ...newSchedule,
      [name]: value,
    });

    // Clear any previous messages
    setError("");
    setSuccess("");
  };

  const handleBatchInputChange = (e) => {
    const { name, value } = e.target;
    setBatchSchedule({
      ...batchSchedule,
      [name]: value,
    });

    // Clear any previous messages
    setError("");
    setSuccess("");
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();

    if (!doctor || !doctor.id) {
      setError("Chưa chọn bác sĩ");
      return;
    }

    setLoading(true);
    try {
      // Đảm bảo doctorId được thiết lập đúng
      const scheduleData = {
        ...newSchedule,
        doctorId: doctor.id,
      };

      const response = await managerScheduleService.addDoctorSchedule(
        doctor.id,
        scheduleData
      );

      if (response.success) {
        setSuccess("Đã thêm lịch làm việc thành công");
        setShowAddForm(false);
        // Reset form
        setNewSchedule({
          doctorId: doctor.id,
          date: format(new Date(), "yyyy-MM-dd"),
          startTime: "08:00",
          endTime: "17:00",
          slotDurationMinutes: 30,
          isAvailable: true,
        });
        // Reload schedules
        loadDoctorSchedules();
        // Notify parent
        if (onSchedulesChanged) onSchedulesChanged();
      } else {
        setError(response.message || "Không thể thêm lịch làm việc");
      }
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra khi thêm lịch làm việc");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBatchSchedules = async (e) => {
    e.preventDefault();

    if (!doctor || !doctor.id) {
      setError("Chưa chọn bác sĩ");
      return;
    }

    if (batchSchedule.dates.length === 0) {
      setError("Vui lòng chọn ít nhất một ngày");
      return;
    }

    // Kiểm tra và lọc ngày trong quá khứ
    const today = startOfDay(new Date());
    const validDates = batchSchedule.dates.filter((dateStr) => {
      const date = parseISO(dateStr);
      return !isBefore(date, today);
    });

    if (validDates.length === 0) {
      setError(
        "Không có ngày hợp lệ được chọn. Ngày phải từ ngày hiện tại trở đi."
      );
      return;
    }

    if (validDates.length < batchSchedule.dates.length) {
      setError("Một số ngày không hợp lệ (trong quá khứ) đã bị loại bỏ.");
    }

    setLoading(true);
    try {
      // Đảm bảo doctorId được thiết lập đúng
      const batchData = {
        ...batchSchedule,
        dates: validDates,
        doctorId: doctor.id,
      };

      const response = await managerScheduleService.addBatchDoctorSchedules(
        doctor.id,
        batchData
      );

      if (response.success) {
        setSuccess(`Đã thêm ${response.data.length} lịch làm việc thành công`);
        setShowBatchForm(false);
        // Reset form
        setBatchSchedule({
          doctorId: doctor.id,
          dates: [],
          startTime: "08:00",
          endTime: "17:00",
          slotDurationMinutes: 30,
          isAvailable: true,
        });
        setSelectedDates([]);
        // Reload schedules
        loadDoctorSchedules();
        // Notify parent
        if (onSchedulesChanged) onSchedulesChanged();
      } else {
        setError(response.message || "Không thể thêm lịch làm việc hàng loạt");
      }
    } catch (err) {
      setError(
        err.message || "Đã có lỗi xảy ra khi thêm lịch làm việc hàng loạt"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa lịch làm việc này?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await managerScheduleService.deleteSchedule(scheduleId);

      if (response.success) {
        setSuccess("Đã xóa lịch làm việc thành công");
        // Update local state to remove the deleted schedule
        setSchedules(schedules.filter((s) => s.id !== scheduleId));
        // Notify parent
        if (onSchedulesChanged) onSchedulesChanged();
      } else {
        setError(response.message || "Không thể xóa lịch làm việc");
      }
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra khi xóa lịch làm việc");
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = () => {
    let days = [];
    let currentDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start from Monday
    const today = startOfDay(new Date());

    for (let i = 0; i < 30; i++) {
      const dayDate = addDays(currentDate, i);
      const formattedDate = format(dayDate, "yyyy-MM-dd");
      const isSelected = selectedDates.includes(formattedDate);
      const isPastDate = isBefore(dayDate, today);

      // Check if there's already a schedule for this date
      const hasSchedule = schedules.some((s) =>
        isSameDay(parseISO(s.date), dayDate)
      );

      days.push(
        <div
          key={formattedDate}
          className={`p-2 text-center border rounded ${
            isPastDate
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "cursor-pointer " +
                (isSelected
                  ? "bg-green-100 border-green-500"
                  : hasSchedule
                  ? "bg-gray-100 border-gray-400"
                  : "hover:bg-gray-50")
          }`}
          onClick={() => !isPastDate && handleDateSelect(dayDate)}
        >
          <div className="text-xs text-gray-500">
            {format(dayDate, "EEE", { locale: vi })}
          </div>
          <div className={`font-semibold ${isPastDate ? "text-gray-400" : ""}`}>
            {format(dayDate, "d", { locale: vi })}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-green-600" />
          Lịch Làm Việc - {doctor?.name || "Chưa chọn bác sĩ"}
        </h3>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          <p>{success}</p>
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between mb-4">
          <div className="space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setShowAddForm(true);
                setShowBatchForm(false);
              }}
              disabled={loading || !doctor}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Thêm Lịch Làm Việc
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowBatchForm(true);
                setShowAddForm(false);
              }}
              disabled={loading || !doctor}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Thêm Hàng Loạt
            </Button>
          </div>
        </div>

        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-4">
              Thêm Lịch Làm Việc Mới
            </h4>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày
                  </label>
                  <input
                    type="date"
                    name="date"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    value={newSchedule.date}
                    min={format(new Date(), "yyyy-MM-dd")}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ bắt đầu
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    value={newSchedule.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ kết thúc
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    value={newSchedule.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời lượng (phút)
                  </label>
                  <select
                    name="slotDurationMinutes"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    value={newSchedule.slotDurationMinutes}
                    onChange={handleInputChange}
                  >
                    <option value="15">15 phút</option>
                    <option value="30">30 phút</option>
                    <option value="45">45 phút</option>
                    <option value="60">60 phút</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    id="isAvailable"
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    checked={newSchedule.isAvailable}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        isAvailable: e.target.checked,
                      })
                    }
                  />
                  <label
                    htmlFor="isAvailable"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Khả dụng
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Đang xử lý..." : "Thêm lịch làm việc"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {showBatchForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-4">
              Thêm Lịch Làm Việc Hàng Loạt
            </h4>
            <form onSubmit={handleAddBatchSchedules}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn các ngày
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {generateCalendarDays()}
                </div>
                {selectedDates.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    Đã chọn {selectedDates.length} ngày
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ bắt đầu
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    value={batchSchedule.startTime}
                    onChange={handleBatchInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ kết thúc
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    value={batchSchedule.endTime}
                    onChange={handleBatchInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời lượng (phút)
                  </label>
                  <select
                    name="slotDurationMinutes"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    value={batchSchedule.slotDurationMinutes}
                    onChange={handleBatchInputChange}
                  >
                    <option value="15">15 phút</option>
                    <option value="30">30 phút</option>
                    <option value="45">45 phút</option>
                    <option value="60">60 phút</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBatchForm(false)}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || selectedDates.length === 0}
                >
                  {loading ? "Đang xử lý..." : "Thêm lịch làm việc"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {loading && !showAddForm && !showBatchForm && (
          <p className="py-4 text-gray-500 text-center">
            Đang tải lịch làm việc...
          </p>
        )}

        {!loading && schedules.length === 0 && (
          <p className="py-4 text-gray-500 text-center">
            Chưa có lịch làm việc nào
          </p>
        )}

        {!loading && schedules.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ngày
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Thời gian
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Thời lượng
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Trạng thái
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
                {schedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {format(parseISO(schedule.date), "dd/MM/yyyy")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(parseISO(schedule.date), "EEEE", {
                          locale: vi,
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {schedule.startTime.substring(0, 5)} -{" "}
                        {schedule.endTime.substring(0, 5)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {schedule.slotDurationMinutes} phút / lịch hẹn
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          schedule.isAvailable
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {schedule.isAvailable ? "Khả dụng" : "Không khả dụng"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        disabled={loading}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorScheduleManager;
