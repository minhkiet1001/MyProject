import React, { useState } from "react";
import Layout from "../components/layout/Layout";
import { UserRole } from "../types/index.js";
import Card from "../components/common/Card";

const ResourcesPage = ({ currentRole = UserRole.GUEST }) => {
  // Danh sách video YouTube về điều trị HIV
  const educationalVideos = [
    {
      id: 1,
      title: "Hiểu về HIV/AIDS và cách điều trị",
      thumbnail: "https://img.youtube.com/vi/VIDEO_ID_1/maxresdefault.jpg",
      youtubeUrl: "https://www.youtube.com/embed/VIDEO_ID_1",
      description: "Tổng quan về HIV/AIDS và các phương pháp điều trị hiện đại",
    },
    {
      id: 2,
      title: "Sống khỏe với HIV",
      thumbnail: "https://img.youtube.com/vi/VIDEO_ID_2/maxresdefault.jpg",
      youtubeUrl: "https://www.youtube.com/embed/VIDEO_ID_2",
      description: "Chia sẻ kinh nghiệm và lời khuyên cho người nhiễm HIV",
    },
    {
      id: 3,
      title: "Dinh dưỡng cho người nhiễm HIV",
      thumbnail: "https://img.youtube.com/vi/VIDEO_ID_3/maxresdefault.jpg",
      youtubeUrl: "https://www.youtube.com/embed/VIDEO_ID_3",
      description: "Hướng dẫn chế độ dinh dưỡng phù hợp",
    },
  ];

  // Danh sách bài báo và tin tức về điều trị HIV
  const newsArticles = [
    {
      id: 1,
      title: "Tiến bộ mới trong điều trị HIV năm 2024",
      image: "/images/news/hiv-treatment-2024.jpg",
      source: "Bộ Y tế",
      url: "https://moh.gov.vn/article-1",
      summary: "Những phát triển mới nhất trong phương pháp điều trị HIV",
    },
    {
      id: 2,
      title: "Hướng dẫn mới về điều trị ARV",
      image: "/images/news/arv-guidelines.jpg",
      source: "WHO Việt Nam",
      url: "https://who.int/vietnam/article-2",
      summary: "Cập nhật hướng dẫn điều trị ARV mới nhất",
    },
    {
      id: 3,
      title: "Chương trình hỗ trợ người nhiễm HIV",
      image: "/images/news/support-program.jpg",
      source: "Cục phòng chống HIV/AIDS",
      url: "https://vaac.gov.vn/article-3",
      summary: "Thông tin về các chương trình hỗ trợ mới",
    },
  ];

  // Danh sách liên kết hữu ích
  const usefulLinks = [
    {
      title: "Tổ Chức Y Tế Thế Giới",
      url: "https://www.who.int/health-topics/hiv-aids",
      description: "Thông tin và hướng dẫn toàn cầu về HIV/AIDS từ WHO",
    },
    {
      title: "Trung Tâm Kiểm Soát và Phòng Ngừa Dịch Bệnh",
      url: "https://www.cdc.gov/hiv/",
      description:
        "Tài nguyên, thống kê và hướng dẫn phòng ngừa HIV toàn diện từ CDC",
    },
    {
      title: "UNAIDS",
      url: "https://www.unaids.org/",
      description: "Thông tin về nỗ lực toàn cầu nhằm chấm dứt AIDS",
    },
  ];

  return (
    <Layout currentRole={currentRole}>
      <div className="container mx-auto px-4 py-8">
        {/* Phần tiêu đề */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Tài liệu giáo dục
          </h1>
          <p className="text-lg text-gray-600">
            Tìm hiểu thêm về HIV/AIDS và cách điều trị qua các video và bài báo
            được tuyển chọn
          </p>
        </div>

        {/* Phần Video */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Video hướng dẫn
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {educationalVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={video.youtubeUrl}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-600">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phần Tin tức */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Tin tức & Bài viết
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsArticles.map((article) => (
              <Card key={article.id} className="h-full">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="p-6">
                  <div className="text-sm text-gray-500 mb-2">
                    {article.source}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{article.summary}</p>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Đọc thêm →
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Phần Liên kết hữu ích */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Liên kết hữu ích
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {usefulLinks.map((link, index) => (
              <Card key={index} className="h-full">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {link.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{link.description}</p>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Truy cập trang web
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResourcesPage;
