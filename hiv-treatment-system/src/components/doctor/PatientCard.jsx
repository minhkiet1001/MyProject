import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UserCircleIcon, 
  ClockIcon,
  PhoneIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import StatusBadge from '../common/StatusBadge';

/**
 * PatientCard component for displaying patient information in a card format
 * 
 * @param {Object} patient - Patient data object
 * @param {string} type - Card type (appointment, waiting, patient)
 * @param {boolean} isNew - Whether this is a newly added patient
 * @param {Function} onAction - Callback for primary action
 * @param {string} actionLabel - Label for primary action button
 */
const PatientCard = ({ 
  patient, 
  type = 'patient', 
  isNew = false,
  onAction,
  actionLabel = 'Xem chi tiết'
}) => {
  if (!patient) return null;
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };
  
  // Format time helper
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Calculate waiting time for appointments
  const getWaitingTime = (scheduledAt) => {
    if (!scheduledAt) return '';
    const now = new Date();
    const scheduledTime = new Date(scheduledAt);
    
    // If scheduled time is in the future, return "Chưa đến giờ"
    if (scheduledTime > now) return "Chưa đến giờ";
    
    const diffMs = now - scheduledTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Vừa đến";
    if (diffMins < 60) return `${diffMins} phút`;
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours} giờ ${mins} phút`;
  };
  
  // Determine card styling based on type
  const getCardStyle = () => {
    switch (type) {
      case 'appointment':
        return 'border-blue-200 bg-blue-50';
      case 'waiting':
        return 'border-indigo-200 bg-indigo-50';
      case 'patient':
      default:
        return 'border-gray-200 bg-white';
    }
  };
  
  // Determine if this is a high priority patient (waiting > 30 min)
  const isHighPriority = () => {
    if (type !== 'waiting' || !patient.scheduledAt) return false;
    
    const now = new Date();
    const scheduledTime = new Date(patient.scheduledAt);
    const diffMs = now - scheduledTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    return diffMins > 30;
  };
  
  return (
    <div 
      className={`
        rounded-lg border p-4 shadow-sm transition-all duration-300
        ${getCardStyle()}
        ${isNew ? 'animate-pulse border-yellow-400' : ''}
        ${isHighPriority() ? 'border-red-400' : ''}
        hover:shadow-md
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {patient.profileImage ? (
            <img 
              src={patient.profileImage} 
              alt={patient.name || patient.userName || "Patient"} 
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <UserCircleIcon className="h-10 w-10 text-gray-400" />
          )}
          
          <div>
            <h3 className="font-medium text-gray-900">
              {patient.name || patient.userName || "N/A"}
            </h3>
            
            {patient.status && (
              <StatusBadge status={patient.status} size="sm" className="mt-1" />
            )}
          </div>
        </div>
        
        {type === 'waiting' && (
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500">Thời gian chờ</span>
            <span className={`text-sm font-medium ${isHighPriority() ? 'text-red-600' : 'text-gray-900'}`}>
              {getWaitingTime(patient.scheduledAt)}
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-3 space-y-2 text-sm">
        {/* Show different details based on card type */}
        {type === 'appointment' && (
          <>
            <div className="flex items-center text-gray-600">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>{formatDate(patient.scheduledAt)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <ClockIcon className="mr-2 h-4 w-4" />
              <span>{formatTime(patient.scheduledAt)}</span>
            </div>
            {patient.serviceName && (
              <div className="flex items-center text-gray-600">
                <ChartBarIcon className="mr-2 h-4 w-4" />
                <span>{patient.serviceName}</span>
              </div>
            )}
          </>
        )}
        
        {type === 'waiting' && patient.serviceName && (
          <div className="flex items-center text-gray-600">
            <ChartBarIcon className="mr-2 h-4 w-4" />
            <span>{patient.serviceName}</span>
          </div>
        )}
        
        {type === 'patient' && (
          <>
            {patient.dateOfBirth && (
              <div className="flex items-center text-gray-600">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Ngày sinh: {formatDate(patient.dateOfBirth)}</span>
              </div>
            )}
            {patient.phoneNumber && (
              <div className="flex items-center text-gray-600">
                <PhoneIcon className="mr-2 h-4 w-4" />
                <span>{patient.phoneNumber}</span>
              </div>
            )}
            {patient.lastVisit && (
              <div className="flex items-center text-gray-600">
                <ClockIcon className="mr-2 h-4 w-4" />
                <span>Lần khám gần nhất: {formatDate(patient.lastVisit)}</span>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="mt-4 flex justify-end">
        {onAction ? (
          <button
            onClick={() => onAction(patient)}
            className="rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            {actionLabel}
          </button>
        ) : (
          <Link
            to={`/doctor/patients/${patient.id || patient.userId}`}
            className="rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
};

export default PatientCard; 