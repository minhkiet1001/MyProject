# Hệ Thống Điều Trị HIV

Đây là một ứng dụng web toàn diện để quản lý điều trị HIV, được xây dựng bằng React.js, Vite và Tailwind CSS.

## Tổng Quan

Hệ thống Điều trị HIV được thiết kế để hỗ trợ quản lý quy trình điều trị HIV với nhiều vai trò người dùng khác nhau bao gồm Khách, Bệnh nhân, Nhân viên, Bác sĩ, Quản lý và Quản trị viên. Hệ thống cung cấp đầy đủ tính năng để quản lý lịch hẹn, kết quả xét nghiệm, thuốc, kế hoạch điều trị và tài liệu giáo dục.

## Tính Năng

### Dành cho Khách
- Xem thông tin về dịch vụ
- Tiếp cận tài liệu giáo dục về HIV
- Xem hồ sơ bác sĩ
- Xem lịch trình công khai
- Truy cập blog với thông tin sức khỏe

### Dành cho Bệnh nhân
- Bảng điều khiển với thông tin cá nhân hóa
- Lên lịch và quản lý các cuộc hẹn
- Xem kết quả xét nghiệm
- Theo dõi thuốc và nhắc nhở
- Tiếp cận tài liệu giáo dục
- Tư vấn trực tuyến với bác sĩ
- Quản lý hồ sơ người dùng

### Dành cho Bác sĩ
- Quản lý bệnh nhân
- Lên lịch và theo dõi cuộc hẹn
- Xem xét kết quả xét nghiệm
- Tạo và quản lý kế hoạch điều trị
- Quản lý lịch
- Tư vấn trực tuyến
- Thiết lập hồ sơ

### Dành cho Nhân viên
- Đăng ký và quản lý bệnh nhân
- Lên lịch hẹn
- Nhập và quản lý kết quả xét nghiệm
- Xử lý yêu cầu xét nghiệm

### Dành cho Quản lý
- Quản lý nhân viên
- Quản lý bác sĩ
- Quản lý nội dung
- Phân tích và báo cáo
- Lên lịch cho bác sĩ

### Dành cho Quản trị viên
- Quản lý người dùng
- Cấu hình hệ thống
- Quản lý dữ liệu
- Thống kê và báo cáo

## Công Nghệ Sử Dụng

- **React.js**: Thư viện JavaScript để xây dựng giao diện người dùng
- **Vite**: Công cụ phát triển frontend thế hệ mới
- **Tailwind CSS**: Framework CSS theo phương pháp utility-first
- **React Router**: Điều hướng và định tuyến
- **Headless UI**: Các component UI hoàn toàn không có style mặc định, dễ tiếp cận
- **Hero Icons**: Biểu tượng SVG đẹp được làm thủ công
- **React Hook Form**: Xác thực và quản lý biểu mẫu
- **Axios**: HTTP client cho các yêu cầu API
- **Chart.js & React-Chartjs-2**: Hiển thị dữ liệu dạng biểu đồ
- **Agora SDK**: Khả năng tư vấn video thời gian thực
- **React Hot Toast**: Hệ thống thông báo
- **Framer Motion**: Thư viện hoạt ảnh
- **Zod**: Xác thực schema ưu tiên TypeScript
- **Swiper**: Slider cảm ứng di động hiện đại

## Bắt Đầu

### Yêu cầu tiên quyết

- Node.js (v14.0.0 trở lên)
- npm (v7.0.0 trở lên)

### Cài đặt

1. Sao chép repository
```bash
git clone https://github.com/yourusername/hiv-treatment-system.git
cd hiv-treatment-system
```

2. Cài đặt các gói phụ thuộc
```bash
npm install
```

3. Chạy máy chủ phát triển
```bash
npm run dev
```

4. Build cho production
```bash
npm run build
```

5. Xem trước bản build production
```bash
npm run preview
```

## Cấu Trúc Dự Án

```
hiv-treatment-system/
├── public/               # Tệp tĩnh
├── src/
│   ├── components/       # Các component UI có thể tái sử dụng
│   │   ├── admin/        # Component dành cho quản trị viên
│   │   ├── auth/         # Component xác thực
│   │   ├── common/       # Component UI chung
│   │   ├── customer/     # Component dành cho bệnh nhân
│   │   ├── doctor/       # Component dành cho bác sĩ
│   │   ├── guest/        # Component dành cho khách
│   │   ├── layout/       # Component bố cục
│   │   ├── manager/      # Component dành cho quản lý
│   │   ├── staff/        # Component dành cho nhân viên
│   │   ├── user/         # Component liên quan đến người dùng
│   │   └── video/        # Component tư vấn video
│   ├── pages/            # Các trang
│   │   ├── admin/        # Trang quản trị viên
│   │   ├── customer/     # Trang bệnh nhân
│   │   ├── doctor/       # Trang bác sĩ
│   │   ├── guest/        # Trang khách
│   │   ├── manager/      # Trang quản lý
│   │   └── staff/        # Trang nhân viên
│   ├── services/         # Dịch vụ API
│   │   ├── adminService.js       # Các hàm API của quản trị viên
│   │   ├── appointmentService.js  # Các hàm API của lịch hẹn
│   │   ├── authService.js         # Các hàm API xác thực
│   │   ├── doctorService.js       # Các hàm API của bác sĩ
│   │   ├── labResultService.js    # Các hàm API kết quả xét nghiệm
│   │   ├── medicationService.js   # Các hàm API thuốc
│   │   └── ...                    # Các tệp dịch vụ khác
│   ├── styles/           # CSS và tệp định dạng
│   ├── types/            # Định nghĩa kiểu
│   ├── utils/            # Các hàm tiện ích
│   ├── App.jsx           # Component App chính với định tuyến
│   ├── main.jsx          # Điểm vào
│   └── index.css         # Style toàn cục
├── .eslintrc.js          # Cấu hình ESLint
├── .gitignore            # Tệp Git ignore
├── index.html            # Điểm vào HTML
├── package.json          # Các gói phụ thuộc và script npm
├── postcss.config.js     # Cấu hình PostCSS
├── tailwind.config.js    # Cấu hình Tailwind CSS
└── vite.config.js        # Cấu hình Vite
```

## Triển Khai Tính Năng Chính

### Xác thực
- Hệ thống đăng nhập và đăng ký an toàn
- Kiểm soát truy cập dựa trên vai trò
- Các route được bảo vệ cho người dùng được ủy quyền

### Quản lý Lịch hẹn
- Lên lịch cho các loại cuộc hẹn khác nhau
- Xem lịch cho bác sĩ và bệnh nhân
- Lịch sử cuộc hẹn và các cuộc hẹn sắp tới

### Kết quả Xét nghiệm
- Nhập kết quả xét nghiệm bởi nhân viên
- Xem xét bởi bác sĩ
- Xem an toàn bởi bệnh nhân

### Tư vấn Video
- Hội nghị video thời gian thực sử dụng Agora SDK
- Giao tiếp bác sĩ-bệnh nhân an toàn và riêng tư
- Tích hợp lịch hẹn

## Giấy phép

Dự án này được cấp phép theo Giấy phép MIT - xem tệp LICENSE để biết chi tiết.
