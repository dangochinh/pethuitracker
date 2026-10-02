# Hướng Dẫn Kiểm Thử Thủ Công (Manual Test Checklist) - Phase 1: Màn Hình Thai Kỳ

> **Thiết kế Stitch**: [Màn hình Hành trình Thai Kỳ (2beb55aad2ec457bb03e7f64e831d781)](https://stitch.withgoogle.com/projects/11062855407688729677)  
> **Phong cách**: *The Tactile Keepsake* (Tông hồng tím `#a53361`, bo góc tròn mềm `2.5rem`, không viền đen thô)

---

## 1. Môi trường chuẩn bị
1. Khởi chạy ứng dụng:
   ```bash
   cd d:\Loto\bingo-master\pe-thui
   npm run dev
   ```
2. Mở trình duyệt tại: `http://localhost:3000` (hoặc profile thai kỳ tương ứng).
3. Đảm bảo profile hiện tại là chế độ Thai kỳ (có cấu hình `estimatedDueDate`).

---

## 2. Checklist chi tiết

### Test Case 1: Vòng quay Roulette Chọn Tuần (Select Area phong cách CS:GO)
- [ ] **Hiển thị định vị**: Có khung viền tím nổi bật ở chính giữa thanh trượt với 2 mũi tên tam giác chỉ lên/xuống định vị vùng chọn.
- [ ] **Thao tác kéo/cuộn (Touch & Drag)**: Dùng chuột bấm giữ và kéo thanh tuần sang trái/phải (hoặc vuốt ngón tay trên mobile).
- [ ] **Tự động bắt mốc**: Khi mốc tuần đi qua tâm khung chọn, tuần đó tự động được kích hoạt và Card thứ 2 (Thông tin phát triển của bé) cập nhật tức thì tương ứng.
- [ ] **Bấm trực tiếp**: Nhấp vào bất kỳ số tuần nào (ví dụ tuần 24), thanh trượt tự động scroll mượt mà tuần đó vào đúng tâm khung chọn.

---

### Test Case 2: Máy Đếm Cử Động Thai (Kick Counter)
- [ ] **Hiển thị ban đầu**: Số lần đạp hiển thị là `0`, có dòng chữ hướng dẫn *"Chạm nút bên cạnh khi cảm nhận bé đạp"*.
- [ ] **Ghi nhận cú đạp**: Nhấp nút gradient **"Bé vừa đạp!"** (có icon bàn tay).
  - Số đếm tăng lên `1`.
  - Hiển thị dòng *"Cần thêm 9 cử động nữa"*.
  - Có haptic rung phản hồi (nếu thử trên điện thoại hỗ trợ `navigator.vibrate`).
  - Dòng mốc thời gian *"Gần nhất: [hh:mm]"* xuất hiện ngay bên dưới.
- [ ] **Đạt mục tiêu $\ge 10$ lần**: Nhấp nút cho đến khi đạt `10`.
  - Icon chuyển thành tích xanh `check_circle`.
  - Hiển thị thông điệp khích lệ: *"Bé rất năng động hôm nay!"*.
- [ ] **Lưu trữ dữ liệu**: Refresh lại trang trình duyệt (F5).
  - Số đếm và lịch sử các cú đạp trong ngày vẫn được giữ nguyên vẹn (lưu qua `localStorage`).
- [ ] **Đặt lại (Reset)**: Bấm nút gạch chân *"Đặt lại"*, chọn xác nhận trên hộp thoại confirm.
  - Số lần đạp về `0`, danh sách thời gian gần nhất biến mất.

---

### Test Case 3: Giỏ Đồ Đi Sinh (Hospital Bag Checklist)
- [ ] **Thanh tiến độ %**: Hiển thị tỷ lệ chuẩn bị (ví dụ `69%` kèm thanh bar màu gradient tím - hồng).
- [ ] **Chuyển Tab phân loại**:
  - Nhấp tab **"Cho bé 👶"**: Chỉ hiển thị các món tã, quần áo sơ sinh, khăn xô,...
  - Nhấp tab **"Cho mẹ 🤱"**: Chỉ hiển thị đồ dùng của mẹ sau sinh.
  - Nhấp tab **"Giấy tờ 📄"**: Hiển thị CCCD, thẻ BHYT, hồ sơ khám.
  - Nhấp tab **"Tất cả"**: Hiển thị toàn bộ danh sách.
- [ ] **Đánh dấu đã chuẩn bị**: Nhấp vào một món chưa tích.
  - Ô vuông chuyển sang màu tím có dấu tích trắng.
  - Chữ bị gạch ngang và mờ đi.
  - Thanh tiến độ % và bộ đếm `X / Y món` tự động tăng ngay lập tức.
- [ ] **Thêm món mới**: Nhập tên món (ví dụ: *"Bình xịt sát khuẩn mini"*) vào ô input cuối danh sách và nhấn **"Thêm"**.
  - Món mới xuất hiện ngay trong danh sách với trạng thái chưa tích.
  - Đếm tổng số món tăng lên `+1`.
- [ ] **Thu gọn / Xem thêm**: Nhấp nút *"Xem thêm X món nữa ▼"* để mở rộng toàn bộ danh sách, hoặc *"Thu gọn danh sách ▲"* để gọn gàng màn hình.
- [ ] **Lưu trữ**: Refresh lại trang, tất cả trạng thái tích chọn và các món tùy chỉnh tự thêm vẫn được lưu đầy đủ.

---

### Test Case 4: Lịch Khám Thai Sắp Tới & Cảnh Báo Sức Khỏe
- [ ] Khi kéo thanh tuần đến các mốc:
  - **Tuần 11-13**: Thẻ lịch khám hiển thị *"Đo độ mờ da gáy & Double Test"*, badge tím đậm *"Rất quan trọng"*.
  - **Tuần 20-24**: Thẻ hiển thị *"Khảo sát hình thái thai nhi"*.
  - **Tuần 24-28**: Thẻ hiển thị *"Tầm soát tiểu đường thai kỳ"*.
  - **Tuần 37-40**: Thẻ hiển thị *"Khám thai hàng tuần trước sinh"*, badge *"Gần sinh"*.
- [ ] Thẻ Lời khuyên & Cảnh báo:
  - Hiển thị dinh dưỡng khuyến cáo tương ứng (Axit Folic cho tuần < 13; Canxi/Sắt cho tuần 13-26; DHA cho tuần 27+).
  - Hộp màu cam cảnh báo các dấu hiệu nguy hiểm cần vào viện cấp cứu ngay.

---

## 3. Kết Quả Mong Đợi
Toàn bộ giao diện hiển thị tinh tế, không phát sinh lỗi console, không vỡ layout trên cả màn hình di động (iPhone / Android) lẫn màn hình máy tính để bàn.
