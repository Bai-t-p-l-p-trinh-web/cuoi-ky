# FakeAuto - Nền tảng mua bán xe trực tuyến

## Tổng quan
FakeAuto là một nền tảng web được thiết kế để hỗ trợ việc mua bán xe cũ. Website cung cấp giao diện thân thiện, cho phép người dùng đăng tin bán xe, tìm kiếm xe, giao tiếp trực tiếp với người bán và quản lý giao dịch. Dự án được phát triển như một đồ án cuối kỳ cho môn Lập trình Web tại Học viện Công nghệ Bưu chính Viễn thông.

## Tính năng
- **Xác thực người dùng**: Hỗ trợ đăng ký và đăng nhập qua email hoặc Google OAuth, với xác thực OTP qua email và tùy chọn xác minh hai bước (2FA).
- **Đăng tin xe**: Người bán có thể tạo, chỉnh sửa và quản lý tin đăng xe, bao gồm thông tin như tiêu đề, giá, năm sản xuất, số km, loại nhiên liệu và hình ảnh.
- **Tìm kiếm và lọc**: Người mua có thể tìm kiếm và lọc xe theo hãng, giá, năm, số km, địa điểm, loại nhiên liệu và số chỗ ngồi.
- **Chat thời gian thực**: Hệ thống chat dựa trên WebSocket (Socket.IO) cho phép giao tiếp trực tiếp giữa người mua và người bán.
- **Bảng điều khiển quản trị**: Quản trị viên có thể quản lý người dùng, tin đăng xe, đơn hàng và thanh toán, cùng với thống kê chi tiết và nhật ký hoạt động.
- **Quản lý đơn hàng**: Hỗ trợ nhiều phương thức thanh toán (đặt cọc, thanh toán toàn bộ, giao dịch trực tiếp) với tạo mã QR cho thanh toán trực tuyến.
- **Thống kê**: Người bán có thể xem thống kê lượt xem, tương tác và doanh thu thông qua biểu đồ.
- **Tích hợp CI/CD**: Triển khai tự động sử dụng GitHub Actions, với thông báo gửi qua webhook Discord.
- **Giao diện responsive**: Thân thiện với thiết bị di động, đảm bảo trải nghiệm mượt mà trên nhiều thiết bị.

## Công nghệ sử dụng
### Frontend
- **React.js**: Xây dựng giao diện người dùng động và hiện đại.
- **Vite**: Công cụ build nhanh và server phát triển.
- **React Router**: Điều hướng phía client.
- **Redux Toolkit**: Quản lý trạng thái ứng dụng.
- **Axios**: Gửi yêu cầu HTTP đến backend.
- **Tailwind CSS**: Thiết kế giao diện với CSS.
- **Cloudinary**: Lưu trữ và tối ưu hình ảnh.
- **Chart.js & React-chartjs-2**: Vẽ biểu đồ thống kê.
- **React Toastify**: Hiển thị thông báo.
- **Socket.IO Client**: Hỗ trợ chat thời gian thực.

### Backend
- **Node.js & Express.js**: Xây dựng API RESTful và xử lý logic phía server.
- **MongoDB**: Cơ sở dữ liệu NoSQL để lưu trữ thông tin người dùng, xe và giao dịch.
- **Mongoose**: ORM để quản lý schema MongoDB.
- **Socket.IO**: Giao tiếp hai chiều thời gian thực.
- **JWT**: Xác thực người dùng và quản lý phiên.
- **Bcrypt**: Mã hóa mật khẩu.
- **Nodemailer**: Gửi email OTP.
- **Cloudinary**: Lưu trữ và xử lý hình ảnh.
- **Passport.js**: Tích hợp xác thực Google OAuth.
- **Node-cron**: Lên lịch tác vụ tự động.
- **PDF-lib**: Tạo báo cáo PDF cho kiểm tra xe.

### Triển khai
- **VPS**: Máy chủ Ubuntu 22.04.
- **Nginx**: Reverse proxy để định tuyến yêu cầu và phục vụ frontend.
- **PM2**: Quản lý tiến trình cho ứng dụng Node.js.
- **GitHub Actions**: Tự động hóa quy trình CI/CD.
- **Let's Encrypt**: Cung cấp chứng chỉ SSL/TLS cho HTTPS.
- **Tên miền**: Frontend tại `fakeauto.id.vn`, backend tại `api.fakeauto.id.vn`.

## Cài đặt
### Yêu cầu
- Node.js (phiên bản 18 trở lên)
- MongoDB (cục bộ hoặc cloud, ví dụ MongoDB Atlas)
- Git
- Nginx (cho triển khai production)
- Tài khoản Cloudinary để lưu trữ hình ảnh
- Google OAuth 2.0 Client ID cho xác thực
- Webhook Discord cho thông báo triển khai

