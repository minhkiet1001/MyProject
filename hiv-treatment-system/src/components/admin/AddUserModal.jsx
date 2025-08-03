import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import { UserRole } from '../../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const UserFormModal = ({ isOpen, onClose, onSave, editingUser, isLoading }) => {
  // Add state for API errors
  const [apiError, setApiError] = useState(null);

  // Create a dynamic schema based on whether we're editing or creating
  const getSchema = () => {
    // Base schema for all fields
    const baseSchema = {
  fullName: z.string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(50, 'Tên không được vượt quá 50 ký tự'),
  email: z.string()
    .email('Email không hợp lệ'),
  role: z.enum([UserRole.ADMIN, UserRole.MANAGER, UserRole.DOCTOR, UserRole.STAFF, UserRole.CUSTOMER]),
  phoneNumber: z.string()
    .regex(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số'),
  address: z.string()
    .min(5, 'Địa chỉ phải có ít nhất 5 ký tự')
    .max(200, 'Địa chỉ không được vượt quá 200 ký tự'),
  dateOfBirth: z.string()
    .refine((date) => {
          if (!date) return false; // Require a date
      const today = new Date();
      const dob = new Date(date);
      const age = today.getFullYear() - dob.getFullYear();
      return age >= 18;
    }, 'Người dùng phải từ 18 tuổi trở lên'),
      gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
        required_error: "Giới tính là bắt buộc",
      }),
  department: z.string()
    .optional()
    .superRefine((val, ctx) => {
          // Check if role is defined and if department is required for this role
          const role = ctx.parent?.role;
          if (!role) return; // Skip validation if role is undefined
          
          const requiresDepartment = [UserRole.DOCTOR, UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN].includes(role);
          if (requiresDepartment && (!val || val.trim() === '')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Khoa/Phòng ban là bắt buộc cho vai trò này'
        });
      }
    })
    };
    
    // Use more relaxed validation for editing
    if (editingUser) {
      // For editing, make all fields optional except the required ones
      return z.object({
        ...baseSchema,
        // Make the required fields mandatory
        fullName: baseSchema.fullName,
        email: baseSchema.email,
        role: baseSchema.role,
        // Make others optional with default values
        phoneNumber: z.string().regex(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số').optional().or(z.literal('')),
        address: z.string().min(5).max(200).optional().or(z.literal('')),
        dateOfBirth: z.string().optional().or(z.literal('')),
      });
    } else {
      // For new users, require all fields
      return z.object({
        ...baseSchema,
        password: z.string()
          .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
          .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
          .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
          .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số')
          .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt'),
        confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      role: UserRole.CUSTOMER,
      department: '',
      gender: 'MALE'
    },
    mode: 'onBlur' // Validate fields when they lose focus
  });

  const selectedRole = watch('role');
  const showDepartment = ['DOCTOR', 'STAFF', 'MANAGER', 'ADMIN'].includes(selectedRole);
  
  // Add more debug information
  useEffect(() => {
    console.log('Form values changed:', watch());
    console.log('Form errors:', errors);
  console.log('showDepartment:', showDepartment, 'selectedRole:', selectedRole);
  }, [watch(), errors, showDepartment, selectedRole]);

  const medicalDepartments = [
    'Khoa Nội',
    'Khoa Ngoại', 
    'Khoa Cấp cứu',
    'Khoa Bệnh truyền nhiễm',
    'Khoa Xét nghiệm'
  ];

  const adminDepartments = [
    'Phòng Kế hoạch',
    'Phòng Tài chính',
    'Phòng Hành chính',
    'Phòng IT'
  ];

  // Update the validation schema and reset form when editingUser changes
  useEffect(() => {
    console.log('editingUser changed:', editingUser);
    
    // Reset API error when modal reopens
    setApiError(null);
    
    // Create appropriate default values based on whether we're editing or not
    const defaultValues = editingUser ? {
      fullName: editingUser.fullName || '',
      email: editingUser.email || '',
      role: editingUser.role || UserRole.CUSTOMER,
      phoneNumber: editingUser.phoneNumber || '',
      address: editingUser.address || '',
      dateOfBirth: editingUser.dateOfBirth || '',
      gender: editingUser.gender || 'MALE',
      department: editingUser.department || ''
    } : {
      fullName: '',
      email: '',
      role: UserRole.CUSTOMER,
      phoneNumber: '',
      address: '',
      dateOfBirth: '',
      gender: 'MALE',
      department: '',
      password: '',
      confirmPassword: ''
    };
    
    console.log('Setting form defaults:', defaultValues);
    
    // Reset with new defaults
    reset(defaultValues);
    
    // Force the role to update properly
    if (editingUser?.role) {
      setTimeout(() => {
        setValue('role', editingUser.role);
      }, 0);
    }
  }, [editingUser, reset, setValue]);

  // Effect to handle changes in selected role
  useEffect(() => {
    console.log('Selected role changed:', selectedRole);
    if (selectedRole === UserRole.CUSTOMER) {
      setValue('department', '');
    }
  }, [selectedRole, setValue]);

  const onSubmit = async (data) => {
    console.log('Form submission attempt with data:', data);
    
    // Reset API error
    setApiError(null);
    
    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) {
      console.error('Form has validation errors:', errors);
      return; // Stop submission if there are errors
    }
    
    try {
      // Format data to match API expectations
      const userData = {
        name: data.fullName,
        email: data.email,
        phone: data.phoneNumber || '',
        address: data.address || '',
        birthdate: data.dateOfBirth || null,
        role: data.role || UserRole.CUSTOMER,
        gender: data.gender || 'MALE',
        department: data.department || null
      };
      
      // Include ID for existing users
      if (editingUser?.id) {
        userData.id = editingUser.id;
      }
      
      // Only include password for new users
      if (!editingUser && data.password) {
        userData.password = data.password;
      }

      console.log('Submitting user data to API:', userData);
      const result = await onSave(userData);
      console.log('Form submission result:', result);
      
      // Check if there's an error message in the response
      if (!result || !result.success) {
        // Extract the specific error message
        let errorMessage = result?.message || result?.error || 'Failed to save user. Please try again.';
        
        // Check for specific error cases
        if (errorMessage.includes('Email already exists')) {
          // Highlight the email field with an error
          setApiError('Email đã tồn tại trong hệ thống. Vui lòng sử dụng email khác.');
          // Focus the email input
          document.querySelector('input[name="email"]')?.focus();
        } else if (errorMessage.includes('Phone number already exists')) {
          setApiError('Số điện thoại đã tồn tại trong hệ thống. Vui lòng sử dụng số điện thoại khác.');
          document.querySelector('input[name="phoneNumber"]')?.focus();
      } else {
          setApiError(errorMessage);
        }
        return;
      }

      console.log('Form submission successful');
      onClose();
      reset();
    } catch (error) {
      console.error('Error saving user:', error);
      setApiError(error.message || 'An error occurred while saving user data.');
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed z-50 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg w-full max-w-2xl mx-4 p-6">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-primary-600" />
                <p className="mt-2 text-gray-600">Đang xử lý...</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-2xl font-semibold text-gray-900">
              {editingUser ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              disabled={isLoading}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Display API error if any */}
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-600">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Họ tên */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên
                </label>
                <input
                  type="text"
                  {...register('fullName')}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.fullName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  {...register('phoneNumber')}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>

              {/* Ngày sinh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  {...register('dateOfBirth')}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                )}
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  {...register('address')}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.address ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              {/* Giới tính */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giới tính
                </label>
                <select
                  {...register('gender')}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.gender ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                )}
              </div>

              {/* Vai trò */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò
                </label>
                <select
                  {...register('role')}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.role ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value={UserRole.CUSTOMER}>Bệnh nhân</option>
                  <option value={UserRole.STAFF}>Nhân viên</option>
                  <option value={UserRole.DOCTOR}>Bác sĩ</option>
                  <option value={UserRole.MANAGER}>Quản lý</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              {/* Khoa/Phòng ban */}
              {showDepartment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Khoa/Phòng ban
                  </label>
                  <select
                    {...register('department')}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      errors.department ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Chọn khoa/phòng ban</option>
                    <optgroup label="Khoa Y tế">
                      {medicalDepartments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Phòng ban Hành chính">
                      {adminDepartments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </optgroup>
                  </select>
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                  )}
                </div>
              )}

              {!editingUser && (
                <>
                  {/* Mật khẩu */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu
                    </label>
                    <input
                      type="password"
                      {...register('password')}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Xác nhận mật khẩu */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Xác nhận mật khẩu
                    </label>
                    <input
                      type="password"
                      {...register('confirmPassword')}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <Button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary-600 text-white hover:bg-primary-700 flex items-center"
              >
                {isLoading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : editingUser ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default UserFormModal; 