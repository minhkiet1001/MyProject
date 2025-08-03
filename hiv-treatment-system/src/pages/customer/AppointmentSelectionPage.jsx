import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { UserRole } from "../../types/index.js";
import Button from "../../components/common/Button";
import { motion } from "framer-motion";
import {
  BeakerIcon,
  VideoCameraIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const AppointmentSelectionPage = () => {
  const navigate = useNavigate();

  const handleOptionSelect = (optionType) => {
    if (optionType === "lab-test") {
      navigate("/customer/appointments/new");
    } else if (optionType === "online-consultation") {
      navigate("/customer/online-consultation/new");
    }
  };

  return (
    <Layout currentRole={UserRole.CUSTOMER} pageTitle="Đặt lịch hẹn">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate("/customer/appointments")}
              className="hover:bg-gray-50 transition-all duration-300 flex items-center"
            >
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: -2 }}
                className="inline-flex items-center"
              >
                <span className="mr-1"></span> Danh sách lịch hẹn
              </motion.span>
            </Button>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Chọn loại lịch hẹn
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Đặt lịch xét nghiệm */}
            <div
              onClick={() => handleOptionSelect("lab-test")}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                    <BeakerIcon className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                  Đặt lịch xét nghiệm
                </h2>
                <p className="text-gray-600 mb-4">
                  Đặt lịch xét nghiệm trực tiếp tại phòng khám với các bác sĩ
                  chuyên khoa.
                </p>
              </div>
            </div>

            {/* Đặt lịch tư vấn trực tuyến */}
            <div
              onClick={() => handleOptionSelect("online-consultation")}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
                    <VideoCameraIcon className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                  Tư vấn trực tuyến
                </h2>
                <p className="text-gray-600 mb-4">
                  Đặt lịch tư vấn trực tuyến với bác sĩ qua video call, thuận
                  tiện và bảo mật.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Lưu ý:</span> Đối với các dịch vụ
              xét nghiệm, bạn cần đến trực tiếp cơ sở y tế. Các cuộc tư vấn trực
              tuyến được thực hiện qua video call với bác sĩ chuyên khoa.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AppointmentSelectionPage;
