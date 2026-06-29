# 🎯 LetQuiz - Backend Hệ Thống Trò Chơi Trắc Nghiệm Tương Tác

LetQuiz là một hệ thống backend được xây dựng trên nền tảng **NestJS**, cung cấp API và kết nối WebSocket thời gian thực cho ứng dụng trò chơi trắc nghiệm nhiều người chơi tương tác (tương tự Kahoot). Dự án tích hợp các công nghệ hiện đại như MongoDB để lưu trữ dữ liệu, Redis để quản lý hàng đợi và cache phiên chơi, cùng Socket.io cho truyền thông thời gian thực.

---

## Các Tính Năng Chính

### 1. Xác Thực & Bảo Mật (Authentication & Security)

- Xác thực người dùng bằng cơ chế **JWT (Access Token & Refresh Token)**.
- Đăng nhập bên thứ ba bằng **Google OAuth 2.0**.
- Phân quyền người dùng (Role-based Access Control - RBAC).
- **WebSocket Handshake JWT Security**: Tự động giải mã và xác thực Token JWT của người dùng ngay từ lúc thiết lập kết nối Socket, đảm bảo an toàn tuyệt đối cho vai trò Host và chống giả mạo ID người chơi.

### 2. Quản Lý Bộ Câu Hỏi (Quiz Management)

- Tạo, cập nhật, xóa và quản lý danh sách bộ câu hỏi (Quiz).
- Hỗ trợ nhiều loại câu hỏi trắc nghiệm.
- Gắn thẻ phân loại (Tags) bằng Tiếng Việt.
- Tải lên hình ảnh câu hỏi qua dịch vụ đám mây **Cloudinary**.

### 3. Phiên Chơi Thời Gian Thực (Real-time Game Sessions)

- Kết nối Socket.io thời gian thực giữa Host (Giáo viên) và các Player (Học sinh).
- **Tính điểm giảm dần tuyến tính**: Điểm số tối đa (1000) giảm dần theo thời gian phản hồi câu hỏi (giảm tuyến tính về tối thiểu 500 điểm khi hết giờ) theo công thức:
  $$\text{multiplier} = 1 - \left(\frac{\text{timeElapsed}}{\text{duration}} \times 0.5\right)$$
  $$\text{score} = \text{Math.round}(1000 \times \text{multiplier})$$
- Tự động đồng bộ hóa danh sách người chơi, đếm ngược thời gian, và cập nhật thống kê số lượt nộp bài.

### 4. Quản Lý Trạng Thế Kết Nối (Reconnection Management)

- Người chơi thường (Player) được phép ngắt kết nối tạm thời và tự động kết nối lại (Reconnect) trong vòng 30 giây mà không bị mất dữ liệu điểm số hoặc bị đá khỏi phòng.
- Host (Giáo viên) được bảo vệ bằng cơ chế đối chiếu động `hostId` khi tái kết nối để khôi phục quyền điều hành phòng.

---

## Yêu Cầu Hệ Thống

- **Node.js** >= 18.x
- **npm** hoặc **yarn**
- **MongoDB** (Local hoặc MongoDB Atlas)
- **Redis** (Local hoặc Upstash Redis)

---

## Hướng Dẫn Cài Đặt

### 1. Tải Mã Nguồn & Cài Đặt Dependencies

```bash
# Clone repository
git clone https://github.com/LuongDuy0906/let-quiz.git

# Di chuyển vào thư mục dự án
cd let-quiz

# Cài đặt thư viện
npm install
```

### 2. Cấu Hình Biến Môi Trường (.env)

Tạo file `.env` từ mẫu `.env.example`:

```bash
cp .env.example .env
```

Các biến môi trường cần thiết:

```env
PORT=4000
NODE_ENV=development

# Database & Cache
MONGODB_URI=mongodb://localhost:27017/let-quiz
REDIS_URL=redis://localhost:6379

# JWT Security
SECRET_KEY=your_jwt_access_secret_key
EXPIRED_IN=15m
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret_key
REFRESH_TOKEN_EXPIRED_IN=7d

# Cloudinary (Tải ảnh câu hỏi)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth (Tùy chọn)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
```

