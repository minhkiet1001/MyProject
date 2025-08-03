import React, { useState } from "react";
import { PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Button from "./Button";

const PatientInfoCard = ({ patientData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(patientData);
  const [tempData, setTempData] = useState({ ...patientData });

  // Bắt đầu chỉnh sửa
  const handleEditClick = () => {
    setTempData({ ...formData });
    setIsEditing(true);
  };

  // Hủy chỉnh sửa
  const handleCancelClick = () => {
    // Khôi phục dữ liệu tạm về dữ liệu gốc trước khi tắt chế độ chỉnh sửa
    setTempData({ ...formData });
    setIsEditing(false);
  };

  // Lưu thông tin đã chỉnh sửa
  const handleSaveClick = () => {
    setFormData({ ...tempData });
    setIsEditing(false);
    // Ở đây bạn có thể thêm API call để lưu dữ liệu vào backend
  };

  // Cập nhật dữ liệu tạm thời khi người dùng thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempData({
      ...tempData,
      [name]: value,
    });
  };

  // Hiển thị trường dữ liệu ở chế độ chỉ đọc
  const renderReadOnlyField = (label, value) => (
    <div className="mb-4">
      <div className="text-sm font-medium text-gray-600">{label}</div>
      <div className="mt-1 text-base text-gray-900">
        {value || "Chưa có thông tin"}
      </div>
    </div>
  );

  // Hiển thị trường dữ liệu ở chế độ chỉnh sửa
  const renderEditableField = (label, name, value, type = "text") => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-600">
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={value || ""}
        onChange={handleInputChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
      />
    </div>
  );

  // Hiển thị dropdown giới tính ở chế độ chỉnh sửa
  const renderGenderDropdown = () => (
    <div className="mb-4">
      <label
        htmlFor="gender"
        className="block text-sm font-medium text-gray-600"
      >
        Giới tính
      </label>
      <select
        name="gender"
        id="gender"
        value={tempData.gender || ""}
        onChange={handleInputChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
      >
        <option value="">Chọn giới tính</option>
        <option value="Nam">Nam</option>
        <option value="Nữ">Nữ</option>
        <option value="Khác">Khác</option>
      </select>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Thông tin bệnh nhân
        </h2>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditClick}
            className="flex items-center"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Chỉnh sửa
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button
              variant="danger"
              size="sm"
              onClick={handleCancelClick}
              className="flex items-center"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveClick}
              className="flex items-center"
            >
              <CheckIcon className="h-4 w-4 mr-1" />
              Lưu
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        {/* Thông tin cá nhân */}
        {isEditing ? (
          <>
            {renderEditableField("Tên bệnh nhân", "name", tempData.name)}
            {renderEditableField("Tuổi", "age", tempData.age, "number")}
            {renderGenderDropdown()}
            {renderEditableField(
              "Ngày chẩn đoán",
              "diagnosisDate",
              tempData.diagnosisDate,
              "date"
            )}
            {renderEditableField(
              "Dị ứng",
              "allergies",
              tempData.allergies,
              "textarea"
            )}
            {renderEditableField(
              "Bệnh khác",
              "comorbidities",
              tempData.comorbidities
            )}
          </>
        ) : (
          <>
            {renderReadOnlyField("Tên bệnh nhân", formData.name)}
            {renderReadOnlyField("Tuổi", formData.age)}
            {renderReadOnlyField("Giới tính", formData.gender)}
            {renderReadOnlyField("Ngày chẩn đoán", formData.diagnosisDate)}
            {renderReadOnlyField("Dị ứng", formData.allergies)}
            {renderReadOnlyField("Bệnh khác", formData.comorbidities)}
          </>
        )}
      </div>
    </div>
  );
};

export default PatientInfoCard;
