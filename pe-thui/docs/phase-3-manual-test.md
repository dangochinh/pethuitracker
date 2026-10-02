# Hướng Dẫn Kiểm Thử Thủ Công (Manual Test Checklist) - Phase 3: Màn Hình Nhật Ký & Cột Mốc

> **Thiết kế Stitch**: [Màn hình Nhật Ký & Cột Mốc (d75d4dd5f4fc4e429c3c09b026156310)](https://stitch.withgoogle.com/projects/11062855407688729677)  
> **Phong cách**: *The Tactile Keepsake* (Tông hồng tím `#861949` & `#a53361`, đường nét may đứt mềm mại, bố cục timeline hữu cơ với icon tròn nổi bật)

---

## 1. Môi trường chuẩn bị
1. Khởi chạy ứng dụng:
   ```bash
   cd d:\Loto\bingo-master\pe-thui
   npm run dev
   ```
2. Mở trình duyệt tại: `http://localhost:3000/[code]` (với `[code]` của bé).
3. Nhấp vào tab **"Nhật ký"** trên thanh điều hướng dưới đáy (Bottom Navigation).

---

## 2. Checklist chi tiết

### Test Case 1: Bộ Chuyển Đổi Tab (Header Switcher)
- [ ] **Chuyển đổi Tab**:
  - Nhấp vào **"Nhật ký ngày"**: Hiển thị Mini Calendar Carousel và luồng Timeline hoạt động sinh hoạt trong ngày.
  - Nhấp vào **"Cột mốc [Độ tuổi]"**: Chuyển sang bảng checklist các mốc phát triển theo chuẩn WHO với banner tiến độ.
  - Hiệu ứng chuyển động mượt mà, tab đang kích hoạt có nền trắng nổi bật với bóng đổ nhẹ.

---

### Test Case 2: Thanh Trượt Chọn Ngày (Mini Day Carousel)
- [ ] **Danh sách ngày ngang**:
  - Hiển thị các ngày xung quanh ngày hiện tại (ví dụ: T4, T5, T6, Hôm nay, T2,...).
  - Ngày được chọn có nền màu tím mận `#861949`, chữ trắng và chấm tròn nhấp nháy (`animate-pulse`).
  - Các ngày trong tương lai bị làm mờ và vô hiệu hóa (disabled).
- [ ] **Tương tác**: Nhấp vào một ngày trong quá khứ (ví dụ hôm qua), dữ liệu Timeline bên dưới lập tức tải lại tương ứng với ngày đó.

---

### Test Case 3: 4 Ô Tóm Tắt Nhanh Trong Ngày (Daily Summary Pills)
- [ ] **Sữa ấm**: Hiển thị tổng lượng sữa bé đã bú trong ngày (ví dụ `540ml`).
- [ ] **Ngủ ngày**: Hiển thị tổng thời gian ngủ của bé (ví dụ `2h30m` hoặc `2.5h`).
- [ ] **Thay tã**: Hiển thị tổng số lần thay tã trong ngày (ví dụ `3 lần`).
- [ ] **Cột mốc**: Hiển thị số cột mốc / khoảnh khắc đã ghi nhận.

---

### Test Case 4: Luồng Dòng Thời Gian Hữu Cơ (Organic Timeline Stream)
- [ ] **Đường ray thời gian**: Trục dọc chạy nối các sự kiện với hiệu ứng màu gradient từ tím mận sang hồng nhạt.
- [ ] **Các sự kiện sinh hoạt**:
  - **Cữ bú**: Icon bình sữa màu tím hồng, hiển thị số ml, thời gian (ví dụ `08:30 SÁNG`) và ghi chú.
  - **Giấc ngủ**: Icon mặt trăng màu xanh teal, hiển thị thời lượng (ví dụ `1h 15p`) và thời gian ngủ/dậy.
  - **Thay tã**: Icon vệ sinh màu vàng đất/amber, hiển thị loại tã (`Tã ướt`, `Tã bẩn`).
  - Thứ tự các sự kiện được sắp xếp logic theo trình tự thời gian từ sáng đến tối.

---

### Test Case 5: Thẻ Vinh Danh Cột Mốc Đặc Biệt (Milestone Keepsake Card)
- [ ] **Vị trí & Nổi bật**:
  - Icon ngôi sao vàng rực rỡ có hiệu ứng nhún nhảy (`animate-bounce`) trên trục thời gian.
  - Card có viền bo tròn mềm mại `rounded-[2rem]`, nền gradient hồng kem dịu dàng.
  - Huy hiệu tím mận nổi bật: **"Cột Mốc Mới! 🎉"**.
  - Tiêu đề cột mốc (ví dụ: *"Pe Thúi tự đứng bám vịn & vỗ tay!"*).
- [ ] **Ảnh chụp kỷ niệm 4:3**:
  - Hình ảnh khoảnh khắc hiển thị sắc nét với tỷ lệ 4:3.
  - Lớp phủ kính mờ đáy ảnh (frosted blur overlay) thể hiện cảm xúc gia đình: *"Cả nhà vỡ òa hạnh phúc ❤️"* cùng chip số tháng tuổi của bé.
- [ ] **Nút chia sẻ**: Nhấp nút chia sẻ ở góc trên phải: Tự động copy nội dung cột mốc vào clipboard hoặc kích hoạt Web Share API trên điện thoại.

---

### Test Case 6: Bảng Cột Mốc Phát Triển Chuẩn WHO (Tab Cột Mốc)
- [ ] **Banner Tiến Độ**:
  - Hiển thị đúng giai đoạn theo tháng tuổi của bé (ví dụ: *Giai đoạn 9 - 12 Tháng*).
  - Thanh tiến độ % hoàn thành chuẩn xác theo số mốc đã đạt.
- [ ] **3 Nhóm Kỹ Năng**:
  - **Vận động thô**: Tự ngồi vững, bò thuần thục, tự bám vịn đứng dậy.
  - **Vận động tinh**: Chuyền đồ vật 2 tay, nhón ngón tay nhặt đồ ăn (Pincer grasp), cầm cốc có quai.
  - **Ngôn ngữ & Cảm xúc**: Bập bẹ ba-ba/ma-ma, vẫy tay chào, phản xạ khi nghe tên mình.
- [ ] **Đánh dấu mốc**: Nhấp vào bất kỳ mục nào để bật/tắt trạng thái hoàn thành. Vòng tròn đổi thành dấu tích xanh/tím, thanh tiến độ % tự động cập nhật ngay và được lưu vào `localStorage`.

---

### Test Case 7: Nút Nổi & Modal Thêm Hoạt Động (Floating Action Pill)
- [ ] Nút nổi bo tròn ở đáy màn hình: **"Ghi nhật ký mới"** kèm icon dấu cộng.
- [ ] Nhấp nút: Mở modal drawer từ dưới lên với nền mờ.
- [ ] Chọn loại hoạt động: 4 nút (Bú sữa, Ăn dặm, Giấc ngủ, Cột mốc).
- [ ] Nhập giờ, số ml hoặc ghi chú rồi nhấn **"Lưu kỷ niệm"**. Modal đóng lại và sự kiện mới xuất hiện ngay trên dòng thời gian.

---

## 3. Kết Quả Mong Đợi
Toàn bộ thao tác cuộn mượt mà, màu sắc chuẩn phong cách *The Tactile Keepsake*, giao diện hiển thị xuất sắc trên cả màn hình di động lẫn máy tính để bàn.
