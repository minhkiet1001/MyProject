import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { UserRole } from "../../types/index.js";
import Card from "../../components/common/Card";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Custom hook for section animations
const AnimatedSection = ({ children, className }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.section>
  );
};

const ResourcesPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isVisible, setIsVisible] = useState({});
  const [visibleItems, setVisibleItems] = useState(3); // Show initial 3 items
  const itemsPerLoad = 3; // Load 3 more items each time
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  // Dữ liệu nguồn mẫu
  const resources = [
    {
      id: 1,
      title: "Sống Khỏe Với HIV",
      description:
        "Hướng dẫn này cung cấp lời khuyên thiết thực để duy trì sức khỏe và sự khỏe mạnh khi sống với HIV.",
      category: "living-with-hiv",
      format: "article",
      url: "/customer/resources/living-well-with-hiv",
      date: new Date("2023-02-15"),
      readTime: "15 phút đọc",
      isFeatured: true,
      emoji: "💪",
      gradientColors: "from-blue-400/20 to-indigo-400/20",
    },
    {
      id: 2,
      title: "Hiểu Về Liệu Pháp Kháng Retrovirus (ART)",
      description:
        "Tìm hiểu về cách thức hoạt động của ART, các lựa chọn thuốc khác nhau và các câu hỏi thường gặp về phương pháp điều trị.",
      category: "treatment",
      format: "article",
      url: "/customer/resources/understanding-art",
      date: new Date("2023-03-10"),
      readTime: "20 phút đọc",
      isFeatured: true,
      emoji: "💊",
      gradientColors: "from-purple-400/20 to-pink-400/20",
    },
    {
      id: 3,
      title: "Hướng Dẫn Dinh Dưỡng Cho Bệnh Nhân HIV",
      description:
        "Dinh dưỡng hợp lý rất quan trọng cho chức năng miễn dịch. Hướng dẫn này đưa ra các khuyến nghị về chế độ ăn uống cho bệnh nhân HIV.",
      category: "wellness",
      format: "pdf",
      url: "/customer/resources/nutrition-guidelines",
      date: new Date("2023-01-25"),
      readTime: "10 phút đọc",
      emoji: "🥗",
      gradientColors: "from-green-400/20 to-teal-400/20",
    },
    {
      id: 4,
      title: "Quản Lý Tác Dụng Phụ Của Thuốc",
      description:
        "Mẹo và chiến lược để đối phó với các tác dụng phụ phổ biến của thuốc điều trị HIV.",
      category: "treatment",
      format: "article",
      url: "/customer/resources/managing-side-effects",
      date: new Date("2023-02-28"),
      readTime: "12 phút đọc",
      emoji: "🛡️",
      gradientColors: "from-yellow-400/20 to-orange-400/20",
    },
    {
      id: 5,
      title: "Sức Khỏe Tâm Thần và HIV",
      description:
        "Sống với HIV có thể ảnh hưởng đến sức khỏe tâm thần của bạn. Tìm hiểu về các chiến lược đối phó và khi nào cần tìm kiếm sự giúp đỡ.",
      category: "wellness",
      format: "article",
      url: "/customer/resources/mental-health",
      date: new Date("2023-03-05"),
      readTime: "18 phút đọc",
      emoji: "🧠",
      gradientColors: "from-violet-400/20 to-blue-400/20",
    },
    {
      id: 6,
      title: "Mối Quan Hệ và HIV",
      description:
        "Lời khuyên để thảo luận về tình trạng của bạn với đối tác, hẹn hò và duy trì cuộc sống xã hội lành mạnh với HIV.",
      category: "living-with-hiv",
      format: "article",
      url: "/customer/resources/hiv-and-relationships",
      date: new Date("2023-01-20"),
      readTime: "15 phút đọc",
      emoji: "❤️",
      gradientColors: "from-red-400/20 to-pink-400/20",
    },
    {
      id: 7,
      title: "Hướng Dẫn Phòng Ngừa HIV",
      description:
        "Thông tin về PrEP, PEP, U=U (Không Phát Hiện = Không Lây Truyền) và các biện pháp tình dục an toàn.",
      category: "prevention",
      format: "pdf",
      url: "/customer/resources/hiv-prevention-guide",
      date: new Date("2023-02-10"),
      readTime: "25 phút đọc",
      emoji: "🛑",
      gradientColors: "from-blue-400/20 to-cyan-400/20",
    },
    {
      id: 8,
      title: "Các Nhóm Hỗ Trợ HIV",
      description:
        "Tìm hiểu về lợi ích của các nhóm hỗ trợ và cách tìm một nhóm trong khu vực của bạn.",
      category: "support",
      format: "article",
      url: "/customer/resources/support-groups",
      date: new Date("2023-03-15"),
      readTime: "8 phút đọc",
      emoji: "👥",
      gradientColors: "from-teal-400/20 to-green-400/20",
    },
    {
      id: 9,
      title: "Tập Thể Dục và HIV",
      description:
        "Các khuyến nghị về hoạt động thể chất cho người sống với HIV, bao gồm lợi ích và các biện pháp phòng ngừa.",
      category: "wellness",
      format: "video",
      url: "/customer/resources/exercise-and-hiv",
      date: new Date("2023-02-20"),
      readTime: "Video 30 phút",
      emoji: "🏃",
      gradientColors: "from-green-400/20 to-lime-400/20",
    },
    {
      id: 10,
      title: "Du Lịch Với HIV",
      description:
        "Thông tin thiết yếu cho việc du lịch với HIV, bao gồm quản lý thuốc và các cân nhắc quốc tế.",
      category: "living-with-hiv",
      format: "article",
      url: "/customer/resources/traveling-with-hiv",
      date: new Date("2023-01-30"),
      readTime: "12 phút đọc",
      emoji: "✈️",
      gradientColors: "from-sky-400/20 to-indigo-400/20",
    },
  ];

  // Carousel images with gradient overlays
  const carouselImages = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1584982751601-97dcc096659c",
      title: "Chăm sóc sức khỏe hiện đại",
      description: "Tiếp cận phương pháp điều trị tiên tiến",
      gradient: "from-blue-900/70 to-purple-900/50",
      ctaText: "Tìm hiểu thêm",
      ctaLink: "/customer/resources/modern-care",
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118",
      title: "Hỗ trợ cộng đồng",
      description: "Cùng nhau xây dựng cộng đồng mạnh mẽ",
      gradient: "from-emerald-900/70 to-teal-900/50",
      ctaText: "Tham gia ngay",
      ctaLink: "/customer/resources/community",
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef",
      title: "Giáo dục sức khỏe",
      description: "Kiến thức là sức mạnh trong điều trị",
      gradient: "from-violet-900/70 to-indigo-900/50",
      ctaText: "Khám phá",
      ctaLink: "/customer/resources/education",
    },
  ];

  // YouTube videos with emojis and gradients
  const youtubeVideos = [
    {
      id: 1,
      title: "Hiểu về HIV/AIDS",
      embedId: "hG6yjtKdJgM",
      description: "Tổng quan về HIV/AIDS và cách phòng ngừa",
      emoji: "🧬",
      gradient: "from-blue-500/10 to-indigo-500/10",
    },
    {
      id: 2,
      title: "Sống khỏe mỗi ngày",
      embedId: "oSPdW1dClSc",
      description: "Chia sẻ kinh nghiệm sống tích cực",
      emoji: "🌱",
      gradient: "from-green-500/10 to-emerald-500/10",
    },
    {
      id: 3,
      title: "Điều trị ARV hiện đại",
      embedId: "HJxdUx1D2iU",
      description: "Thông tin về phương pháp điều trị mới",
      emoji: "💊",
      gradient: "from-purple-500/10 to-pink-500/10",
    },
  ];

  // Blog posts with categories and emojis
  const blogPosts = [
    {
      id: 1,
      title: "Tiến bộ mới trong điều trị HIV 2024",
      image:
        "https://tc.cdnchinhphu.vn/346625049939054592/2024/7/26/261-17219874180481150548081.jpg",
      date: "15/03/2024",
      excerpt: "Khám phá những phương pháp điều trị mới nhất...",
      category: "Nghiên cứu",
      emoji: "🔬",
      gradient: "from-blue-600 to-violet-600",
    },
    {
      id: 2,
      title: "Dinh dưỡng cho người điều trị HIV",
      image:
        "https://hellodoctors.vn/img/uploads/che-do-dinh-duong-cho-nguoi-bi-hiv-ma-nguoi-nha-nen-biet_6844.jpeg",
      date: "10/03/2024",
      excerpt: "Chế độ ăn uống khoa học và cân bằng...",
      category: "Dinh dưỡng",
      emoji: "🥗",
      gradient: "from-green-600 to-emerald-600",
    },
    {
      id: 3,
      title: "Hoạt động cộng đồng tháng 6/2025",
      image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca",
      date: "05/03/2024",
      excerpt: "Các hoạt động hỗ trợ và giao lưu cộng đồng...",
      category: "Cộng đồng",
      emoji: "👥",
      gradient: "from-purple-600 to-pink-600",
    },
  ];

  // Lọc nguồn dựa trên danh mục đang hoạt động và từ khóa tìm kiếm
  const filteredResources = resources.filter((resource) => {
    const matchesCategory =
      activeCategory === "all" || resource.category === activeCategory;
    const matchesSearch =
      searchTerm === "" ||
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Nhóm nguồn nổi bật
  const featuredResources = resources.filter((resource) => resource.isFeatured);

  // Định dạng ngày để hiển thị
  const formatDate = (date) => {
    return date.toLocaleDateString("vi-VN", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Lấy biểu tượng cho định dạng nguồn
  const getFormatIcon = (format) => {
    switch (format) {
      case "article":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-indigo-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "video":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-red-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        );
      case "pdf":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4h.01zm5.707 9.293a1 1 0 001.414 1.414l4-4a1 1 0 00-1.414-1.414L11 10.586V3a1 1 0 10-2 0v7.586l-1.293-1.293a1 1 0 00-1.414 1.414l4 4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "infographic":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4h.01zm5.707 9.293a1 1 0 001.414 1.414l4-4a1 1 0 00-1.414-1.414L11 10.586V3a1 1 0 10-2 0v7.586l-1.293-1.293a1 1 0 00-1.414 1.414l4 4z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  // Định dạng tên danh mục để hiển thị
  const formatCategoryName = (category) => {
    switch (category) {
      case "living-with-hiv":
        return "Sống với HIV";
      case "treatment":
        return "Điều trị";
      case "prevention":
        return "Phòng ngừa";
      case "support":
        return "Hỗ trợ";
      case "wellness":
        return "Sức khỏe & Thể chất";
      default:
        return category;
    }
  };

  // Handle loading more items
  const handleLoadMore = () => {
    setIsButtonPressed(true);
    setTimeout(() => {
      setIsButtonPressed(false);
      setVisibleItems((prev) =>
        Math.min(prev + itemsPerLoad, resources.length)
      );
    }, 300);
  };

  return (
    <Layout currentRole={UserRole.CUSTOMER} userName="Nguyễn Văn An">
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white transition-colors duration-300">
        {/* Hero Section with Enhanced Carousel */}
        <div className="relative h-[500px] overflow-hidden rounded-b-3xl shadow-xl">
          <Swiper
            modules={[Autoplay, Pagination, Navigation, EffectFade]}
            effect="fade"
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{ delay: 5000 }}
            pagination={{
              clickable: true,
              bulletClass:
                "swiper-pagination-bullet !w-3 !h-3 !mx-2 !bg-white/70 !opacity-70",
              bulletActiveClass: "!bg-white !opacity-100 !scale-110",
            }}
            navigation={{
              prevEl: ".swiper-button-prev",
              nextEl: ".swiper-button-next",
            }}
            className="h-full w-full"
          >
            {carouselImages.map((image) => (
              <SwiperSlide key={image.id}>
                <div className="relative h-full group">
                  <div className="absolute inset-0 transition-transform duration-7000 ease-in-out group-hover:scale-105">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover transition-transform"
                    />
                  </div>
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${image.gradient}`}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4 max-w-3xl">
                      <h2 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg font-sans tracking-tighter text-white">
                        {image.title}
                      </h2>
                      <p className="text-xl md:text-2xl text-white/90 font-light drop-shadow-md mb-8">
                        {image.description}
                      </p>
                      <Link
                        to={image.ctaLink}
                        className="inline-flex items-center px-6 py-3 text-base font-medium rounded-full text-white bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg hover:shadow-xl"
                      >
                        {image.ctaText}
                        <svg
                          className="ml-2 -mr-1 w-5 h-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
            <div className="swiper-button-prev !text-white/90 !bg-black/20 !w-12 !h-12 !rounded-full !backdrop-blur-md after:!text-lg"></div>
            <div className="swiper-button-next !text-white/90 !bg-black/20 !w-12 !h-12 !rounded-full !backdrop-blur-md after:!text-lg"></div>
          </Swiper>
        </div>

        <div className="container mx-auto px-4 py-16">
          {/* YouTube Videos Section with Emojis and Gradients */}
          <AnimatedSection className="mb-24">
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 font-sans tracking-tight flex items-center"
            >
              <span className="mr-3 text-4xl">🎬</span>
              Video Hướng Dẫn
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {youtubeVideos.map((video) => (
                <motion.div
                  key={video.id}
                  variants={fadeInUp}
                  whileHover={{
                    scale: 1.03,
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                  }}
                  className={`bg-gradient-to-br ${video.gradient} rounded-2xl overflow-hidden border border-gray-100/50 shadow-lg transition-all duration-300`}
                >
                  <div className="p-5 text-center">
                    <span className="text-4xl mb-2 inline-block">
                      {video.emoji}
                    </span>
                  </div>
                  <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden mx-4">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.embedId}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-xl"
                    ></iframe>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800 font-sans">
                      {video.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-sans">
                      {video.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>

          {/* Blog Posts Section with Enhanced Cards */}
          <AnimatedSection className="mb-24">
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 font-sans tracking-tight flex items-center"
            >
              <span className="mr-3 text-4xl">📰</span>
              Bài Viết Mới Nhất
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {blogPosts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={fadeInUp}
                  whileHover={{
                    scale: 1.03,
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                  }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100/50 transition-all duration-300"
                >
                  <div className="relative overflow-hidden h-56">
                    <div className="absolute inset-0 transition-transform duration-700 ease-in-out group-hover:scale-110">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${post.gradient}`}
                      >
                        <span className="mr-1">{post.emoji}</span>
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-blue-600 font-medium mb-2 font-sans tracking-wider">
                      {post.date}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-800 font-sans">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed font-sans">
                      {post.excerpt}
                    </p>
                    <button className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center group transition-colors duration-200 font-sans">
                      Đọc thêm
                      <svg
                        className="ml-2 w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300"
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
          </AnimatedSection>

          {/* Resources Grid with Modern Cards */}
          <AnimatedSection className="mb-24">
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 font-sans tracking-tight flex items-center"
            >
              <span className="mr-3 text-4xl">📚</span>
              Tài Nguyên Học Tập
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <AnimatePresence>
                {resources.slice(0, visibleItems).map((resource) => (
                  <motion.div
                    key={resource.id}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileHover={{
                      scale: 1.03,
                      y: -8,
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                    }}
                    className={`bg-gradient-to-br ${resource.gradientColors} rounded-2xl shadow-lg overflow-hidden border border-gray-100/50 transition-all duration-300`}
                  >
                    <div className="text-center pt-6">
                      <span className="text-4xl inline-block mb-2">
                        {resource.emoji}
                      </span>
                    </div>
                    <Link to={resource.url} className="block p-6">
                      <div className="flex items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600 mb-3 font-sans transition-colors duration-300">
                            {resource.title}
                          </h3>
                          <p className="text-gray-600 mb-6 leading-relaxed font-sans">
                            {resource.description}
                          </p>
                          <div className="flex items-center text-sm">
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-full mr-3 font-medium font-sans shadow-sm">
                              {formatCategoryName(resource.category)}
                            </span>
                            <span className="text-gray-500 font-sans flex items-center">
                              <svg
                                className="w-4 h-4 mr-1 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {resource.readTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Load More Button with Modern Design */}
            {visibleItems < resources.length && (
              <motion.div
                className="text-center mt-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={handleLoadMore}
                  className={`inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl transform ${
                    isButtonPressed ? "scale-95" : "hover:scale-105"
                  }`}
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
                <p className="mt-4 text-sm text-gray-500 font-sans">
                  Hiển thị {visibleItems} trên tổng số {resources.length} tài
                  nguyên
                </p>
              </motion.div>
            )}
          </AnimatedSection>
        </div>
      </div>
    </Layout>
  );
};

export default ResourcesPage;
