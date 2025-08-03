import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { UserRole } from '../../types/index.js';
import Card from '../../components/common/Card';
import { Link, useLocation } from 'react-router-dom';
import Button from '../../components/common/Button';

const BlogPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const role = searchParams.get('role');
  const isCustomer = role === 'customer';
  const currentRole = isCustomer ? UserRole.CUSTOMER : UserRole.GUEST;
  const userName = isCustomer ? 'Nguyễn Văn An' : undefined;
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for blog categories
  const categories = [
    { id: 'all', name: 'Tất cả bài viết' },
    { id: 'treatment', name: 'Cập nhật điều trị' },
    { id: 'living', name: 'Sống chung với HIV' },
    { id: 'prevention', name: 'Phòng ngừa' },
    { id: 'research', name: 'Tin tức nghiên cứu' },
    { id: 'stories', name: 'Câu chuyện bệnh nhân' }
  ];

  // Mock data for featured blog posts
  const featuredPosts = [
    {
      id: 1,
      title: 'Tiến bộ trong điều trị HIV: Những điều mới trong năm 2023',
      excerpt: 'Tình hình điều trị HIV tiếp tục phát triển. Tìm hiểu về các loại thuốc, phương pháp điều trị mới nhất và ý nghĩa của chúng đối với người sống chung với HIV.',
      author: 'BS. Nguyễn Thị Minh',
      date: '15/06/2023',
      readTime: '8 phút đọc',
      category: 'treatment',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      featured: true
    },
    {
      id: 2,
      title: 'Hiểu về U=U: Không phát hiện bằng Không lây truyền',
      excerpt: 'U=U nghĩa là gì và tại sao nó quan trọng đối với cả những người sống chung với HIV và bạn đời của họ? Chúng tôi giải thích về khoa học và ý nghĩa.',
      author: 'BS. Trần Văn Hải',
      date: '28/05/2023',
      readTime: '6 phút đọc',
      category: 'prevention',
      image: 'https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      featured: true
    }
  ];

  // Mock data for all blog posts
  const allPosts = [
    ...featuredPosts,
    {
      id: 3,
      title: 'Hướng dẫn dinh dưỡng cho người sống chung với HIV',
      excerpt: 'Dinh dưỡng hợp lý đóng vai trò quan trọng trong việc kiểm soát HIV. Hướng dẫn toàn diện này bao gồm các khuyến nghị về chế độ ăn uống, thực phẩm bổ sung và chiến lược lập kế hoạch bữa ăn.',
      author: 'Lê Thị Hồng, Chuyên viên dinh dưỡng',
      date: '12/04/2023',
      readTime: '10 phút đọc',
      category: 'living',
      image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
    },
    {
      id: 4,
      title: 'PrEP và PEP: Sự khác biệt là gì?',
      excerpt: 'Dự phòng trước phơi nhiễm (PrEP) và dự phòng sau phơi nhiễm (PEP) là hai công cụ phòng ngừa quan trọng. Tìm hiểu cách chúng hoạt động, ai nên cân nhắc sử dụng và làm thế nào để tiếp cận.',
      author: 'BS. Phạm Văn Đức',
      date: '30/03/2023',
      readTime: '7 phút đọc',
      category: 'prevention',
      image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
    },
    {
      id: 5,
      title: 'Hành trình của tôi: Sống và phát triển với HIV trong 15 năm',
      excerpt: 'Trong câu chuyện cá nhân này, Minh chia sẻ trải nghiệm từ ngày được chẩn đoán đến hiện tại, nêu bật những thách thức, thành công và bài học kinh nghiệm trên chặng đường.',
      author: 'Nguyễn Văn Minh',
      date: '15/03/2023',
      readTime: '12 phút đọc',
      category: 'stories',
      image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
    },
    {
      id: 6,
      title: 'Phá vỡ kỳ thị: Các cuộc trò chuyện về HIV',
      excerpt: 'Kỳ thị vẫn là một trong những thách thức lớn nhất đối với người sống chung với HIV. Bài viết này thảo luận về các chiến lược giáo dục, vận động và thay đổi quan điểm.',
      author: 'Hoàng Thị Mai, Nhân viên xã hội',
      date: '28/02/2023',
      readTime: '9 phút đọc',
      category: 'living',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
    },
    {
      id: 7,
      title: 'Những phát triển đầy hứa hẹn trong nghiên cứu vắc-xin HIV',
      excerpt: 'Những đột phá gần đây trong nghiên cứu vắc-xin HIV đang mang lại hy vọng mới. Đây là những gì bạn cần biết về các thử nghiệm hiện tại và khả năng trong tương lai.',
      author: 'TS. Trần Minh Tâm',
      date: '15/02/2023',
      readTime: '11 phút đọc',
      category: 'research',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
    },
    {
      id: 8,
      title: 'HIV và Sức khỏe tâm thần: Quản lý tác động tâm lý',
      excerpt: 'Sống chung với HIV có thể có những ảnh hưởng tâm lý đáng kể. Bài viết này khám phá những thách thức sức khỏe tâm thần phổ biến và các chiến lược đối phó hiệu quả.',
      author: 'BS. Lê Thị Hương',
      date: '24/01/2023',
      readTime: '8 phút đọc',
      category: 'living',
      image: 'https://images.unsplash.com/photo-1541199249251-f713e6145474?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
    },
    {
      id: 9,
      title: 'Phản ứng toàn cầu đối với HIV: Tiến bộ và thách thức',
      excerpt: 'Các quốc gia và tổ chức quốc tế đang đối phó với dịch HIV như thế nào? Tổng quan này xem xét các chiến lược thành công và những trở ngại hiện tại.',
      author: 'TS. Vũ Ngọc Anh',
      date: '10/01/2023',
      readTime: '10 phút đọc',
      category: 'research',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
    }
  ];

  // Filter posts based on active category and search term
  const filteredPosts = allPosts.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Non-featured posts
  const regularPosts = filteredPosts.filter(post => !post.featured || activeCategory !== 'all' || searchTerm);

  return (
    <Layout currentRole={currentRole} userName={userName}>
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Blog Điều Trị HIV</h1>
            <p className="text-xl text-blue-100">
              <span>Cập nhật tin tức mới nhất, nghiên cứu, câu chuyện cá nhân và lời khuyên về điều trị HIV và sống khỏe mạnh.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filter and search section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap mb-4 md:mb-0">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`mr-2 mb-2 px-4 py-2 rounded-full text-sm font-medium ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  aria-pressed={activeCategory === category.id}
                >
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Tìm kiếm bài viết"
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setSearchTerm('')}
                  aria-label="Xóa tìm kiếm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured posts section - only show when no filters are applied */}
      {activeCategory === 'all' && !searchTerm && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              <span>Bài Viết Nổi Bật</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredPosts.map(post => (
                <Card key={post.id} className="h-full shadow-lg hover:shadow-xl transition-shadow">
                  <div className="relative h-64 overflow-hidden rounded-t-lg">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-0 right-0 m-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      <span>Nổi bật</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      <span>{post.title}</span>
                    </h3>
                    <p className="text-gray-700 mb-4"><span>{post.excerpt}</span></p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{post.author}</span>
                        <span className="mx-1">•</span>
                        <span>{post.date}</span>
                        <span className="mx-1">•</span>
                        <span>{post.readTime}</span>
                      </div>
                      <Link to={`/blog/${post.id}`} aria-label={`Đọc thêm về ${post.title}`}>
                        <Button variant="outline" size="sm">
                          <span>Đọc thêm</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regular posts section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {activeCategory === 'all' 
              ? 'Tất Cả Bài Viết' 
              : `Bài Viết về ${categories.find(c => c.id === activeCategory)?.name}`}
          </h2>

          {regularPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map(post => (
                <Card key={post.id} className="h-full shadow hover:shadow-md transition-shadow">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="mb-2">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {categories.find(c => c.id === post.category)?.name}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xs text-gray-600">
                        <span>{post.date}</span>
                        <span className="mx-1">•</span>
                        <span>{post.readTime}</span>
                      </div>
                      <Link to={`/blog/${post.id}`}>
                        <Button variant="text" size="sm" className="text-blue-600 hover:text-blue-800">
                          Đọc thêm →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 text-center rounded-lg shadow">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy bài viết nào</h3>
              <p className="text-gray-600 mb-4">Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.</p>
              <Button variant="primary" onClick={() => {setActiveCategory('all'); setSearchTerm('');}}>
                Xem tất cả bài viết
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Đăng ký nhận tin</h2>
            <p className="text-xl text-blue-100 mb-8">
              Nhận thông tin cập nhật mới nhất về điều trị HIV, nghiên cứu và các nguồn tài nguyên trực tiếp vào hộp thư của bạn.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center">
              <input
                type="email"
                placeholder="Địa chỉ email của bạn"
                className="w-full sm:w-64 px-4 py-3 rounded-l-lg mb-2 sm:mb-0 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                variant="white"
                className="sm:rounded-l-none py-3 text-blue-600 font-medium"
              >
                Đăng ký
              </Button>
            </div>
            <p className="mt-4 text-sm text-blue-200">
              Chúng tôi tôn trọng quyền riêng tư của bạn. Xem chính sách bảo mật của chúng tôi.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPage;