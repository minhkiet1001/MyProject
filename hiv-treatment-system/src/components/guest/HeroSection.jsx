import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <img src="/images/hero-image.svg" alt="Dịch vụ điều trị HIV" className="max-w-full h-auto" />
          </div>
          <div className="md:w-1/2 md:pl-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              <span>Điều trị HIV và 
              Dịch vụ Y tế</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              <span>Giải pháp chăm sóc sức khỏe toàn diện cho điều trị HIV, xét nghiệm và dịch vụ hỗ trợ.
              Đội ngũ tận tâm của chúng tôi cung cấp dịch vụ chăm sóc cá nhân hóa trong môi trường bảo mật và hỗ trợ.</span>
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/services">
                <Button
                  variant="primary"
                  className="text-lg py-3 px-8"
                >
                  <span>Dịch vụ của chúng tôi</span>
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="outline"
                  className="text-lg py-3 px-8"
                >
                  <span>Đăng ký ngay</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection; 