import React, { useState, useEffect } from 'react';
import {
  UserIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClipboardIcon
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Input from '../common/Input';

const PatientSelector = ({ patients, onSelect, onClose, title = "Chọn bệnh nhân" }) => {
  console.log("PatientSelector rendered with:", { 
    patientsLength: patients?.length,
    hasOnSelect: !!onSelect,
    hasOnClose: !!onClose,
    title 
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState(patients || []);
  
  // Apply search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
      return;
    }
    
    const lcSearchTerm = searchTerm.toLowerCase().trim();
    const filtered = patients.filter(patient => 
      patient.name?.toLowerCase().includes(lcSearchTerm) || 
      patient.id?.toString().includes(lcSearchTerm) ||
      patient.email?.toLowerCase().includes(lcSearchTerm) ||
      patient.phone?.toLowerCase().includes(lcSearchTerm)
    );
    
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <UserCircleIcon className="h-6 w-6 mr-2 text-indigo-600" />
            {title}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 border-b bg-gray-50">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên, ID, email hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mt-2 text-sm text-gray-600 flex items-center">
            <span className="flex-1">Tìm thấy {filteredPatients.length} bệnh nhân</span>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              {searchTerm ? (
                <>
                  <p className="text-gray-700 font-medium mb-2">Không tìm thấy bệnh nhân nào phù hợp với tìm kiếm</p>
                  <p className="text-gray-500">Thử tìm bằng thông tin khác hoặc xóa tìm kiếm</p>
                </>
              ) : (
                <>
                  <p className="text-gray-700 font-medium mb-2">Chưa có bệnh nhân nào</p>
                  <p className="text-gray-500">Bạn chưa có bệnh nhân nào hoặc chưa hoàn thành khám cho bệnh nhân</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 px-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-all duration-200 transform hover:scale-[1.01] hover:shadow-sm"
                >
                  <div onClick={() => onSelect(patient)} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4 text-indigo-700 font-medium">
                        {patient.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{patient.name || 'Không có tên'}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1 flex-wrap gap-x-3">
                          {patient.gender && patient.age && (
                            <span className="flex items-center">
                              <UserIcon className="h-4 w-4 mr-1" />
                              {patient.gender}, {patient.age} tuổi
                            </span>
                          )}
                          {patient.hasAppointment && (
                            <span className="flex items-center text-green-600">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              Đã có lịch khám
                            </span>
                          )}
                          {patient.hasCompletedAppointment && (
                            <span className="flex items-center text-blue-600">
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Đã hoàn thành khám
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        ID: {patient.id}
                      </span>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(patient);
                        }}
                      >
                        <ClipboardIcon className="h-4 w-4 mr-1" />
                        Tạo phác đồ
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatientSelector; 