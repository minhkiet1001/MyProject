import React from 'react';
import Layout from '../../components/layout/Layout';
import { UserRole } from '../../types/index.js';
import { Link, useLocation } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const ServicesPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const role = searchParams.get('role');
  const isCustomer = role === 'customer';
  const currentRole = isCustomer ? UserRole.CUSTOMER : UserRole.GUEST;
  const userName = isCustomer ? 'Nguyễn Văn An' : undefined;

  // Danh mục dịch vụ với các dịch vụ tương ứng
  const serviceCategories = [
    {
      id: 1,
      name: "Dịch Vụ Y Tế",
      description: "Phạm vi toàn diện các dịch vụ y tế của chúng tôi để chẩn đoán, điều trị và quản lý HIV.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      services: [
        {
          name: "Xét Nghiệm & Chẩn Đoán HIV",
          description: "Dịch vụ xét nghiệm HIV toàn diện với kết quả nhanh chóng và tư vấn bảo mật."
        },
        {
          name: "Liệu Pháp Kháng Retrovirus",
          description: "Kế hoạch điều trị cá nhân hóa với các thuốc kháng retrovirus hiện đại nhất."
        },
        {
          name: "Theo Dõi Sức Khỏe Định Kỳ",
          description: "Theo dõi liên tục số lượng CD4, tải lượng virus và tình trạng sức khỏe tổng thể."
        },
        {
          name: "Quản Lý Nhiễm Trùng Cơ Hội",
          description: "Phòng ngừa và điều trị các nhiễm trùng có thể xảy ra với HIV."
        }
      ]
    },
    {
      id: 2,
      name: "Dịch Vụ Hỗ Trợ",
      description: "Hỗ trợ về mặt cảm xúc, tâm lý và thực tế để giúp bạn quản lý cuộc sống với HIV.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      services: [
        {
          name: "Tư Vấn Cá Nhân",
          description: "Các buổi tư vấn trực tiếp với các chuyên viên tư vấn được đào tạo về các vấn đề liên quan đến HIV."
        },
        {
          name: "Nhóm Hỗ Trợ",
          description: "Kết nối với những người khác sống chung với HIV trong môi trường an toàn, hỗ trợ."
        },
        {
          name: "Quản Lý Hồ Sơ",
          description: "Hỗ trợ cá nhân hóa trong việc tìm hiểu về dịch vụ chăm sóc sức khỏe, dịch vụ xã hội và phúc lợi."
        },
        {
          name: "Hỗ Trợ Tuân Thủ",
          description: "Công cụ và chiến lược để giúp bạn duy trì việc tuân thủ đều đặn việc dùng thuốc."
        }
      ]
    },
    {
      id: 3,
      name: "Dịch Vụ Phòng Ngừa",
      description: "Chương trình và dịch vụ được thiết kế để ngăn ngừa lây truyền HIV và thúc đẩy sức khỏe cộng đồng.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      services: [
        {
          name: "PrEP (Dự Phòng Trước Phơi Nhiễm)",
          description: "Thuốc và tư vấn cho các cá nhân có nguy cơ cao nhiễm HIV."
        },
        {
          name: "PEP (Dự Phòng Sau Phơi Nhiễm)",
          description: "Thuốc khẩn cấp cho những người có khả năng mới tiếp xúc với HIV."
        },
        {
          name: "Giáo Dục Tình Dục An Toàn",
          description: "Tài nguyên và giáo dục về các biện pháp tình dục an toàn hơn và phòng ngừa HIV."
        },
        {
          name: "Tiếp Cận Cộng Đồng",
          description: "Các chương trình đưa xét nghiệm HIV, giáo dục và tài nguyên đến các cộng đồng dễ bị tổn thương."
        }
      ]
    },
    {
      id: 4,
      name: "Dịch Vụ Sức Khỏe Tổng Thể",
      description: "Chăm sóc toàn diện cho sức khỏe và sự khỏe mạnh tổng thể của bạn ngoài việc quản lý HIV.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      services: [
        {
          name: "Tư Vấn Dinh Dưỡng",
          description: "Hướng dẫn chế độ ăn uống cá nhân hóa để hỗ trợ hệ miễn dịch và sức khỏe tổng thể của bạn."
        },
        {
          name: "Dịch Vụ Sức Khỏe Tâm Thần",
          description: "Hỗ trợ chuyên nghiệp cho trầm cảm, lo âu và các vấn đề sức khỏe tâm thần khác."
        },
        {
          name: "Điều Trị Lạm Dụng Chất",
          description: "Chương trình giải quyết các vấn đề lạm dụng chất có thể ảnh hưởng đến điều trị HIV."
        },
        {
          name: "Chương Trình Tập Thể Dục",
          description: "Chương trình hoạt động thể chất được thiết kế đặc biệt cho những người sống với HIV."
        }
      ]
    }
  ];

  // Dịch vụ chuyên biệt
  const specialtyServices = [
    {
      id: 1,
      name: "Chăm Sóc HIV cho Phụ Nữ",
      description: "Dịch vụ chuyên biệt đáp ứng nhu cầu đặc thù của phụ nữ sống với HIV, bao gồm sức khỏe sinh sản và kế hoạch mang thai.",
      icon: "👩‍⚕️"
    },
    {
      id: 2,
      name: "Chăm Sóc HIV cho Trẻ Em",
      description: "Chăm sóc chu đáo cho trẻ em và thanh thiếu niên sống với HIV, bao gồm các dịch vụ hỗ trợ gia đình.",
      icon: "👶"
    },
    {
      id: 3,
      name: "Cơ Hội Nghiên Cứu",
      description: "Tiếp cận các thử nghiệm lâm sàng và nghiên cứu tập trung vào phát triển điều trị và phòng ngừa HIV.",
      icon: "🧪"
    }
  ];

  // Thông tin bảo hiểm và thanh toán
  const insuranceInfo = {
    accepted: ["Medicare", "Medicaid", "Blue Cross Blue Shield", "Aetna", "Cigna", "UnitedHealthcare"],
    payment: "Chúng tôi cung cấp phí theo thang đối với bệnh nhân không có bảo hiểm và có thể hỗ trợ đăng ký bảo hiểm và các chương trình hỗ trợ thuốc."
  };

  return (
    <Layout currentRole={currentRole} userName={userName}>
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4"><span>Dịch Vụ Chăm Sóc HIV Của Chúng Tôi</span></h1>
            <p className="text-xl text-indigo-100">
              <span>Chăm sóc toàn diện, chu đáo cho những người sống với HIV.
              Phạm vi dịch vụ của chúng tôi được thiết kế để giải quyết mọi khía cạnh sức khỏe và sự khỏe mạnh của bạn.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Services intro */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6"><span>Chăm Sóc HIV Toàn Diện</span></h2>
            <p className="text-xl text-gray-600 mb-8">
              <span>Chúng tôi cung cấp đầy đủ các dịch vụ để giải quyết các khía cạnh thể chất, tinh thần và xã hội của việc sống với HIV. 
              Phương pháp tích hợp của chúng tôi đảm bảo bạn nhận được sự chăm sóc toàn diện phù hợp với nhu cầu cá nhân của bạn.</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="bg-indigo-50 rounded-lg p-6">
                <div className="text-4xl text-indigo-600 mb-3">👨‍⚕️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2"><span>Chăm Sóc Y Tế Chuyên Nghiệp</span></h3>
                <p className="text-gray-600"><span>Từ các bác sĩ chuyên khoa được đào tạo về chăm sóc HIV</span></p>
              </div>
              <div className="bg-red-50 rounded-lg p-6">
                <div className="text-4xl text-red-600 mb-3">🤝</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2"><span>Cộng Đồng Hỗ Trợ</span></h3>
                <p className="text-gray-600"><span>Kết nối với những người hiểu hành trình của bạn</span></p>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <div className="text-4xl text-green-600 mb-3">📱</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2"><span>Công Cụ Sức Khỏe Kỹ Thuật Số</span></h3>
                <p className="text-gray-600"><span>Quản lý việc chăm sóc trực tuyến với nền tảng bảo mật của chúng tôi</span></p>
              </div>
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-4xl text-blue-600 mb-3">🌎</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2"><span>Chăm Sóc Dễ Tiếp Cận</span></h3>
                <p className="text-gray-600"><span>Nhiều địa điểm và lựa chọn khám sức khỏe từ xa</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main services sections */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="space-y-20">
            {serviceCategories.map((category) => (
              <div key={category.id} className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row items-center mb-10">
                  <div className="md:w-1/4 mb-6 md:mb-0 flex justify-center">
                    {category.icon}
                  </div>
                  <div className="md:w-3/4 md:pl-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{category.name}</h2>
                    <p className="text-xl text-gray-600">{category.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.services.map((service, index) => (
                    <Card key={index} className="h-full">
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                        <p className="text-gray-600">{service.description}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialty services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Dịch Vụ Chuyên Biệt</h2>
              <p className="text-xl text-gray-600">
                Chăm sóc chuyên biệt cho các nhóm dân số cụ thể và nhu cầu đặc biệt.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {specialtyServices.map((service) => (
                <Card key={service.id} className="h-full">
                  <div className="p-6 flex flex-col h-full">
                    <div className="text-4xl mb-4 text-center">{service.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{service.name}</h3>
                    <p className="text-gray-600 text-center">{service.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Insurance & Payment Information */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Thông Tin Bảo Hiểm & Thanh Toán</h2>
              <p className="text-xl text-gray-600">
                Chúng tôi cam kết làm cho dịch vụ của mình dễ tiếp cận với tất cả những ai cần.
              </p>
            </div>
            <Card>
              <div className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Chấp Nhận Các Gói Bảo Hiểm</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {insuranceInfo.accepted.map((plan, index) => (
                    <div key={index} className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600">{plan}</span>
                    </div>
                  ))}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Hỗ Trợ Thanh Toán</h3>
                <p className="text-gray-600 mb-6">{insuranceInfo.payment}</p>
                <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                  <p className="text-gray-700">
                    <strong>Cam kết của chúng tôi:</strong> Không ai bị từ chối vì không có khả năng chi trả. Các cố vấn tài chính của chúng tôi sẽ làm việc với bạn để tìm giải pháp phù hợp với khả năng tài chính.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Sẵn Sàng Bắt Đầu?</h2>
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-8">
            Hãy thực hiện bước đầu tiên hướng tới chăm sóc HIV toàn diện bằng cách đặt lịch hẹn hoặc tư vấn.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register">
              <Button variant="white" className="text-lg py-3 px-8">
                Đăng Ký Làm Bệnh Nhân
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline-white" className="text-lg py-3 px-8">
                Liên Hệ Với Chúng Tôi
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ServicesPage; 