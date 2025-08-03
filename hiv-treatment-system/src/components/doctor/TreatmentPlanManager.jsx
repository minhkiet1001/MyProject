import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const TreatmentPlanManager = ({
  patient = null,
  existingPlan = null,
  arvOptions = [],
  onSavePlan,
}) => {
  const [formData, setFormData] = useState({
    arvRegimen: existingPlan?.arvRegimen || '',
    arvDosage: existingPlan?.arvDosage || '',
    nextVisitDate: existingPlan?.nextVisitDate 
      ? new Date(existingPlan.nextVisitDate).toISOString().split('T')[0] 
      : '',
    supportMedications: existingPlan?.supportMedications || [],
    instructions: existingPlan?.instructions || '',
    notes: existingPlan?.notes || '',
    expectedDuration: existingPlan?.expectedDuration || '6',
    followupFrequency: existingPlan?.followupFrequency || 'monthly',
    labTests: existingPlan?.labTests || [],
    status: existingPlan?.status || 'active',
  });

  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
  });

  const [newLabTest, setNewLabTest] = useState('');

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle medication input change
  const handleMedicationChange = (e) => {
    const { name, value } = e.target;
    setNewMedication({
      ...newMedication,
      [name]: value,
    });
  };

  // Add new medication to the list
  const handleAddMedication = () => {
    if (newMedication.name && newMedication.dosage && newMedication.frequency) {
      setFormData({
        ...formData,
        supportMedications: [
          ...formData.supportMedications,
          { ...newMedication, id: Date.now().toString() }
        ],
      });
      setNewMedication({
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
      });
    }
  };

  // Remove medication from the list
  const handleRemoveMedication = (id) => {
    setFormData({
      ...formData,
      supportMedications: formData.supportMedications.filter(med => med.id !== id),
    });
  };

  // Add new lab test to the list
  const handleAddLabTest = () => {
    if (newLabTest.trim()) {
      setFormData({
        ...formData,
        labTests: [...formData.labTests, newLabTest.trim()],
      });
      setNewLabTest('');
    }
  };

  // Remove lab test from the list
  const handleRemoveLabTest = (index) => {
    const updatedLabTests = [...formData.labTests];
    updatedLabTests.splice(index, 1);
    setFormData({
      ...formData,
      labTests: updatedLabTests,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSavePlan({
      ...formData,
      nextVisitDate: formData.nextVisitDate ? new Date(formData.nextVisitDate).toISOString() : null,
    });
  };

  return (
    <div className="space-y-6">
      {patient && (
        <Card>
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Thông tin bệnh nhân</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Họ và tên</p>
                <p className="text-base text-gray-900">{patient.fullName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Mã số bệnh nhân</p>
                <p className="text-base text-gray-900">{patient.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Ngày sinh</p>
                <p className="text-base text-gray-900">
                  {patient.dateOfBirth 
                    ? new Date(patient.dateOfBirth).toLocaleDateString('vi-VN') 
                    : 'Không có thông tin'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tình trạng HIV</p>
                <p className="text-base text-gray-900">
                  {patient.hivStatus === 'positive' ? 'Dương tính' : 
                   patient.hivStatus === 'negative' ? 'Âm tính' : 'Chưa xác định'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Số điện thoại</p>
                <p className="text-base text-gray-900">{patient.phoneNumber || 'Không có thông tin'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Dị ứng</p>
                <p className="text-base text-gray-900">{patient.allergies || 'Không có thông tin'}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card title={existingPlan ? 'Cập nhật kế hoạch điều trị' : 'Tạo kế hoạch điều trị mới'}>
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="arvRegimen">
                Phác đồ ARV <span className="text-red-500">*</span>
              </label>
              <select
                id="arvRegimen"
                name="arvRegimen"
                value={formData.arvRegimen}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              >
                <option value="">Chọn phác đồ ARV</option>
                {arvOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name} - {option.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="arvDosage">
                Liều dùng ARV <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="arvDosage"
                name="arvDosage"
                value={formData.arvDosage}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="VD: 1 viên mỗi ngày vào buổi sáng"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nextVisitDate">
                Ngày tái khám <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="nextVisitDate"
                name="nextVisitDate"
                value={formData.nextVisitDate}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="expectedDuration">
                Thời gian dự kiến (tháng)
              </label>
              <select
                id="expectedDuration"
                name="expectedDuration"
                value={formData.expectedDuration}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="3">3 tháng</option>
                <option value="6">6 tháng</option>
                <option value="12">12 tháng</option>
                <option value="24">24 tháng</option>
                <option value="indefinite">Không xác định (dài hạn)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="followupFrequency">
                Tần suất tái khám
              </label>
              <select
                id="followupFrequency"
                name="followupFrequency"
                value={formData.followupFrequency}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="weekly">Hàng tuần</option>
                <option value="biweekly">Hai tuần một lần</option>
                <option value="monthly">Hàng tháng</option>
                <option value="quarterly">Ba tháng một lần</option>
                <option value="biannually">Sáu tháng một lần</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
                Trạng thái kế hoạch
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="draft">Bản nháp</option>
                <option value="active">Đang điều trị</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="discontinued">Đã dừng</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="instructions">
                Hướng dẫn điều trị <span className="text-red-500">*</span>
              </label>
              <textarea
                id="instructions"
                name="instructions"
                rows={3}
                value={formData.instructions}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Hướng dẫn chi tiết về phác đồ điều trị"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
                Ghi chú bổ sung
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Thông tin bổ sung hoặc lưu ý cho kế hoạch điều trị"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thuốc bổ trợ</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="med-name">
                  Tên thuốc
                </label>
                <input
                  type="text"
                  id="med-name"
                  name="name"
                  value={newMedication.name}
                  onChange={handleMedicationChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="med-dosage">
                  Liều dùng
                </label>
                <input
                  type="text"
                  id="med-dosage"
                  name="dosage"
                  value={newMedication.dosage}
                  onChange={handleMedicationChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="med-frequency">
                  Tần suất
                </label>
                <input
                  type="text"
                  id="med-frequency"
                  name="frequency"
                  value={newMedication.frequency}
                  onChange={handleMedicationChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="med-duration">
                  Thời gian dùng
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="med-duration"
                    name="duration"
                    value={newMedication.duration}
                    onChange={handleMedicationChange}
                    className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>

            {formData.supportMedications.length > 0 ? (
              <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Tên thuốc</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Liều dùng</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tần suất</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Thời gian dùng</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Xóa</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {formData.supportMedications.map((med) => (
                      <tr key={med.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{med.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{med.dosage}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{med.frequency}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{med.duration}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            type="button"
                            onClick={() => handleRemoveMedication(med.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Chưa có thuốc bổ trợ nào được thêm.</p>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Xét nghiệm cần thực hiện</h3>
            
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={newLabTest}
                onChange={(e) => setNewLabTest(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Nhập tên xét nghiệm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddLabTest}
                className="flex-shrink-0"
              >
                Thêm
              </Button>
            </div>

            {formData.labTests.length > 0 ? (
              <ul className="mt-4 divide-y divide-gray-200 border border-gray-200 rounded-md">
                {formData.labTests.map((test, index) => (
                  <li key={index} className="flex justify-between items-center px-4 py-3 text-sm">
                    <span>{test}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLabTest(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">Chưa có xét nghiệm nào được thêm.</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline">
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              {existingPlan ? 'Cập nhật kế hoạch' : 'Tạo kế hoạch'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TreatmentPlanManager; 