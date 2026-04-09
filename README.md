# Chào mừng bạn đến với mẫu phát triển ứng dụng Expo của nhóm 4795 👋

Đây là một dự án [Expo](https://expo.dev) được tạo bằng [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Bắt đầu

1. Clone repository về máy.

   `git clone git@github.com:DiKeVoi/Expo-Template.git`

2. Cài đặt các dependency

   ```bash
   npm install
   ```

3. Chạy ứng dụng

   ```bash
   npm run start
   ```

4. Nếu Expo thông báo đang chạy development build, chuyển sang Expo Go bằng cách nhấn `s`.

5. Quét mã QR bằng cách sử dụng Expo Go (Android) và Camera (iOS).

Đối với phần thuyết trình lần này, chúng ta sẽ sử dụng:

- [Expo Go](https://expo.dev/go), một môi trường sandbox giới hạn để thử nghiệm phát triển ứng dụng với Expo.

Bạn có thể tải Expo Go trên Play Store (Android) và App Store (iOS).

Bạn có thể bắt đầu phát triển bằng cách chỉnh sửa các tệp bên trong thư mục **app**. Dự án này sử dụng [file-based routing](https://docs.expo.dev/router/introduction).

## Tạo lại dự án mới

Khi bạn sẵn sàng, hãy chạy:

```bash
npm run reset-project
```

Lệnh này sẽ chuyển mã khởi tạo sang thư mục **app-example** và tạo một thư mục **app** trống để bạn bắt đầu phát triển.

## Không thể truy cập Expo Go

Trong một vài trường hợp, thiết lập của mạng LAN sẽ không cho phép truy cập vào cổng của máy tính (port) do tường lửa. Khi đó, hãy chạy:

```bash
npm run start -- --tunnel
```

Khi đó, Expo sẽ sử dụng `ngrok` để tạo ra một URL, đóng vai trò là máy chủ proxy chuyển hướng đến port của máy tính, cho phép các thiết bị truy cập dù không chung Wi-Fi.

## Tìm hiểu thêm

Để tìm hiểu thêm về cách phát triển dự án Expo, hãy tham khảo các tài nguyên sau:

- [Tài liệu Expo](https://docs.expo.dev/): Tìm hiểu kiến thức nền tảng, hoặc đi sâu hơn với các [hướng dẫn](https://docs.expo.dev/guides).
- [Hướng dẫn Learn Expo](https://docs.expo.dev/tutorial/introduction/): Làm theo hướng dẫn từng bước để tạo một dự án chạy được trên Android, iOS và web.

## Tham gia cộng đồng

Tham gia cộng đồng các nhà phát triển đang xây dựng ứng dụng đa nền tảng.

- [Expo trên GitHub](https://github.com/expo/expo): Xem nền tảng mã nguồn mở của chúng tôi và đóng góp.
- [Cộng đồng Discord](https://chat.expo.dev): Trò chuyện với người dùng Expo và đặt câu hỏi.