### Các bước cài đặt
1. **Clone Repository**
   ```bash
   git clone https://github.com/Bai-t-p-l-p-trinh-web/cuoi-ky.git
   cd cuoi-ky
   ```

2. **Thiết lập biến môi trường**
   - Tạo tệp `.env` trong thư mục `backend` với các biến:
     ```env
     MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
     PORT=3000
     JWT_SECRET=<your-jwt-secret>
     CLIENT_URL=http://fakeauto.id.vn
     GOOGLE_CLIENT_ID=<your-google-client-id>
     GOOGLE_CLIENT_SECRET=<your-google-client-secret>
     CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
     CLOUDINARY_API_KEY=<your-cloudinary-api-key>
     CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
     EMAIL_USER=<your-email-address>
     EMAIL_PASS=<your-email-password>
     ```
   - Tạo tệp `.env` trong thư mục `frontend` với:
     ```env
     VITE_API_URL=http://api.fakeauto.id.vn
     VITE_CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
     ```

3. **Cài đặt dependencies**
   - Backend:
     ```bash
     cd backend
     npm install
     ```
   - Frontend:
     ```bash
     cd ../frontend
     npm install
     ```

4. **Chạy cục bộ**
   - Khởi động backend:
     ```bash
     cd backend
     npm run dev
     ```
   - Khởi động frontend:
     ```bash
     cd ../frontend
     npm run dev
     ```

5. **Build cho production**
   - Build frontend:
     ```bash
     cd frontend
     npm run build
     ```
   - Sao chép thư mục `dist` vào `/var/www/frontend/` trên server.
   - Khởi động backend với PM2:
     ```bash
     cd ../backend
     pm2 start ecosystem.config.js
     ```

6. **Cấu hình Nginx**
   - Tạo tệp cấu hình Nginx cho frontend và backend (xem cấu hình trong tài liệu dự án).
   - Kiểm tra và reload Nginx:
     ```bash
     sudo nginx -t
     sudo systemctl reload nginx
     ```

7. **Thiết lập CI/CD**
   - Thêm GitHub Secrets cho `HOST`, `USERNAME`, `PRIVATE_KEY`, và `DISCORD_WEBHOOK` trong cài đặt repository.
   - Push thay đổi lên nhánh `main` để kích hoạt workflow GitHub Actions.

## Sử dụng
- **Người mua**: Đăng ký hoặc đăng nhập, duyệt danh sách xe, lọc theo tiêu chí, xem chi tiết xe và bắt đầu trò chuyện với người bán. Đặt đơn hàng với tùy chọn đặt cọc hoặc thanh toán đầy đủ.
- **Người bán**: Tạo tin đăng xe bằng cách gửi yêu cầu xác minh. Quản lý tin đăng, xem thống kê và giao tiếp với người mua.
- **Quản trị viên**: Truy cập bảng điều khiển admin để quản lý người dùng, xe, đơn hàng và thanh toán. Theo dõi hoạt động hệ thống và xác minh giao dịch.

## Hạn chế
- Giao diện chưa tối ưu hoàn toàn trên thiết bị di động.
- Chức năng chat chỉ hỗ trợ văn bản, chưa hỗ trợ gửi hình ảnh hoặc video.
- Chưa kiểm thử hiệu năng với số lượng người dùng lớn do hạn chế tài nguyên.
- Gặp khó khăn ban đầu với các công nghệ như Socket.IO và Nginx.

## Hướng phát triển
- Thêm hỗ trợ gửi hình ảnh và video trong chat.
- Tích hợp Google Maps để tìm kiếm xe theo vị trí.
- Phát triển ứng dụng di động bằng React Native hoặc Flutter.
- Nâng cấp thống kê admin với báo cáo chi tiết hơn.
- Cải thiện giao diện responsive trên di động.
- Tăng cường bảo mật với các tính năng xác thực nâng cao.

## Thành viên nhóm
- **Lâm Nhật Tiên** (N23DCCN198, D23CQCN03-N)
- **Lê Viết Xuân** (N23DCCN069, D23CQCN01-N)


## Lời cảm ơn
- **Giảng viên hướng dẫn**: Nguyễn Văn Hữu Hoàng
- **Đơn vị**: Học viện Công nghệ Bưu chính Viễn thông
- **Tài liệu tham khảo**: Các thư viện và công cụ mã nguồn mở được liệt kê trong tài liệu dự án.

Để biết thêm chi tiết, xem tài liệu dự án đầy đủ hoặc truy cập [GitHub repository](https://github.com/Bai-t-p-l-p-trinh-web/cuoi-ky).