### 3. Chạy Ứng Dụng

**Chế độ phát triển (Development):**

```bash
npm run start:dev
```

**Biên dịch & Chạy production:**

```bash
npm run build
npm run start:prod
```

---

## Cấu Trúc Thư Mục Dự Án

```
src/
├── config/                 # Các file cấu hình hệ thống (JWT, MongoDB, Redis, Google OAuth)
├── common/                # Các thành phần dùng chung toàn hệ thống
│   ├── decorators/        # Custom decorators (@Roles, @ReqUser, v.v.)
│   ├── filters/           # Exception filters xử lý lỗi tập trung
│   ├── guards/            # Guards xác thực phân quyền
│   └── interceptors/      # Interceptors xử lý dữ liệu HTTP
├── modules/               # Các module chức năng chính
│   ├── auth/              # Xác thực JWT, Google Login, đăng ký/đăng nhập
│   ├── user/              # Quản lý tài khoản & thông tin cá nhân
│   ├── quiz/              # Quản lý bộ câu hỏi & bộ đề trắc nghiệm
│   ├── game-session/      # Gateway Socket.io và logic điều phối phòng chơi (Real-time)
│   ├── player-record/     # Thống kê điểm số, lịch sử đấu và BXH (Leaderboard)
│   ├── cloudinary/        # Dịch vụ tải hình ảnh lên đám mây
│   └── mail/              # Dịch vụ gửi email (Nodemailer)
├── app.module.ts          # Module gốc ứng dụng
└── main.ts                # File khởi tạo bootstrap dự án NestJS
```

---

## Sự Kiện WebSocket Gateway (`/game-session`)

Kết nối WebSocket chính thức sử dụng cổng chạy Server (ví dụ: `ws://localhost:4000`).

| Sự Kiện Gửi Lên (Client -> Server) | Với Vai Trò                          | Payload                           |
| :--------------------------------- | :----------------------------------- | :-------------------------------- |
| `joinRoom`                         | Tham gia vào phòng chơi              | `{ roomPin, name, avatar }`       |
| `leaveRoom`                        | Chủ động rời khỏi phòng chơi         | Không có                          |
| `reconnectToRoom`                  | Yêu cầu kết nối lại sau khi rớt mạng | `{ roomPin, playerId }`           |
| `submitAnswer`                     | Nộp đáp án lựa chọn                  | `{ questionId, optionId, score }` |
| `gameEnded`                        | Yêu cầu kết thúc trò chơi (chỉ Host) | Không có                          |

| Sự Kiện Nhận Về (Server -> Client) | Với Vai Trò                                       | Payload                                            |
| :--------------------------------- | :------------------------------------------------ | :------------------------------------------------- |
| `playerListUpdate`                 | Cập nhật danh sách người chơi trong phòng chờ     | `[ { _id, name, avatar, isHost } ]`                |
| `playerDisconnect`                 | Thông báo người chơi bị mất kết nối mạng tạm thời | `{ message, playerId, playerName, periodSeconds }` |
| `playerReconnected`                | Thông báo người chơi đã kết nối lại thành công    | `{ message, playerId }`                            |
| `roomClosed`                       | Thông báo phòng chơi đã bị giải tán bởi Host      | `{ message }`                                      |
| `gameStarted`                      | Trận đấu được kích hoạt bắt đầu                   | `{ gameSession, message }`                         |
| `nextQuestion`                     | Gửi câu hỏi tiếp theo kèm thời gian đếm ngược     | `{ currentQuestionIndex, text, duration, ... }`    |
| `revealAnswer`                     | Công bố các đáp án đúng sau khi hết giờ           | `{ correctOptionIds }`                             |
| `liveLeaderboard`                  | Bảng xếp hạng cập nhật điểm số trực tiếp          | `[ { member, score } ]`                            |

---

## Tài Liệu API (Swagger)

Khi ứng dụng đang chạy ở chế độ phát triển, bạn có thể truy cập tài liệu Swagger UI chi tiết tại đường dẫn:

```
http://localhost:4000/api/document
```
