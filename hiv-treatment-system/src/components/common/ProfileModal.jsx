import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  UserIcon,
  PencilIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import authService from "../../services/authService";

const ProfileModal = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    birthdate: "",
    address: "",
    gender: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const profileData = await authService.getProfile();
      setProfile(profileData);

      // Initialize form data
      setFormData({
        name: profileData.name || "",
        phone: profileData.phone || "",
        birthdate: profileData.birthdate || "",
        address: profileData.address || "",
        gender: profileData.gender || "",
      });
    } catch (error) {
      setError("Không thể tải thông tin profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const updatedProfile = await authService.updateProfile(formData);
      setProfile(updatedProfile);
      setSuccess("Cập nhật thông tin thành công!");
      setIsEditing(false);

      // Auto hide success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Không thể cập nhật profile: " + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile data
    setFormData({
      name: profile?.name || "",
      phone: profile?.phone || "",
      birthdate: profile?.birthdate || "",
      address: profile?.address || "",
      gender: profile?.gender || "",
    });
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    setIsEditing(false);
    setError("");
    setSuccess("");
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatGender = (gender) => {
    if (!gender) return "Chưa cập nhật";
    return gender === "MALE" ? "Nam" : gender === "FEMALE" ? "Nữ" : "Khác";
  };

  const formatRole = (role) => {
    const roleMap = {
      ADMIN: "Quản trị viên",
      MANAGER: "Quản lý",
      STAFF: "Nhân viên",
      DOCTOR: "Bác sĩ",
      CUSTOMER: "Khách hàng",
      GUEST: "Khách",
    };
    return roleMap[role] || role;
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium text-white"
                        >
                          Thông tin cá nhân
                        </Dialog.Title>
                        <p className="text-primary-100 text-sm">
                          {profile
                            ? `${formatRole(profile.role)} • ID: ${profile.id}`
                            : "Đang tải..."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!isEditing && !loading && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={handleClose}
                        className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      <span className="ml-3 text-gray-600">
                        Đang tải thông tin...
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Messages */}
                      {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-600 text-sm">{error}</p>
                        </div>
                      )}

                      {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                          <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
                          <p className="text-green-600 text-sm">{success}</p>
                        </div>
                      )}

                      {!isEditing ? (
                        // View Mode
                        <div className="space-y-6">
                          {/* User Avatar and Basic Info */}
                          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                            <div className="h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center">
                              <span className="text-white font-medium text-xl">
                                {profile?.name?.charAt(0).toUpperCase() || "U"}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                {profile?.name || "Chưa cập nhật"}
                              </h4>
                              <p className="text-gray-600">{profile?.email}</p>
                              <p className="text-sm text-primary-600 font-medium">
                                {formatRole(profile?.role)}
                              </p>
                            </div>
                          </div>

                          {/* Profile Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-500">
                                Số điện thoại
                              </label>
                              <p className="text-gray-900">
                                {profile?.phone || "Chưa cập nhật"}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-500">
                                Ngày sinh
                              </label>
                              <p className="text-gray-900">
                                {formatDate(profile?.birthdate)}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-500">
                                Giới tính
                              </label>
                              <p className="text-gray-900">
                                {formatGender(profile?.gender)}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-500">
                                Vai trò
                              </label>
                              <p className="text-gray-900">
                                {formatRole(profile?.role)}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-500">
                                Trạng thái
                              </label>
                              <p
                                className={`text-gray-900 ${
                                  profile?.status === "ACTIVE"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {profile?.status === "ACTIVE"
                                  ? "Đang hoạt động"
                                  : "Đã khóa"}
                              </p>
                            </div>

                            <div className="md:col-span-2 space-y-1">
                              <label className="text-sm font-medium text-gray-500">
                                Địa chỉ
                              </label>
                              <p className="text-gray-900">
                                {profile?.address || "Chưa cập nhật"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Edit Mode
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Họ và tên
                              </label>
                              <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Nhập họ và tên"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email (không thể thay đổi)
                              </label>
                              <input
                                type="email"
                                value={profile?.email}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Số điện thoại
                              </label>
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Nhập số điện thoại"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngày sinh
                              </label>
                              <input
                                type="date"
                                name="birthdate"
                                value={formData.birthdate}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giới tính
                              </label>
                              <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              >
                                <option value="">Chọn giới tính</option>
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                                <option value="OTHER">Khác</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vai trò (không thể thay đổi)
                              </label>
                              <input
                                type="text"
                                value={formatRole(profile?.role)}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Địa chỉ
                              </label>
                              <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Nhập địa chỉ"
                              />
                            </div>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </div>

                {/* Footer */}
                {isEditing && !loading && (
                  <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={updating}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors duration-200 flex items-center"
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang cập nhật...
                        </>
                      ) : (
                        "Lưu thay đổi"
                      )}
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ProfileModal;
