# Đồ Án Tốt Nghiệp
## Đề tài: Xây dựng hệ thống giám sát môi trường ứng dụng công nghệ LoRa

### Thông tin sinh viên
- Họ và tên: Nguyễn Hữu Lộc
- Mã số sinh viên: 18050078
- Email: 18050078@student.bdu.edu.vn

## Yêu cầu hệ thống

- Docker
- Docker Compose
- Node.js (phiên bản 16 trở lên, chỉ cần thiết cho phát triển)

## Hướng dẫn cấu hình

### 1. Cấu hình file môi trường

Trước khi chạy hệ thống, vui lòng thực hiện các bước sau:

1. **Đổi tên các file cấu hình mẫu**:
   ```bash
   mv example.env .env
   cp dashboard/example.env dashboard/.env
   cp nodejs-app/example.env nodejs-app/.env
   ```

2. **Cập nhật các thông số** trong các file .env vừa tạo nếu cần thiết.

### 2. Khởi động hệ thống

Chạy script sau để khởi động toàn bộ hệ thống:

```bash
chmod +x setup.sh
./setup.sh
```

Hoặc chạy trực tiếp bằng Docker Compose:

```bash
docker-compose up -d --build
```

### 3. Truy cập ứng dụng

Sau khi khởi động thành công, bạn có thể truy cập các dịch vụ sau:

- **Dashboard**: http://localhost:5173/
- **Backend API**: http://localhost:3000
- **MongoDB**: mongodb://localhost:27017
- **Ngrok UI**: http://localhost:4040 (nếu được bật)

## Các lệnh hữu ích

- **Xem logs**: `docker compose logs -f [tên_dịch_vụ]`
- **Dừng toàn bộ hệ thống**: `docker compose down`
- **Xây dựng lại một dịch vụ**: `docker compose up -d --build [tên_dịch_vụ]`
- **Xem danh sách container đang chạy**: `docker ps`

## Cấu trúc thư mục

- `/dashboard`: Ứng dụng giao diện người dùng
- `/nodejs-app`: Backend API
- `/nodejs-data/mongodb`: Dữ liệu MongoDB

## Hỗ trợ

Nếu gặp bất kỳ vấn đề gì trong quá trình cài đặt hoặc sử dụng, vui lòng liên hệ qua email đã cung cấp ở trên.