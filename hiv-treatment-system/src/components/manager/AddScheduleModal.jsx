import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Button from "../common/Button";

const AddScheduleModal = ({ isOpen, onClose, doctors, onSave }) => {
  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    startTime: "08:00",
    endTime: "17:00",
    type: "regular",
    maxSlots: 20,
    notes: "",
    recurring: false,
    recurringDays: [],
    endDate: "",
  });

  const [errors, setErrors] = useState({});

  const scheduleTypes = [
    { value: "regular", label: "Lịch thường xuyên" },
    { value: "half-day", label: "Nửa ngày" },
    { value: "evening", label: "Ca tối" },
    { value: "counseling", label: "Tư vấn" },
  ];

  const timeSlots = [
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRecurringDayChange = (day) => {
    setFormData((prev) => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter((d) => d !== day)
        : [...prev.recurringDays, day],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.doctorId) {
      newErrors.doctorId = "Vui lòng chọn bác sĩ";
    }

    if (!formData.date) {
      newErrors.date = "Vui lòng chọn ngày";
    }

    if (
      formData.startTime &&
      formData.endTime &&
      formData.startTime >= formData.endTime
    ) {
      newErrors.endTime = "Giờ kết thúc phải sau giờ bắt đầu";
    }

    if (!formData.maxSlots || formData.maxSlots < 1) {
      newErrors.maxSlots = "Số lượng slot phải lớn hơn 0";
    }

    if (formData.recurring && formData.recurringDays.length === 0) {
      newErrors.recurringDays = "Vui lòng chọn ít nhất một ngày trong tuần";
    }

    if (formData.recurring && !formData.endDate) {
      newErrors.endDate = "Vui lòng chọn ngày kết thúc cho lịch lặp lại";
    }

    if (
      formData.recurring &&
      formData.endDate &&
      new Date(formData.endDate) <= new Date(formData.date)
    ) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      if (formData.recurring) {
        // Generate multiple schedules for recurring days
        const schedules = generateRecurringSchedules();
        onSave(schedules); // Pass array to parent
      } else {
        // Single schedule
        const scheduleData = {
          ...formData,
          id: Date.now().toString(),
          status: "confirmed",
          bookedSlots: 0,
          isRecurring: false,
        };
        onSave(scheduleData);
      }

      handleClose();
    }
  };

  const generateRecurringSchedules = () => {
    const schedules = [];
    const startDate = new Date(formData.date);
    const endDate = new Date(formData.endDate);
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const dayName = dayNames[date.getDay()];

      if (formData.recurringDays.includes(dayName)) {
        schedules.push({
          ...formData,
          id: `${Date.now()}-${date.getTime()}`,
          date: date.toISOString().split("T")[0],
          status: "confirmed",
          bookedSlots: 0,
          isRecurring: true,
        });
      }
    }

    return schedules;
  };

  const handleClose = () => {
    setFormData({
      doctorId: "",
      date: "",
      startTime: "08:00",
      endTime: "17:00",
      type: "regular",
      maxSlots: 20,
      notes: "",
      recurring: false,
      recurringDays: [],
      endDate: "",
    });
    setErrors({});
    onClose();
  };

  const getSelectedDoctor = () => {
    return doctors.find((doctor) => doctor.id === formData.doctorId);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Thêm lịch làm việc mới
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bác sĩ *
                    </label>
                    <select
                      name="doctorId"
                      value={formData.doctorId}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                        errors.doctorId ? "border-red-300" : ""
                      }`}
                    >
                      <option value="">Chọn bác sĩ</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialty}
                        </option>
                      ))}
                    </select>
                    {errors.doctorId && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.doctorId}
                      </p>
                    )}
                  </div>

                  {/* Selected Doctor Info */}
                  {getSelectedDoctor() && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={getSelectedDoctor().avatar}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {getSelectedDoctor().name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getSelectedDoctor().specialty} •{" "}
                            {getSelectedDoctor().department}
                          </p>
                          <p className="text-xs text-gray-500">
                            Giờ làm việc thường:{" "}
                            {getSelectedDoctor().workingHours}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split("T")[0]}
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                          errors.date ? "border-red-300" : ""
                        }`}
                      />
                      {errors.date && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.date}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại lịch
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        {scheduleTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giờ bắt đầu *
                      </label>
                      <select
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giờ kết thúc *
                      </label>
                      <select
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                          errors.endTime ? "border-red-300" : ""
                        }`}
                      >
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      {errors.endTime && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.endTime}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số bệnh nhân tối đa *
                      </label>
                      <input
                        type="number"
                        name="maxSlots"
                        value={formData.maxSlots}
                        onChange={handleInputChange}
                        min="1"
                        max="50"
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                          errors.maxSlots ? "border-red-300" : ""
                        }`}
                      />
                      {errors.maxSlots && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.maxSlots}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Recurring Schedule Options */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        name="recurring"
                        checked={formData.recurring}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm font-medium text-gray-700">
                        Lặp lại theo tuần
                      </label>
                    </div>

                    {formData.recurring && (
                      <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chọn các ngày trong tuần *
                          </label>
                          <div className="grid grid-cols-7 gap-2">
                            {[
                              { value: "monday", label: "T2" },
                              { value: "tuesday", label: "T3" },
                              { value: "wednesday", label: "T4" },
                              { value: "thursday", label: "T5" },
                              { value: "friday", label: "T6" },
                              { value: "saturday", label: "T7" },
                              { value: "sunday", label: "CN" },
                            ].map((day) => (
                              <label
                                key={day.value}
                                className="flex flex-col items-center"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.recurringDays.includes(
                                    day.value
                                  )}
                                  onChange={() =>
                                    handleRecurringDayChange(day.value)
                                  }
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <span className="text-xs text-gray-600 mt-1">
                                  {day.label}
                                </span>
                              </label>
                            ))}
                          </div>
                          {errors.recurringDays && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.recurringDays}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày kết thúc lặp lại *
                          </label>
                          <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            min={
                              formData.date ||
                              new Date().toISOString().split("T")[0]
                            }
                            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                              errors.endDate ? "border-red-300" : ""
                            }`}
                          />
                          {errors.endDate && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.endDate}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            Lịch sẽ được tạo cho tất cả các ngày đã chọn trong
                            khoảng thời gian này
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="Thêm ghi chú về lịch làm việc này..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                    >
                      Hủy
                    </Button>
                    <Button type="submit" variant="primary">
                      {formData.recurring
                        ? "Tạo lịch lặp lại"
                        : "Tạo lịch làm việc"}
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddScheduleModal;
