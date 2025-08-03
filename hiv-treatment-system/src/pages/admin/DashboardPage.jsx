import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import UserFormModal from '../../components/admin/AddUserModal';
import { UserRole } from '../../types/index.js';
import {
  UserIcon,
  UserGroupIcon,
  CogIcon,
  ShieldCheckIcon,
  ServerIcon,
  ChartBarIcon,
  BellAlertIcon,
  PlusIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Account statistics by role
  const accountStats = {
    admin: {
      total: 5,
      trend: '+1',
      percentage: '+25%',
      icon: ShieldCheckIcon,
      color: 'from-red-500 to-red-600'
    },
    staff: {
      total: 200,
      trend: '+15',
      percentage: '+8.1%',
      icon: UserGroupIcon,
      color: 'from-green-500 to-green-600'
    },
    doctor: {
      total: 150,
      trend: '+10',
      percentage: '+7.1%',
      icon: UserIcon,
      color: 'from-blue-500 to-blue-600'
    },
    manager: {
      total: 20,
      trend: '+2',
      percentage: '+11.1%',
      icon: CogIcon,
      color: 'from-purple-500 to-purple-600'
    }
  };

  // System alerts
  const systemAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Cảnh báo bảo mật',
      message: 'Phát hiện nhiều lần đăng nhập thất bại từ IP 192.168.1.100',
      timestamp: '2 giờ trước',
      priority: 'high'
    },
    {
      id: 2,
      type: 'info',
      title: 'Cập nhật hệ thống',
      message: 'Bản cập nhật mới v2.1.0 đã sẵn sàng để cài đặt',
      timestamp: '4 giờ trước',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'success',
      title: 'Sao lưu thành công',
      message: 'Sao lưu dữ liệu tự động hoàn tất lúc 03:00 AM',
      timestamp: '1 ngày trước',
      priority: 'low'
    }
  ];

  const handleSaveUser = (userData) => {
    console.log('New user created:', userData);
    alert(`Đã tạo người dùng mới: ${userData.fullName}`);
  };

  return (
    <Layout currentRole={UserRole.ADMIN} userName="Admin">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển Admin</h1>
            <p className="mt-2 text-gray-600">
              Quản lý tài khoản và giám sát hệ thống
            </p>
          </div>

        </div>

        {/* Account Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(accountStats).map(([role, stats]) => (
            <Card key={role} className={`bg-gradient-to-br ${stats.color} text-white transform hover:scale-105 transition-transform duration-200`}>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium opacity-80 capitalize">{role}</p>
                    <h3 className="text-3xl font-bold mt-2">{stats.total}</h3>
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg">
                    <stats.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  <span>{stats.trend}</span>
                  <span className="ml-2 opacity-80">({stats.percentage})</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* System Alerts */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BellAlertIcon className="h-6 w-6 mr-2 text-yellow-500" />
            Cảnh báo hệ thống
          </h2>
          <div className="space-y-4">
            {systemAlerts.map(alert => (
              <Card key={alert.id} className={`
                transform hover:scale-[1.01] transition-transform duration-200
                ${alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  alert.type === 'info' ? 'bg-blue-50 border-blue-200' :
                  'bg-green-50 border-green-200'}
              `}>
                <div className="p-4 flex items-start">
                  <div className={`
                    p-2 rounded-full mr-4
                    ${alert.type === 'warning' ? 'bg-yellow-100' :
                      alert.type === 'info' ? 'bg-blue-100' :
                      'bg-green-100'}
                  `}>
                    {alert.type === 'warning' ? (
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-700" />
                    ) : alert.type === 'info' ? (
                      <BellAlertIcon className="h-5 w-5 text-blue-700" />
                    ) : (
                      <CheckCircleIcon className="h-5 w-5 text-green-700" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`
                        font-medium
                        ${alert.type === 'warning' ? 'text-yellow-800' :
                          alert.type === 'info' ? 'text-blue-800' :
                          'text-green-800'}
                      `}>
                        {alert.title}
                      </h3>
                      <span className="text-xs text-gray-500 flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {alert.timestamp}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{alert.message}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <div className={`
                        text-xs px-2 py-1 rounded-full
                        ${alert.priority === 'high' ? 'bg-red-100 text-red-800' :
                          alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'}
                      `}>
                        {alert.priority === 'high' ? 'Ưu tiên cao' :
                         alert.priority === 'medium' ? 'Ưu tiên trung bình' :
                         'Ưu tiên thấp'}
                      </div>
                      <Button
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* System Overview */}
        <div className="mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2 text-primary-600" />
              Tổng quan hệ thống
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center transform hover:scale-105 transition-transform duration-200">
                <div className="text-3xl font-bold text-blue-600">3</div>
                <div className="text-sm text-gray-500">Trang quản trị</div>
                <div className="text-xs text-gray-400 mt-1">Tập trung cốt lõi</div>
              </div>
              <div className="text-center transform hover:scale-105 transition-transform duration-200">
                <div className="text-3xl font-bold text-green-600">15+</div>
                <div className="text-sm text-gray-500">Component hoàn thiện</div>
                <div className="text-xs text-gray-400 mt-1">UI chuyên nghiệp</div>
              </div>
              <div className="text-center transform hover:scale-105 transition-transform duration-200">
                <div className="text-3xl font-bold text-purple-600">100%</div>
                <div className="text-sm text-gray-500">Tính năng hoàn thành</div>
                <div className="text-xs text-gray-400 mt-1">Sẵn sàng sản xuất</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg shadow-sm"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span>Xuất dữ liệu</span>
          </Button>
        </div>

        {/* Add User Modal */}
        <UserFormModal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          onSave={handleSaveUser}
        />
      </div>
    </Layout>
  );
};

export default DashboardPage; 