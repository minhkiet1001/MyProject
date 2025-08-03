import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { UserRole } from '../../types/index.js';
import Card from '../../components/common/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

const ResourcesPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState({});
  const [visibleItems, setVisibleItems] = useState(3); // Show initial 3 items
  const itemsPerLoad = 3; // Load 3 more items each time

  // Dữ liệu nguồn mẫu
  const resources = [
    {
      id: 1,
      title: 'Sống Khỏe Với HIV',
      description: 'Hướng dẫn này cung cấp lời khuyên thiết thực để duy trì sức khỏe và sự khỏe mạnh khi sống với HIV.',
      category: 'living-with-hiv',
      format: 'article',
      url: '/guest/resources/living-well-with-hiv',
      date: new Date('2023-02-15'),
      readTime: '15 phút đọc',
      isFeatured: true
    },
    {
      id: 2,
      title: 'Hiểu Về Liệu Pháp Kháng Retrovirus (ART)',
      description: 'Tìm hiểu về cách thức hoạt động của ART, các lựa chọn thuốc khác nhau và các câu hỏi thường gặp về phương pháp điều trị.',
      category: 'treatment',
      format: 'article',
      url: '/guest/resources/understanding-art',
      date: new Date('2023-03-10'),
      readTime: '20 phút đọc',
      isFeatured: true
    },
    {
      id: 3,
      title: 'Hướng Dẫn Dinh Dưỡng Cho Bệnh Nhân HIV',
      description: 'Dinh dưỡng hợp lý rất quan trọng cho chức năng miễn dịch. Hướng dẫn này đưa ra các khuyến nghị về chế độ ăn uống cho bệnh nhân HIV.',
      category: 'wellness',
      format: 'pdf',
      url: '/guest/resources/nutrition-guidelines',
      date: new Date('2023-01-25'),
      readTime: '10 phút đọc'
    },
    {
      id: 4,
      title: 'Quản Lý Tác Dụng Phụ Của Thuốc',
      description: 'Mẹo và chiến lược để đối phó với các tác dụng phụ phổ biến của thuốc điều trị HIV.',
      category: 'treatment',
      format: 'article',
      url: '/guest/resources/managing-side-effects',
      date: new Date('2023-02-28'),
      readTime: '12 phút đọc'
    },
    {
      id: 5,
      title: 'Sức Khỏe Tâm Thần và HIV',
      description: 'Sống với HIV có thể ảnh hưởng đến sức khỏe tâm thần của bạn. Tìm hiểu về các chiến lược đối phó và khi nào cần tìm kiếm sự giúp đỡ.',
      category: 'wellness',
      format: 'article',
      url: '/guest/resources/mental-health',
      date: new Date('2023-03-05'),
      readTime: '18 phút đọc'
    },
    {
      id: 6,
      title: 'Mối Quan Hệ và HIV',
      description: 'Lời khuyên để thảo luận về tình trạng của bạn với đối tác, hẹn hò và duy trì cuộc sống xã hội lành mạnh với HIV.',
      category: 'living-with-hiv',
      format: 'article',
      url: '/guest/resources/hiv-and-relationships',
      date: new Date('2023-01-20'),
      readTime: '15 phút đọc'
    },
    {
      id: 7,
      title: 'Hướng Dẫn Phòng Ngừa HIV',
      description: 'Thông tin về PrEP, PEP, U=U (Không Phát Hiện = Không Lây Truyền) và các biện pháp tình dục an toàn.',
      category: 'prevention',
      format: 'pdf',
      url: '/guest/resources/hiv-prevention-guide',
      date: new Date('2023-02-10'),
      readTime: '25 phút đọc'
    },
    {
      id: 8,
      title: 'Các Nhóm Hỗ Trợ HIV',
      description: 'Tìm hiểu về lợi ích của các nhóm hỗ trợ và cách tìm một nhóm trong khu vực của bạn.',
      category: 'support',
      format: 'article',
      url: '/guest/resources/support-groups',
      date: new Date('2023-03-15'),
      readTime: '8 phút đọc'
    },
    {
      id: 9,
      title: 'Tập Thể Dục và HIV',
      description: 'Các khuyến nghị về hoạt động thể chất cho người sống với HIV, bao gồm lợi ích và các biện pháp phòng ngừa.',
      category: 'wellness',
      format: 'video',
      url: '/guest/resources/exercise-and-hiv',
      date: new Date('2023-02-20'),
      readTime: 'Video 30 phút'
    },
    {
      id: 10,
      title: 'Du Lịch Với HIV',
      description: 'Thông tin thiết yếu cho việc du lịch với HIV, bao gồm quản lý thuốc và các cân nhắc quốc tế.',
      category: 'living-with-hiv',
      format: 'article',
      url: '/guest/resources/traveling-with-hiv',
      date: new Date('2023-01-30'),
      readTime: '12 phút đọc'
    }
  ];

  // Carousel images
  const carouselImages = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c',
      title: 'Chăm sóc sức khỏe hiện đại',
      description: 'Tiếp cận phương pháp điều trị tiên tiến'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118',
      title: 'Hỗ trợ cộng đồng',
      description: 'Cùng nhau xây dựng cộng đồng mạnh mẽ'
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
      title: 'Giáo dục sức khỏe',
      description: 'Kiến thức là sức mạnh trong điều trị'
    }
  ];

  // YouTube videos
  const youtubeVideos = [
    {
      id: 1,
      title: 'Hiểu về HIV/AIDS',
      embedId: 'DGyVt_MU4_g',
      description: 'Tổng quan về HIV/AIDS và cách phòng ngừa'
    },
    {
      id: 2,
      title: 'Sống khỏe mỗi ngày',
      embedId: 'WI5IfL6c0Pw',
      description: 'Chia sẻ kinh nghiệm sống tích cực'
    },
    {
      id: 3,
      title: 'Điều trị ARV hiện đại',
      embedId: 'S5mKyBNGv3A',
      description: 'Thông tin về phương pháp điều trị mới'
    }
  ];

  // Blog posts
  const blogPosts = [
    {
      id: 1,
      title: 'Tiến bộ mới trong điều trị HIV 2024',
      image: 'https://images.unsplash.com/photo-1581093458791-9d58e9c167af',
      date: '15/03/2024',
      excerpt: 'Khám phá những phương pháp điều trị mới nhất...'
    },
    {
      id: 2,
      title: 'Dinh dưỡng cho người điều trị HIV',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
      date: '10/03/2024',
      excerpt: 'Chế độ ăn uống khoa học và cân bằng...'
    },
    {
      id: 3,
      title: 'Hoạt động cộng đồng tháng 3/2024',
      image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca',
      date: '05/03/2024',
      excerpt: 'Các hoạt động hỗ trợ và giao lưu cộng đồng...'
    }
  ];

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top <= window.innerHeight - 100;
        setIsVisible(prev => ({ ...prev, [element.id]: isVisible }));
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lọc nguồn dựa trên danh mục đang hoạt động và từ khóa tìm kiếm
  const filteredResources = resources.filter(resource => {
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    const matchesSearch = searchTerm === '' ||
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Nhóm nguồn nổi bật
  const featuredResources = resources.filter(resource => resource.isFeatured);

  // Định dạng ngày để hiển thị
  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Lấy biểu tượng cho định dạng nguồn
  const getFormatIcon = (format) => {
    switch (format) {
      case 'article':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'video':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        );
      case 'pdf':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4h.01zm5.707 9.293a1 1 0 001.414 1.414l4-4a1 1 0 00-1.414-1.414L11 10.586V3a1 1 0 10-2 0v7.586l-1.293-1.293a1 1 0 00-1.414 1.414l4 4z" clipRule="evenodd" />
          </svg>
        );
      case 'infographic':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4h.01zm5.707 9.293a1 1 0 001.414 1.414l4-4a1 1 0 00-1.414-1.414L11 10.586V3a1 1 0 10-2 0v7.586l-1.293-1.293a1 1 0 00-1.414 1.414l4 4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Định dạng tên danh mục để hiển thị
  const formatCategoryName = (category) => {
    switch (category) {
      case 'living-with-hiv':
        return 'Sống với HIV';
      case 'treatment':
        return 'Điều trị';
      case 'prevention':
        return 'Phòng ngừa';
      case 'support':
        return 'Hỗ trợ';
      case 'wellness':
        return 'Sức khỏe & Thể chất';
      default:
        return category;
    }
  };

  // Handle loading more items
  const handleLoadMore = () => {
    setVisibleItems(prev => Math.min(prev + itemsPerLoad, resources.length));
  };

  return (
    <Layout currentRole={UserRole.GUEST}>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section with Carousel */}
        <div className="relative h-[500px] overflow-hidden">
          <Swiper
            modules={[Autoplay, Pagination, Navigation, EffectFade]}
            effect="fade"
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{ delay: 5000 }}
            pagination={{ clickable: true }}
            navigation
            className="h-full w-full"
          >
            {carouselImages.map((image) => (
              <SwiperSlide key={image.id}>
                <div className="relative h-full">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="relative bg-cover bg-center text-white py-20"
                    style= {{backgroundImage: "url('/images/hero-bg.jpg')"}}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 flex items-center justify-center">
                      <div className="text-center px-4">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg font-sans">
                          {image.title}
                        </h2>
                        <p className="text-xl md:text-2xl text-white/90 font-light drop-shadow-md">
                          {image.description}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* YouTube Videos Section */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 font-sans tracking-tight">
              Video Hướng Dẫn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {youtubeVideos.map((video) => (
                <motion.div
                  key={video.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.embedId}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 font-sans">
                      {video.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-sans">
                      {video.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Blog Posts Section */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 font-sans tracking-tight">
              Bài Viết Mới Nhất
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <motion.div
                  key={post.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="text-sm text-blue-600 font-medium mb-2 font-sans">
                      {post.date}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 font-sans">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed font-sans">
                      {post.excerpt}
                    </p>
                    <button className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center group transition-colors duration-200 font-sans">
                      Đọc thêm
                      <svg
                        className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Resources Grid */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 font-sans tracking-tight">
              Tài Nguyên Học Tập
            </h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
            >
              <AnimatePresence>
                {resources.slice(0, visibleItems).map((resource) => (
                  <motion.div
                    key={resource.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                  >
                    <Link to={resource.url} className="block p-6">
                      <div className="flex items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600 mb-3 font-sans transition-colors duration-200">
                            {resource.title}
                          </h3>
                          <p className="text-gray-600 mb-4 leading-relaxed font-sans">
                            {resource.description}
                          </p>
                          <div className="flex items-center text-sm">
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full mr-3 font-medium font-sans">
                              {formatCategoryName(resource.category)}
                            </span>
                            <span className="text-gray-500 font-sans">
                              {resource.readTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load More Button */}
            {visibleItems < resources.length && (
              <motion.div
                className="text-center mt-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg font-sans"
                >
                  Xem thêm tài nguyên
                  <svg
                    className="ml-2 -mr-1 w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <p className="mt-3 text-sm text-gray-500 font-sans">
                  Hiển thị {visibleItems} trên tổng số {resources.length} tài nguyên
                </p>
              </motion.div>
            )}
          </motion.section>

          {/* CTA Section for Guests */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-sans">
              Cần Thêm Thông Tin?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8 font-sans">
              Đội ngũ chuyên gia của chúng tôi sẵn sàng trả lời mọi câu hỏi 
              và cung cấp hỗ trợ cá nhân hóa.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/contact">
                <button className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg font-sans">
                  Liên Hệ Chúng Tôi
                </button>
              </Link>
              <Link to="/login">
                <button className="inline-flex items-center px-8 py-3 border-2 border-white text-base font-medium rounded-full text-white hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-sans">
                  Đăng Nhập
                </button>
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </Layout>
  );
};

export default ResourcesPage; 