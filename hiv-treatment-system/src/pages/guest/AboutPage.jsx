import React from 'react';
import Layout from '../../components/layout/Layout';
import { UserRole } from '../../types/index.js';
import Card from '../../components/common/Card';
import { Link, useLocation } from 'react-router-dom';
import Button from '../../components/common/Button';

const AboutPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const role = searchParams.get('role');
  const isCustomer = role === 'customer';
  const currentRole = isCustomer ? UserRole.CUSTOMER : UserRole.GUEST;
  const userName = isCustomer ? 'Nguyễn Văn An' : undefined;

  // Mock data for team members
  const teamMembers = [
    {
      id: 1,
      name: "BS. Nguyễn Thị khoi",
      role: "Chuyên gia HIV",
      image: "https://randomuser.me/api/portraits/women/64.jpg",
      bio: "BS. Nguyễn đã chuyên về điều trị HIV trong hơn 15 năm. Cô tận tâm cung cấp dịch vụ chăm sóc toàn diện và luôn cập nhật với những tiến bộ mới nhất."
    },
    {
      id: 2,
      name: "BS. Trần Văn Hải",
      role: "Chuyên gia bệnh truyền nhiễm",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      bio: "Là một chuyên gia bệnh truyền nhiễm hàng đầu, BS. Trần mang đến nhiều kiến thức phong phú về các chiến lược phòng ngừa và điều trị HIV cho đội ngũ của chúng tôi."
    },
    {
      id: 3,
      name: "BS. Lê Thị Hương",
      role: "Cố vấn HIV",
      image: "https://randomuser.me/api/portraits/women/45.jpg",
      bio: "Với nền tảng về tâm lý học và tư vấn HIV, BS. Lê cung cấp hỗ trợ tinh thần và tâm lý thiết yếu cho bệnh nhân của chúng tôi."
    },
    {
      id: 4,
      name: "TS. Phạm Minh Tuấn",
      role: "Giám đốc nghiên cứu",
      image: "https://randomuser.me/api/portraits/men/67.jpg",
      bio: "TS. Phạm lãnh đạo các sáng kiến nghiên cứu của chúng tôi, đảm bảo rằng chúng tôi luôn đi đầu trong các đổi mới và tiến bộ lâm sàng về điều trị HIV."
    }
  ];

  // Mission and vision content
  const missionVision = {
    mission: "Cung cấp dịch vụ chăm sóc HIV toàn diện, chất lượng cao và nhân văn cho tất cả những người cần, đồng thời nâng cao nhận thức và giáo dục cộng đồng về phòng ngừa và điều trị HIV.",
    vision: "Hướng tới một thế giới không có ca nhiễm HIV mới, nơi những người sống chung với HIV được tiếp cận đầy đủ với dịch vụ chăm sóc, được hỗ trợ và sống không bị kỳ thị."
  };

  // Timeline events
  const timeline = [
    {
      year: "2005",
      title: "Thành lập phòng khám",
      description: "Trung tâm điều trị HIV của chúng tôi được thành lập để đáp ứng nhu cầu ngày càng tăng về dịch vụ chăm sóc chuyên biệt trong cộng đồng."
    },
    {
      year: "2010",
      title: "Mở rộng dịch vụ",
      description: "Bổ sung dịch vụ tư vấn toàn diện, nhóm hỗ trợ và thêm các chuyên gia y tế vào đội ngũ của chúng tôi."
    },
    {
      year: "2015",
      title: "Sáng kiến nghiên cứu",
      description: "Triển khai chương trình nghiên cứu lâm sàng để tham gia vào các nghiên cứu điều trị HIV tiên tiến."
    },
    {
      year: "2018",
      title: "Chuyển đổi số",
      description: "Triển khai nền tảng sức khỏe số để cải thiện khả năng tiếp cận của bệnh nhân và quản lý chăm sóc."
    },
    {
      year: "2022",
      title: "Tiếp cận cộng đồng",
      description: "Mở rộng các chương trình giáo dục và phòng ngừa để tiếp cận nhiều cộng đồng và các nhóm dễ bị tổn thương hơn."
    }
  ];

  return (
    <Layout currentRole={currentRole} userName={userName}>
      {/* Hero section */}
      <div className="relative bg-indigo-800 text-white py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-indigo-700 opacity-90"></div>
        <div className="relative container mx-auto px-4 z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">
              <span>Về Trung Tâm Điều Trị HIV Của Chúng Tôi</span>
            </h1>
            <p className="text-xl text-indigo-100">
              <span>
                Tận tâm cung cấp dịch vụ chăm sóc và hỗ trợ toàn diện cho những người sống chung với HIV từ năm 2005.
                Đội ngũ chuyên gia của chúng tôi cam kết vì sức khỏe, hạnh phúc và chất lượng cuộc sống của bạn.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Mission and Vision */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  <span>Sứ Mệnh Của Chúng Tôi</span>
                </h2>
                <div className="bg-indigo-50 p-6 rounded-lg border-l-4 border-indigo-600">
                  <p className="text-lg text-gray-700">
                    <span>{missionVision.mission}</span>
                  </p>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  <span>Tầm Nhìn Của Chúng Tôi</span>
                </h2>
                <div className="bg-indigo-50 p-6 rounded-lg border-l-4 border-indigo-600">
                  <p className="text-lg text-gray-700">
                    <span>{missionVision.vision}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <span>Hành Trình Của Chúng Tôi</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              <span>
                Sự phát triển của trung tâm chúng tôi và cam kết liên tục về chăm sóc và điều trị HIV.
              </span>
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-indigo-200"></div>
              
              {/* Timeline events */}
              {timeline.map((event, index) => (
                <div key={index} className={`relative z-10 mb-12 flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="flex-1"></div>
                  <div className="flex items-center justify-center w-12 h-12">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 border-4 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <Card className={`max-w-sm ${index % 2 === 0 ? 'ml-6' : 'mr-6'} shadow-lg`}>
                      <div className="p-6">
                        <div className="text-xl font-semibold text-indigo-600 mb-1">
                          <span>{event.year}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          <span>{event.title}</span>
                        </h3>
                        <p className="text-gray-600">
                          <span>{event.description}</span>
                        </p>
                      </div>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <span>Đội Ngũ Của Chúng Tôi</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              <span>
                Các chuyên gia lành nghề và tận tâm của chúng tôi làm việc cùng nhau để cung cấp dịch vụ chăm sóc đặc biệt cho tất cả bệnh nhân.
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <Card key={member.id} className="h-full">
                <div className="p-6 flex flex-col h-full">
                  <div className="mb-6">
                    <img src={member.image} alt={member.name} className="w-32 h-32 object-cover rounded-full mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 text-center mb-1">
                    <span>{member.name}</span>
                  </h3>
                  <p className="text-center text-indigo-600 mb-4">
                    <span>{member.role}</span>
                  </p>
                  <p className="text-gray-600 text-center">
                    <span>{member.bio}</span>
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Chứng Nhận & Đối Tác Của Chúng Tôi</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Chúng tôi tuân thủ các tiêu chuẩn chăm sóc cao nhất và hợp tác với các tổ chức hàng đầu trong nghiên cứu và điều trị HIV.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center h-24">
                <div className="text-center">
                  <div className="font-semibold text-gray-800">Tổ chức Y tế Thế giới</div>
                  <div className="text-sm text-gray-500">Nhà cung cấp được chấp thuận</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center h-24">
                <div className="text-center">
                  <div className="font-semibold text-gray-800">UNAIDS</div>
                  <div className="text-sm text-gray-500">Đối tác chương trình</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center h-24">
                <div className="text-center">
                  <div className="font-semibold text-gray-800">Bộ Y tế</div>
                  <div className="text-sm text-gray-500">Cơ sở được chứng nhận</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center h-24">
                <div className="text-center">
                  <div className="font-semibold text-gray-800">Hiệp hội HIV/AIDS</div>
                  <div className="text-sm text-gray-500">Thành viên được công nhận</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-16 bg-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              <span>Chúng Tôi Luôn Sẵn Sàng Hỗ Trợ Bạn</span>
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              <span>
                Nếu bạn hoặc người thân cần tư vấn, điều trị hoặc hỗ trợ về HIV, hãy liên hệ với chúng tôi ngay hôm nay để đặt lịch hẹn hoặc tìm hiểu thêm về dịch vụ của chúng tôi.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button variant="white" size="lg" className="text-indigo-700">
                <span>Đặt Lịch Hẹn</span>
              </Button>
              <Link to="/contact" aria-label="Liên hệ với chúng tôi">
                <Button variant="outline" size="lg" className="border-white text-white">
                  <span>Liên Hệ Chúng Tôi</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage; 