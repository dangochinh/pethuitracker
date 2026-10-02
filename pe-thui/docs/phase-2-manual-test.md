# Hướng Dẫn Kiểm Thử Thủ Công (Manual Test Checklist) - Phase 2: Màn Hình Bé Yêu (Tổng Quan & Tăng Trưởng)

> **Thiết kế Stitch**: [Màn hình Bé Yêu (0078ac5c59e9467b896a268715aa33d0)](https://stitch.withgoogle.com/projects/11062855407688729677)  
> **Phong cách**: *The Tactile Keepsake* (Tông hồng tím `#861949` & `#a53361`, bo góc tròn mềm `2.5rem`, bóng đổ mịn `shadow-[0_4px_24px_rgba(165,51,97,0.08)]`)

---

## 1. Môi trường chuẩn bị
1. Khởi chạy ứng dụng:
   ```bash
   cd d:\Loto\bingo-master\pe-thui
   npm run dev
   ```
2. Mở trình duyệt tại: `http://localhost:3000/[code]` (với `[code]` là mã của một bé đã sinh, ví dụ `#THUI-8869` hoặc mã bé test).
3. Đảm bảo profile ở chế độ **Bé Yêu** (`mode: 'baby'`).

---

## 2. Checklist chi tiết

### Test Case 1: Thẻ Hồ Sơ Trọng Tâm (Hero Profile Card - Tactile Keepsake)
- [ ] **Vòng tròn Avatar bồng bềnh**:
  - Avatar hiển thị tròn trịa viền nổi bezel bóng đổ mềm.
  - Có đính icon trái tim màu đỏ mận ở góc dưới phải của ảnh.
  - Nhấp vào avatar: Mở popup Chỉnh sửa hồ sơ bé (`EditProfileModal`).
- [ ] **Tên bé & Chứng nhận**:
  - Tên bé hiển thị đậm nét, bên cạnh có huy hiệu tick xanh xác nhận `verified`.
  - Tuổi chi tiết hiển thị đúng định dạng: `X tháng Y ngày tuổi`.
  - Chip trạng thái: Huy hiệu bo tròn màu xanh ngọc bích `Chuẩn WHO` (hoặc tình trạng cân nặng).
- [ ] **Pill Chép Mã Bé (Copy Share Code)**:
  - Nhấp vào nút *"Mã bé: #[code]"*.
  - Icon đổi từ `content_copy` sang `check` màu tím hồng.
  - Sau 2 giây tự động trả lại icon ban đầu. Dữ liệu mã code đã được copy vào clipboard của máy tính/điện thoại.
- [ ] **2 Giếng Chỉ Số Tăng Trưởng (Linen Wells)**:
  - Cân nặng (kg) và Chiều cao (cm) hiển thị rõ ràng trên nền hồng nhạt `#fff8f8`.
  - Nhấp vào bất kỳ giếng nào: Tự động chuyển thẳng sang màn hình Biểu đồ tăng trưởng (`setView('growth')`).

---

### Test Case 2: 3 Khối Bento Nhật Ký Hoạt Động Nhanh (Recent Activity Tiles)
- [ ] **Khối Cữ Sữa**:
  - Hiển thị lượng sữa cữ gần nhất (ví dụ: `120ml` hoặc `Bú mẹ`), có chấm tròn tím nhấp nháy (`animate-pulse`).
  - Hiển thị thời gian (ví dụ: `Lúc 11:30`).
  - Nhấp vào khối: Mở hộp thoại ghi cữ bú (`FeedingModal`).
- [ ] **Khối Giấc Ngủ**:
  - Nếu bé đang ngủ: Chấm xanh teal phát xung nhịp (`animate-ping`), dòng trạng thái *"Bé đang ngủ ngon"*.
  - Nếu đã dậy: Hiển thị thời lượng giấc ngủ (ví dụ: `1h30m`) và giờ dậy.
  - Nhấp vào khối: Mở hộp thoại giấc ngủ (`SleepModal`).
- [ ] **Khối Thay Tã**:
  - Hiển thị loại tã gần nhất: `Tã ướt`, `Tã bẩn` hoặc `Ướt & bẩn`.
  - Nhấp vào khối: Mở hộp thoại ghi nhận thay tã (`DiaperModal`).

---

### Test Case 3: Sơ Đồ Mọc Răng Hình Vòm Tương Tác (Teething Arch Preview)
- [ ] **Bố cục 2 hàm răng**:
  - Hàm trên: 10 vị trí răng sắp xếp theo cung vòm. Răng đã mọc có biểu tượng 🦷 trên nền hồng nhạt `#ffd9e2`, răng chưa mọc là nốt tròn nhỏ.
  - Đường nét đứt may mặc (stitched line) phân tách 2 hàm rõ ràng.
  - Hàm dưới: 10 vị trí răng tương ứng.
- [ ] **Huy hiệu răng mới mọc**:
  - Khung thông báo răng mọc gần nhất hiển thị tên răng (ví dụ: *"Răng mới nhất: Răng cửa giữa (Trên)"*) kèm ngày mọc.
- [ ] **Nút mở rộng**:
  - Nhấp vào nút icon mở rộng ở góc trên phải: Chuyển sang màn hình Sơ đồ răng chi tiết đầy đủ (`setView('teething')`).

---

### Test Case 4: Tiện Ích Biểu Đồ Tăng Trưởng WHO (Growth Chart Widget)
- [ ] **Nút gạt chuyển đổi chỉ số**:
  - Nhấp **"Cân nặng"**: Nút chuyển sang nền tím hồng đậm `#861949`, chữ trắng nổi bật.
  - Nhấp **"Chiều cao"**: Nút chuyển sang nền xanh teal đậm, chữ trắng.
- [ ] **Biểu đồ SVG**:
  - Hiển thị dải chuẩn WHO (vùng màu xanh nhạt P15-P85).
  - Đường nét đứt chuẩn trung vị WHO P50.
  - Đường tăng trưởng thực tế màu tím hồng của bé nối các điểm mốc qua các tháng.
  - Điểm mốc đo mới nhất có vòng halo phát sáng nhấp nháy (`animate-ping`).
- [ ] Nhấp link *"Xem báo cáo chi tiết →"*: Điều hướng sang trang biểu đồ tăng trưởng chi tiết.

---

### Test Case 5: Thẻ Nhắc Hẹn Tiêm Chủng Sắp Tới (Vaccination Reminder)
- [ ] Tự động tính toán mũi tiêm tiếp theo chưa tiêm dựa trên ngày sinh của bé:
  - Hiển thị tên vắc-xin (ví dụ: `Phế cầu - Mũi 4` hoặc `Sởi - Quai bị - Rubella`).
  - Badge trạng thái: `Sắp đến hạn` hoặc `Đến lịch tiêm` kèm số ngày đếm ngược.
- [ ] **Nút "Sổ tiêm chủng"**: Nhấp vào để mở danh sách toàn bộ các mũi tiêm theo từng tháng tuổi.
- [ ] **Nút "Đã tiêm" (Quick mark)**:
  - Khi nhấp vào nút "Đã tiêm": Nút đổi màu xanh ngọc bích, icon đổi sang `done_all` với thông báo *"Đã ghi nhận!"*.
  - Dữ liệu được gửi lên `/api/vaccines` lưu lại ngày tiêm là ngày hôm nay.
  - Thẻ tự động cập nhật sang mũi tiêm tiếp theo sau đó.

---

### Test Case 6: Dock Hành Động Ghi Nhanh & Lời Chúc Cột Mốc (Keepsake Banner)
- [ ] **Thanh Dock 4 nút tròn**:
  - Nhấp **Cữ sữa**: Mở Feeding modal.
  - Nhấp **Giấc ngủ**: Mở Sleep modal.
  - Nhấp **Thay tã**: Mở Diaper modal.
  - Nhấp **Đo bé**: Mở modal thêm chỉ số cân nặng / chiều cao (`AddRecordModal`).
- [ ] **Sweet Keepsake Note Banner**:
  - Khung viền đứt đoạn may thêu xinh xắn hiển thị lời chúc / đặc điểm phát triển theo tháng tuổi của bé (ví dụ bé 10 tháng: *"Pe Thúi đã biết tự bám tay vịn đứng lên và bập bẹ gọi 'Ba Ba', 'Mẹ Mẹ'! ✨"*).

---

## 3. Kết Quả Mong Đợi
Toàn bộ tương tác phản hồi trơn tru, không có giật lag, màu sắc chuẩn phong cách *The Tactile Keepsake* ấm áp và tinh tế, hỗ trợ tuyệt vời trên cả iPhone, Android và PC.
