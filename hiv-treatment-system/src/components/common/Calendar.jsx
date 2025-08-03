import React, { useState, useEffect } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Button from "./Button";
import Card from "./Card";

// Mock data for doctor/staff schedules
const generateMockSchedule = (doctorId, month, year) => {
  const schedules = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();

    // Skip weekends for most doctors (some work on Saturday)
    if (dayOfWeek === 0) continue; // Sunday
    if (dayOfWeek === 6 && Math.random() > 0.3) continue; // Saturday (30% chance)

    // Random days off
    if (Math.random() > 0.85) continue;

    const shifts = [];

    // Morning shift (8:00 - 12:00)
    if (Math.random() > 0.2) {
      shifts.push({
        id: `morning-${day}`,
        startTime: "08:00",
        endTime: "12:00",
        type: "morning",
        maxPatients: 8,
        bookedSlots: Math.floor(Math.random() * 6), // Random bookings
      });
    }

    // Afternoon shift (13:00 - 17:00)
    if (Math.random() > 0.3) {
      shifts.push({
        id: `afternoon-${day}`,
        startTime: "13:00",
        endTime: "17:00",
        type: "afternoon",
        maxPatients: 8,
        bookedSlots: Math.floor(Math.random() * 6),
      });
    }

    if (shifts.length > 0) {
      schedules.push({
        date: date.toISOString().split("T")[0],
        doctorId,
        shifts,
      });
    }
  }

  return schedules;
};

// Generate time slots for a shift
const generateTimeSlots = (startTime, endTime, maxPatients, bookedSlots) => {
  const slots = [];
  const start = new Date(`2024-01-01 ${startTime}`);
  const end = new Date(`2024-01-01 ${endTime}`);
  const slotDuration = (end - start) / maxPatients;

  for (let i = 0; i < maxPatients; i++) {
    const slotStart = new Date(start.getTime() + slotDuration * i);
    const slotEnd = new Date(start.getTime() + slotDuration * (i + 1));

    slots.push({
      id: `slot-${i}`,
      startTime: slotStart.toTimeString().slice(0, 5),
      endTime: slotEnd.toTimeString().slice(0, 5),
      isBooked: i < bookedSlots,
      patientName: i < bookedSlots ? `Bệnh nhân ${i + 1}` : null,
    });
  }

  return slots;
};

