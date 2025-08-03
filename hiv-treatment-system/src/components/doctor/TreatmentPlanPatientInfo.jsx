import React from 'react';
import {
  UserCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  BeakerIcon,
  CalendarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const TreatmentPlanPatientInfo = ({ patient }) => {
  if (!patient) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <ExclamationCircleIcon className="h-6 w-6 text-yellow-500 mr-2" />
          <p className="text-yellow-700 font-medium">Vui lòng chọn bệnh nhân</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-100">
      <div className="flex items-start">
        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
          <UserCircleIcon className="h-6 w-6 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{patient.name}</h3>
              <p className="text-sm text-gray-600">ID bệnh nhân: {patient.id}</p>
            </div>
            
            {patient.status && (
              <div className="mt-2 md:mt-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  patient.status === 'active' ? 'bg-green-100 text-green-800' :
                  patient.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {patient.status === 'active' ? 'Đang điều trị' :
                   patient.status === 'inactive' ? 'Không hoạt động' : 'Mới'}
                </span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            {(patient.gender || patient.age) && (
              <div className="flex items-center">
                <UserCircleIcon className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-700">
                  {patient.gender || ''}{patient.gender && patient.age ? ', ' : ''}{patient.age ? `${patient.age} tuổi` : ''}
                </span>
              </div>
            )}
            
            {patient.lastVisit && (
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-700">
                  Khám gần nhất: {typeof patient.lastVisit === 'string' ? patient.lastVisit : new Date(patient.lastVisit).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
            
            {patient.nextAppointment && (
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-700">
                  Lịch hẹn tiếp: {typeof patient.nextAppointment === 'string' ? patient.nextAppointment : new Date(patient.nextAppointment).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </div>
          
          {(patient.allergies || patient.currentMedications || patient.comorbidities) && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              {patient.allergies && patient.allergies.length > 0 && (
                <div className="flex items-start mb-2">
                  <ExclamationCircleIcon className="h-4 w-4 text-red-500 mr-1 mt-0.5" />
                  <span className="text-sm">
                    <span className="font-medium text-gray-700">Dị ứng:</span>{' '}
                    <span className="text-red-700">{Array.isArray(patient.allergies) ? patient.allergies.join(', ') : patient.allergies}</span>
                  </span>
                </div>
              )}
              
              {patient.comorbidities && patient.comorbidities.length > 0 && (
                <div className="flex items-start mb-2">
                  <ClipboardDocumentListIcon className="h-4 w-4 text-gray-500 mr-1 mt-0.5" />
                  <span className="text-sm">
                    <span className="font-medium text-gray-700">Bệnh đi kèm:</span>{' '}
                    <span className="text-gray-600">{Array.isArray(patient.comorbidities) ? patient.comorbidities.join(', ') : patient.comorbidities}</span>
                  </span>
                </div>
              )}
              
              {patient.currentMedications && patient.currentMedications.length > 0 && (
                <div className="flex items-start">
                  <BeakerIcon className="h-4 w-4 text-blue-500 mr-1 mt-0.5" />
                  <span className="text-sm">
                    <span className="font-medium text-gray-700">Thuốc hiện tại:</span>{' '}
                    <span className="text-gray-600">
                    {Array.isArray(patient.currentMedications) 
                      ? patient.currentMedications.map(m => typeof m === 'object' ? m.name : m).join(', ') 
                      : patient.currentMedications}
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreatmentPlanPatientInfo; 