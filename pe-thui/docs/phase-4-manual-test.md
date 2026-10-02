# Hướng Dẫn Kiểm Thử Thủ Công (Manual Test Checklist) - Phase 4: Hồ Sơ, Đa Bé & Đồng Bộ Firebase Cloud

> **Thiết kế Stitch**: [Màn hình Hồ Sơ & Kết Nối (a7318e0f6cb14a2993b382d7137b3240)](https://stitch.withgoogle.com/projects/11062855407688729677)  
> **Phong cách**: *The Tactile Keepsake* (Tông hồng tím `#861949` & `#a53361`, bo góc tròn mềm `2.5rem`, bảo mật mã hóa đầu cuối)

---

## 1. Môi trường chuẩn bị
1. Khởi chạy ứng dụng:
   ```bash
   cd d:\Loto\bingo-master\pe-thui
   npm run dev
   ```
2. Mở trình duyệt tại: `http://localhost:3000/[code]` (với `[code]` của bé).
3. Nhấp vào tab **"Hồ sơ"** trên thanh điều hướng dưới đáy (Bottom Navigation).

---

## 2. Checklist chi tiết

### Test Case 1: Thẻ Trạng Thái Cơ Sở Dữ Liệu Firebase Cloud (Database Sync Card)
- [ ] **Trạng thái kết nối**:
  - Chấm tròn xanh phát xung nhịp nhấp nháy (`animate-ping`).
  - Dòng trạng thái: *"Thời gian thực • Đã kết nối"*.
  - Huy hiệu góc phải: *"Tự động"*.
- [ ] **Thông tin cơ sở dữ liệu**:
  - Tên cơ sở dữ liệu: `Firebase Firestore Cloud`.
  - Mã hồ sơ bé: `#[code]` (chính xác theo mã đang mở).
  - Chuẩn bảo mật: `Đầu cuối 256-bit`.
- [ ] **Nút "Đồng bộ"**:
  - Nhấp nút "Đồng bộ": Icon quay vòng, sau đó xuất hiện toast thông báo: *"Dữ liệu đã được đồng bộ với Firebase Firestore!"*.
- [ ] **Nút "Xuất file" (Sao lưu dự phòng)**:
  - Nhấp nút "Xuất file": Trình duyệt tự động tải xuống file sao lưu `pethui-backup-[code]-[date].json`.
  - Mở file JSON kiểm tra: Có đủ thông tin bé, các bản ghi cân nặng, tiêm chủng, cữ sữa, giấc ngủ và metadata engine.
- [ ] **Nút "Kiểm tra"**:
  - Nhấp nút: Xuất hiện toast xác nhận *"Cơ sở dữ liệu Firebase đang hoạt động hoàn hảo!"*.

---

### Test Case 2: Quản Lý Đa Hồ Sơ & Chuyển Đổi Bé (Multi-Profile Switcher)
- [ ] **Hồ sơ đang chọn (Active Profile)**:
  - Hiển thị avatar tròn của bé với dấu tick xanh ở góc.
  - Tên bé, badge *"Đang chọn"*, mã code và số tháng tuổi.
  - Nhấp icon bút chì: Mở modal chỉnh sửa hồ sơ bé (`EditProfileModal`).
- [ ] **Danh sách các bé khác đã lưu trên máy**:
  - Nếu thiết bị đã từng mở các bé khác (hoặc thai kỳ): Hiển thị thẻ bé đó kèm nút **"Chọn"**.
  - Nhấp **"Chọn"**: Trình duyệt chuyển ngay sang quản lý hồ sơ của bé đó.
- [ ] **Thêm bé mới**:
  - Nhấp nút viền nét đứt *"Thêm bé mới hoặc tạo thai kỳ mới"*: Điều hướng về trang chủ `/` để tạo bé hoặc nhập mã code mới.

---

### Test Case 3: Thẻ Chia Sẻ Gia Đình & Mã Kết Nối (Family Sharing)
- [ ] **Mã kết nối gia đình**:
  - Hiển thị mã dạng font mono rõ ràng: `#[CODE]-FAMILY`.
  - Nhấp nút **"Sao chép"**: Đổi sang trạng thái *"Đã chép"* kèm toast thông báo, mã kết nối được chép vào clipboard.
- [ ] **Mở mã QR chia sẻ**:
  - Nhấp vào icon mã QR ở góc trên: Mở modal mã QR chia sẻ gia đình (`ShareModal`).
- [ ] **Danh sách thành viên**:
  - Mẹ (Bạn) - Chủ sở hữu.
  - Ba & Người thân - Đồng bộ tức thì.

---

### Test Case 4: Cài Đặt Nhắc Nhở & Công Tắc Bật/Tắt (Reminders Toggles)
- [ ] **Nhắc cữ bú sữa & ăn dặm**:
  - Chạm vào công tắc: Thanh gạt chuyển động trượt mượt mà giữa trạng thái Bật (màu tím mận `#861949`) và Tắt (màu xám).
- [ ] **Lịch tiêm phòng kế tiếp**:
  - Bật/tắt công tắc phản hồi tức thì.
- [ ] **Đo thân nhiệt khi sốt**:
  - Bật/tắt công tắc phản hồi tức thì.

---

### Test Case 5: Keepsake Security Footer Note
- [ ] Khung chân trang nền hồng nhạt `#fff8f8` hiển thị biểu tượng xác minh `verified_user` cùng thông điệp bảo mật riêng tư của dữ liệu gia đình trên Firebase Cloud.

---

## 3. Kết Quả Mong Đợi
Giao diện đồng bộ hoàn hảo với phong cách *The Tactile Keepsake*, phản hồi tức thì, không có lỗi console, trải nghiệm mượt mà trên cả điện thoại di động và máy tính.