const Calendar = ({
  mode = "view", // 'view' | 'booking'
  doctorId = "1",
  onSlotSelect = null,
  selectedDate = null,
  showTimeSlots = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [selectedDay, setSelectedDay] = useState(selectedDate);
  const [viewMode, setViewMode] = useState("month"); // 'month' | 'week'

  useEffect(() => {
    const mockSchedules = generateMockSchedule(
      doctorId,
      currentDate.getMonth(),
      currentDate.getFullYear()
    );
    setSchedules(mockSchedules);
  }, [doctorId, currentDate]);

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getScheduleForDate = (day) => {
    if (!day) return null;
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    )
      .toISOString()
      .split("T")[0];
    return schedules.find((schedule) => schedule.date === dateStr);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDay(null);
  };

  const handleDayClick = (day) => {
    if (!day) return;

    const schedule = getScheduleForDate(day);
    if (!schedule && mode === "booking") return; // Can't select days without schedule in booking mode

    setSelectedDay(day);
    if (onSlotSelect) {
      const dateStr = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      )
        .toISOString()
        .split("T")[0];
      onSlotSelect(dateStr, schedule);
    }
  };

  const getDayClassName = (day) => {
    if (!day) return "";

    const schedule = getScheduleForDate(day);
    const isSelected = selectedDay === day;
    const isToday =
      new Date().toDateString() ===
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      ).toDateString();

    let className =
      "h-12 w-12 flex items-center justify-center rounded-lg text-sm font-medium cursor-pointer transition-colors ";

    if (isSelected) {
      className += "bg-primary-600 text-white ";
    } else if (isToday) {
      className += "bg-primary-100 text-primary-600 ";
    } else if (schedule) {
      const totalSlots = schedule.shifts.reduce(
        (sum, shift) => sum + shift.maxPatients,
        0
      );
      const bookedSlots = schedule.shifts.reduce(
        (sum, shift) => sum + shift.bookedSlots,
        0
      );
      const availableSlots = totalSlots - bookedSlots;

      if (availableSlots > 0) {
        className +=
          mode === "booking"
            ? "bg-green-100 text-green-700 hover:bg-green-200 "
            : "bg-blue-100 text-blue-700 hover:bg-blue-200 ";
      } else {
        className += "bg-red-100 text-red-700 ";
      }
    } else {
      className +=
        mode === "booking"
          ? "text-gray-300 cursor-not-allowed "
          : "text-gray-500 hover:bg-gray-100 ";
    }

    return className;
  };

  const getSelectedDaySchedule = () => {
    if (!selectedDay) return null;
    return getScheduleForDate(selectedDay);
  };

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      {mode === "booking" && (
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
            <span>Có lịch trống</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
            <span>Đã đầy lịch</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
            <span>Không có lịch làm việc</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="h-8 flex items-center justify-center text-sm font-medium text-gray-500"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth().map((day, index) => (
                  <div
                    key={index}
                    className={getDayClassName(day)}
                    onClick={() => handleDayClick(day)}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Day Details */}
        <div className="space-y-4">
          {selectedDay ? (
            <Card
              title={`Ngày ${selectedDay}/${
                currentDate.getMonth() + 1
              }/${currentDate.getFullYear()}`}
            >
              <div className="p-4">
                {(() => {
                  const schedule = getSelectedDaySchedule();
                  if (!schedule) {
                    return (
                      <div className="text-center py-8">
                        <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Không có lịch làm việc</p>
                        {mode === "booking" && (
                          <p className="text-sm text-gray-400 mt-2">
                            Vui lòng chọn ngày khác
                          </p>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {schedule.shifts.map((shift) => {
                        const timeSlots = generateTimeSlots(
                          shift.startTime,
                          shift.endTime,
                          shift.maxPatients,
                          shift.bookedSlots
                        );

                        return (
                          <div key={shift.id} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">
                                {shift.type === "morning"
                                  ? "Ca sáng"
                                  : "Ca chiều"}
                              </h4>
                              <span className="text-sm text-gray-500">
                                {shift.startTime} - {shift.endTime}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {timeSlots.map((slot) => (
                                <button
                                  key={slot.id}
                                  className={`p-2 rounded text-xs font-medium transition-colors ${
                                    slot.isBooked
                                      ? "bg-red-100 text-red-700 cursor-not-allowed"
                                      : mode === "booking"
                                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                  disabled={slot.isBooked}
                                  onClick={() => {
                                    if (
                                      mode === "booking" &&
                                      !slot.isBooked &&
                                      onSlotSelect
                                    ) {
                                      onSlotSelect(schedule.date, {
                                        ...shift,
                                        selectedSlot: slot,
                                      });
                                    }
                                  }}
                                >
                                  <div>{slot.startTime}</div>
                                  {slot.isBooked && (
                                    <div className="text-xs opacity-75">
                                      Đã đặt
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>

                            <div className="mt-2 text-xs text-gray-500">
                              Còn trống: {shift.maxPatients - shift.bookedSlots}
                              /{shift.maxPatients} slot
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </Card>
          ) : (
            <Card title="Chọn ngày">
              <div className="p-4 text-center text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Nhấp vào một ngày để xem chi tiết lịch làm việc</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Calendar icon component
const CalendarIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25m3 6.75H3.75m15.75 0v8.25a2.25 2.25 0 01-2.25 2.25H5.25a2.25 2.25 0 01-2.25-2.25v-8.25m15.75 0V9a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9v2.25"
    />
  </svg>
);

export default Calendar;
