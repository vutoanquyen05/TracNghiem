# 🎓 Ứng Dụng Ôn Tập Trắc Nghiệm

Ứng dụng web ôn tập trắc nghiệm thông minh, cho phép người dùng tải lên bộ câu hỏi từ file `.txt` và luyện tập trực tiếp trên giao diện hiện đại, thân thiện.

## ✨ Tính Năng Nổi Bật

* **Tải lên linh hoạt:** Hỗ trợ kéo & thả hoặc chọn tệp văn bản `.txt` chứa bộ câu hỏi trắc nghiệm.
* **Xử lý dữ liệu chuẩn xác:**
  * Tự động lấy tên file làm tiêu đề bài ôn tập.
  * Loại bỏ dấu `*` đánh dấu đáp án đúng khi hiển thị.
  * Sử dụng cấu trúc dữ liệu **Hàng đợi (Queue FIFO)** để xử lý và sắp xếp thứ tự câu hỏi theo đúng trình tự nhập vào.
* **Giao diện làm bài trực quan:**
  * **Sidebar danh sách câu hỏi bên trái** giúp dễ dàng quan sát tiến độ và di chuyển nhanh giữa các câu.
  * Hiển thị kết quả **Đúng / Sai ngay lập tức** sau khi chọn đáp án.
  * Tự động hiển thị **Giải thích chi tiết** (nếu câu hỏi có phần giải thích).
* **Chấm điểm & Thống kê chuyên nghiệp:**
  * Hiển thị Popup (Modal) tổng kết điểm số, số câu đúng/sai ngay khi nộp bài.
  * Bộ lọc thông minh sau khi nộp bài: Xem tất cả câu hỏi, chỉ xem **Câu đúng** hoặc chỉ xem **Câu sai**.
* **Điều hướng dễ dàng:** Nút câu trước/sau, làm lại bài thi, tải file mới.

---

## 📁 Định Dạng File Câu Hỏi Input (`.txt`)

Để ứng dụng đọc câu hỏi chính xác, file `.txt` cần tuân thủ cấu trúc sau:

* Mỗi câu hỏi phân cách nhau bởi **1 dòng trống**.
* Đáp án đúng được đánh dấu dấu sao `*` ở đầu chữ cái `A.`, `B.`, `C.`, `D.`.
* Lời giải thích bắt đầu bằng từ khóa `Giải thích:` (không bắt buộc).

### Ví dụ mẫu:

```text
1. Thủ đô của Việt Nam là gì?
*A. Hà Nội
B. TP. Hồ Chí Minh
C. Đà Nẵng
D. Cần Thơ
Giải thích: Hà Nội là thủ đô chính thức của Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.

2. 1 + 1 bằng bao nhiêu?
A. 1
*B. 2
C. 3
D. 4
