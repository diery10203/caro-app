# 🎮 Caro AI Game

Một ứng dụng ReactJS chơi caro với AI thông minh, được thiết kế với giao diện hiện đại và responsive.

## ✨ Tính năng

- **Giao diện đẹp**: Thiết kế hiện đại với gradient và animation
- **AI thông minh**: Sử dụng thuật toán Minimax với Alpha-Beta pruning
- **Responsive**: Hoạt động tốt trên desktop, tablet và mobile
- **Trải nghiệm người dùng tốt**: Animation mượt mà và feedback trực quan
- **Hướng dẫn rõ ràng**: Giao diện tiếng Việt với hướng dẫn chi tiết

## 🚀 Cách chạy ứng dụng

### Yêu cầu hệ thống
- Node.js (phiên bản 14 trở lên)
- npm hoặc yarn

### Cài đặt và chạy

1. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

2. **Chạy ứng dụng:**
   ```bash
   npm start
   ```

3. **Mở trình duyệt:**
   Ứng dụng sẽ tự động mở tại `http://localhost:3000`

## 🎯 Cách chơi

1. **Bắt đầu trò chơi**: Bạn sẽ chơi với ký hiệu **X**, AI chơi với ký hiệu **O**
2. **Luật chơi**: Đặt 5 quân cờ liên tiếp theo hàng ngang, dọc hoặc chéo để thắng
3. **Lượt chơi**: Click vào ô trống trên bàn cờ để đặt quân cờ
4. **AI suy nghĩ**: Khi đến lượt AI, sẽ có thông báo "AI đang suy nghĩ..."
5. **Kết thúc**: Trò chơi kết thúc khi có người thắng hoặc hòa

## 🤖 Thuật toán AI

Ứng dụng sử dụng thuật toán **Minimax** với **Alpha-Beta pruning** để tối ưu hóa hiệu suất:

- **Độ sâu tìm kiếm**: 3 bước
- **Hàm đánh giá**: Phân tích các đường thẳng 5 ô
- **Tối ưu hóa**: Alpha-Beta pruning để giảm thời gian tính toán
- **Chiến lược**: AI sẽ tìm cách tối ưu nhất để thắng hoặc hòa

## 🎨 Thiết kế

- **Gradient background**: Tạo cảm giác hiện đại
- **Glass morphism**: Hiệu ứng trong suốt với backdrop blur
- **Responsive design**: Tự động điều chỉnh kích thước theo thiết bị
- **Smooth animations**: Chuyển động mượt mà khi tương tác
- **Color scheme**: Phối màu hài hòa với gradient tím-xanh

## 📱 Responsive Design

Ứng dụng được tối ưu cho nhiều thiết bị:

- **Desktop**: Bàn cờ lớn với đầy đủ tính năng
- **Tablet**: Bàn cờ vừa phải, dễ thao tác
- **Mobile**: Bàn cờ nhỏ gọn, tối ưu cho màn hình cảm ứng

## 🛠️ Công nghệ sử dụng

- **React 18**: Framework chính
- **CSS3**: Styling với modern features
- **JavaScript ES6+**: Logic game và AI
- **HTML5**: Semantic markup

## 📁 Cấu trúc dự án

```
caro/
├── public/
│   └── index.html
├── src/
│   ├── App.js          # Component chính với logic game
│   ├── App.css         # Styling cho ứng dụng
│   ├── index.js        # Entry point
│   └── index.css       # Global styles
├── package.json        # Dependencies và scripts
└── README.md          # Hướng dẫn này
```

## 🎮 Tính năng game

- **Bàn cờ 15x15**: Kích thước chuẩn cho caro
- **Win detection**: Tự động phát hiện thắng thua
- **Draw detection**: Phát hiện hòa khi bàn cờ đầy
- **Reset game**: Nút chơi lại để bắt đầu ván mới
- **Status display**: Hiển thị trạng thái game rõ ràng

## 🔧 Tùy chỉnh

Bạn có thể dễ dàng tùy chỉnh:

- **Kích thước bàn cờ**: Thay đổi `BOARD_SIZE` trong `App.js`
- **Độ sâu AI**: Điều chỉnh depth trong hàm `getBestMove`
- **Màu sắc**: Thay đổi CSS variables trong `App.css`
- **Animation**: Tùy chỉnh timing và effects

## 📄 License

Dự án này được tạo cho mục đích học tập và giải trí.

---

**Chúc bạn chơi vui vẻ! 🎉** # caro-app
