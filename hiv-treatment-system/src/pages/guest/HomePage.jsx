import React from 'react';
import Layout from '../../components/layout/Layout';
import { UserRole } from '../../types/index.js';
import HeroSection from '../../components/guest/HeroSection';
import { Link, useLocation } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { 
  CalendarIcon, 
  ClipboardDocumentListIcon, 
  BeakerIcon, 
  HeartIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const role = searchParams.get('role');
  const isCustomer = role === 'customer';
  const currentRole = isCustomer ? UserRole.CUSTOMER : UserRole.GUEST;
  const userName = isCustomer ? 'Nguyễn Văn An' : undefined;

  // Main quick actions (shown for both guests and customers)
  const quickActions = [
    {
      id: 1,
      title: 'Xem lịch khám',
      description: 'Xem lịch làm việc của các bác sĩ và thời gian có sẵn.',
      icon: <CalendarIcon className="h-10 w-10 text-primary-600" />,
      link: '/schedule',
      requireLogin: false
    },
    {
      id: 2,
      title: 'Đội ngũ bác sĩ',
      description: 'Tìm hiểu về đội ngũ bác sĩ chuyên khoa của chúng tôi.',
      icon: <UserGroupIcon className="h-10 w-10 text-blue-600" />,
      link: '/doctors',
      requireLogin: false
    },
    {
      id: 3,
      title: 'Đặt lịch hẹn',
      description: 'Đặt lịch hẹn khám với bác sĩ chuyên khoa một cách dễ dàng.',
      icon: <CalendarIcon className="h-10 w-10 text-green-600" />,
      link: isCustomer ? '/customer/appointment-selection' : '/login',
      requireLogin: !isCustomer
    },
    {
      id: 4,
      title: 'Quản lý sức khỏe',
      description: 'Theo dõi thuốc, xét nghiệm và quá trình điều trị.',
      icon: <ClipboardDocumentListIcon className="h-10 w-10 text-orange-600" />,
      link: isCustomer ? '/customer/dashboard' : '/login',
      requireLogin: !isCustomer
    }
  ];

  // Mock data for main services (available to all)
  const mainServices = [
    {
      id: 1,
      title: 'Tư vấn HIV',
      description: 'Tư vấn chuyên nghiệp về phòng ngừa, điều trị và sống chung với HIV.',
      icon: <ChatBubbleLeftRightIcon className="h-10 w-10 text-green-600" />,
      link: '/services',
      available: true
    },
    {
      id: 2,
      title: 'Xét nghiệm & Sàng lọc',
      description: 'Dịch vụ xét nghiệm toàn diện với kết quả nhanh chóng và bảo mật tuyệt đối.',
      icon: <BeakerIcon className="h-10 w-10 text-blue-600" />,
      link: '/services',
      available: true
    },
    {
      id: 3,
      title: 'Hỗ trợ tâm lý',
      description: 'Dịch vụ hỗ trợ tâm lý và tư vấn sức khỏe tinh thần.',
      icon: <HeartIcon className="h-10 w-10 text-red-600" />,
      link: '/services',
      available: true
    },
    {
      id: 4,
      title: 'Điều trị ARV',
      description: 'Kế hoạch điều trị cá nhân hóa với thuốc kháng virus mới nhất.',
      icon: <ShieldCheckIcon className="h-10 w-10 text-purple-600" />,
      link: '/services',
      available: true
    },
    {
      id: 5,
      title: 'Giáo dục & Hỗ trợ',
      description: 'Tài liệu giáo dục và hỗ trợ cộng đồng cho người sống với HIV.',
      icon: <AcademicCapIcon className="h-10 w-10 text-indigo-600" />,
      link: '/resources',
      available: true
    }
  ];

  // Mock data for testimonials
  const testimonials = [
    {
      id: 1,
      quote: "Sự chăm sóc và hỗ trợ tôi nhận được thật đặc biệt. Đội ngũ đã giúp tôi tự tin điều trị HIV.",
      name: "Nguyễn T.L.",
      role: "Bệnh nhân từ 2019"
    },
    {
      id: 2,
      quote: "Tôi đã rất lo lắng khi bắt đầu điều trị, nhưng các bác sĩ đã kiên nhẫn, giải thích mọi thứ rõ ràng và hỗ trợ tôi từng bước.",
      name: "Trần V.M.",
      role: "Bệnh nhân từ 2021"
    },
    {
      id: 3,
      quote: "Cổng thông tin trực tuyến giúp việc quản lý lịch hẹn và thuốc dễ dàng hơn nhiều. Rất thuận tiện và an toàn.",
      name: "Lê T.H.",
      role: "Bệnh nhân từ 2020"
    }
  ];

  // Mock data for statistics
  const statistics = [
    { id: 1, value: '96%', label: 'Sự hài lòng của bệnh nhân' },
    { id: 2, value: '12k+', label: 'Bệnh nhân đã điều trị' },
    { id: 3, value: '25+', label: 'Bác sĩ chuyên khoa' },
    { id: 4, value: '15+', label: 'Năm kinh nghiệm' }
  ];

  return (
    <Layout currentRole={currentRole} userName={userName}>
      {/* Hero Section */}
      <HeroSection />

      {/* Quick Actions Banner - Show for both guests and customers */}
      <section className="py-12 bg-primary-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            {isCustomer ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Chào mừng trở lại, {userName}!</h2>
                <p className="text-gray-600">Quản lý sức khỏe của bạn một cách dễ dàng</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Dịch vụ chăm sóc sức khỏe</h2>
                <p className="text-gray-600">Đăng nhập để truy cập đầy đủ các tính năng quản lý sức khỏe</p>
              </>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <div key={action.id} className="relative">
                <Link to={action.link}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer relative">
                    {action.requireLogin && (
                      <div className="absolute top-2 right-2 z-10">
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div className="p-6 text-center">
                      <div className="mb-4 flex justify-center">{action.icon}</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                      {action.requireLogin && (
                        <div className="text-xs text-primary-600 font-medium">
                          Cần đăng nhập
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              </div>
            ))}
          </div>

          {!isCustomer && (
            <div className="text-center mt-8">
              <div className="bg-white rounded-lg p-6 max-w-xl mx-auto border border-primary-200">
                <LockClosedIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Đăng nhập để sử dụng đầy đủ</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Đăng nhập để đặt lịch hẹn, xem kết quả xét nghiệm và quản lý điều trị của bạn.
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <Link to="/login">
                    <Button variant="primary" size="sm">Đăng nhập</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="outline" size="sm">Đăng ký</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Dịch vụ chăm sóc HIV toàn diện</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chúng tôi cung cấp dịch vụ chăm sóc HIV toàn diện với trọng tâm là điều trị cá nhân hóa, hỗ trợ và giáo dục.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainServices.map((service) => (
              <Card key={service.id} className="h-full">
                <div className="p-6 flex flex-col h-full">
                  <div className="mb-4 flex justify-center">{service.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{service.title}</h3>
                  <p className="text-gray-600 mb-6 flex-grow text-center">{service.description}</p>
                  <div className="mt-auto text-center">
                    <Link to={service.link}>
                      <Button variant="outline" size="sm">Tìm hiểu thêm</Button>
                  </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Thành tựu của chúng tôi</h2>
            <p className="text-gray-600">Những con số chứng minh chất lượng dịch vụ</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statistics.map((stat) => (
              <div key={stat.id} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-lg text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Chia sẻ từ bệnh nhân</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trải nghiệm thực tế từ những người đã tin tưởng chúng tôi chăm sóc sức khỏe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="h-full bg-gray-50">
                <div className="p-6 flex flex-col h-full">
                  <div className="mb-4 text-primary-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-6 flex-grow italic">"{testimonial.quote}"</p>
                  <div className="mt-auto">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {isCustomer ? 'Cần hỗ trợ thêm?' : 'Sẵn sàng bắt đầu?'}
          </h2>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto mb-8">
            {isCustomer 
              ? 'Liên hệ với đội ngũ chuyên gia của chúng tôi để được hỗ trợ tốt nhất.'
              : 'Hãy thực hiện bước đầu tiên hướng tới chăm sóc HIV toàn diện với đội ngũ chuyên gia của chúng tôi.'
            }
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {isCustomer ? (
              <>
                <Link to="/customer/appointment-selection">
                  <Button variant="white" className="text-lg py-3 px-8">
                    Đặt lịch hẹn
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline-white" className="text-lg py-3 px-8">
                    Liên hệ hỗ trợ
                  </Button>
                </Link>
              </>
            ) : (
              <>
            <Link to="/register">
              <Button variant="white" className="text-lg py-3 px-8">
                    Đăng ký ngay
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline-white" className="text-lg py-3 px-8">
                    Liên hệ chúng tôi
              </Button>
            </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage; 