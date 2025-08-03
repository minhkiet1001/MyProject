import React, { useState } from "react";
import Button from "../common/Button";
import { XMarkIcon } from "@heroicons/react/24/outline";
import managerDoctorService from "../../services/managerDoctorService";

const AddDoctorModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    birthdate: "",
    address: "",
    gender: "MALE",
    avatarUrl: "",
    specialty: "",
    degree: "",
    bio: "",
    experienceYears: "",
    maxPatientsPerDay: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Available specialties
  const specialties = [
    "Bệnh truyền nhiễm",
    "Miễn dịch học",
    "HIV/AIDS",
    "Nội khoa HIV"
  ];

  // Available degrees
  const degrees = [
    "BS",
    "ThS",
    "TS",
    "BSCK1",
    "BSCK2",
    "PGS",
    "GS",
    "MD",
    "PhD"
  ];

  // Available genders
  const genders = [
    { value: "MALE", label: "Nam" },
    { value: "FEMALE", label: "Nữ" },
    { value: "OTHER", label: "Khác" }
  ];

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    
    // Clear API error when user makes changes
    if (apiError) {
      setApiError("");
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên bác sĩ là bắt buộc";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.specialty) {
      newErrors.specialty = "Vui lòng chọn chuyên khoa";
    }

    if (!formData.gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }

    if (formData.experienceYears && 
        (isNaN(formData.experienceYears) || parseInt(formData.experienceYears) < 0)) {
      newErrors.experienceYears = "Số năm kinh nghiệm phải là số dương";
    }

    if (formData.maxPatientsPerDay && 
        (isNaN(formData.maxPatientsPerDay) || parseInt(formData.maxPatientsPerDay) < 0)) {
      newErrors.maxPatientsPerDay = "Số bệnh nhân tối đa phải là số dương";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      setApiError("");

      try {
        // Format doctor data for API
        const doctorData = managerDoctorService.formatDoctorData(formData);
        
        // Call API to create doctor
        const response = await managerDoctorService.createDoctor(doctorData);
        
        // Pass created doctor back to parent component
        onSave(response.data);

      // Reset form
      setFormData({
        name: "",
        email: "",
          password: "",
        phone: "",
          birthdate: "",
          address: "",
          gender: "MALE",
          avatarUrl: "",
        specialty: "",
          degree: "",
        bio: "",
          experienceYears: "",
          maxPatientsPerDay: "",
      });
      setErrors({});

      onClose();
      } catch (error) {
        setApiError(error.message || "Có lỗi xảy ra khi tạo bác sĩ");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      birthdate: "",
      address: "",
      gender: "MALE",
      avatarUrl: "",
      specialty: "",
      degree: "",
      bio: "",
      experienceYears: "",
      maxPatientsPerDay: "",
    });
    setErrors({});
    setApiError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Thêm Bác sĩ mới</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {apiError && (
          <div className="bg-red-50 text-red-700 p-3 mx-6 mt-4 rounded-md">
            <p>{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thông tin cá nhân */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Thông tin cá nhân
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.name ? "border-red-500" : "border-gray-300"
                }`}
                  placeholder="Nhập họ tên đầy đủ"
              />
              {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.email ? "border-red-500" : "border-gray-300"
                }`}
                  placeholder="email@example.com"
              />
              {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                  type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                  placeholder="Nhập số điện thoại"
              />
              {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Nhập địa chỉ"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.gender ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  {genders.map((gender) => (
                    <option key={gender.value} value={gender.value}>
                      {gender.label}
                    </option>
                  ))}
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                )}
              </div>
            </div>

            {/* Thông tin chuyên môn */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Thông tin chuyên môn
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chuyên khoa <span className="text-red-500">*</span>
              </label>
              <select
                name="specialty"
                value={formData.specialty}
                onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.specialty ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Chọn chuyên khoa</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
              {errors.specialty && (
                  <p className="text-red-500 text-sm mt-1">{errors.specialty}</p>
              )}
            </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Học vị
              </label>
              <select
                  name="degree"
                  value={formData.degree}
                onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
              >
                  <option value="">Chọn học vị</option>
                  {degrees.map((degree) => (
                    <option key={degree} value={degree}>
                      {degree}
                  </option>
                ))}
              </select>
            </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số năm kinh nghiệm
              </label>
              <input
                type="number"
                  name="experienceYears"
                  value={formData.experienceYears}
                onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.experienceYears ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập số năm kinh nghiệm"
                min="0"
              />
                {errors.experienceYears && (
                  <p className="text-red-500 text-sm mt-1">{errors.experienceYears}</p>
              )}
            </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số bệnh nhân tối đa mỗi ngày
              </label>
                <input
                  type="number"
                  name="maxPatientsPerDay"
                  value={formData.maxPatientsPerDay}
                onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.maxPatientsPerDay ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập số bệnh nhân tối đa mỗi ngày"
                  min="0"
                />
                {errors.maxPatientsPerDay && (
                  <p className="text-red-500 text-sm mt-1">{errors.maxPatientsPerDay}</p>
              )}
            </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiểu sử
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Nhập tiểu sử, kinh nghiệm làm việc..."
                  rows="4"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL hình ảnh
                </label>
                <input
                  type="text"
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Nhập URL hình ảnh"
              />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              onClick={handleClose}
              color="secondary"
              disabled={isLoading}
            >
            Hủy
          </Button>
            <Button type="submit" color="primary" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Thêm bác sĩ"}
          </Button>
        </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctorModal;
