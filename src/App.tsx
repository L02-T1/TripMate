import { motion } from "framer-motion";

// NOTE: This UI uses TailwindCSS. Make sure Tailwind is installed.

// Simple reusable UI components
const Container = ({ children }: any) => (
  <div className="max-w-6xl mx-auto px-4">{children}</div>
);

const Button = ({ children }: any) => (
  <button className="bg-teal-600 text-white px-6 py-3 rounded-2xl hover:bg-teal-700 transition font-medium shadow-md">
    {children}
  </button>
);

const Card = ({ children }: any) => (
  <div className="bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transition border border-gray-100">
    {children}
  </div>
);

interface Screen {
  title: string;
  desc: string;
  img: string;
}

export default function TripMateLanding(): JSX.Element {
  const screens: Screen[] = [
    {
      title: "Lập kế hoạch chuyến đi",
      desc: "Tạo lịch trình du lịch nhanh chóng, dễ dàng quản lý mọi hoạt động",
      img: "https://via.placeholder.com/300x600",
    },
    {
      title: "Mời bạn bè",
      desc: "Tham gia chuyến đi cùng bạn bè và cập nhật theo thời gian thực",
      img: "https://via.placeholder.com/300x600",
    },
    {
      title: "Quản lý chi phí",
      desc: "Theo dõi chi tiêu và chia tiền tự động, minh bạch",
      img: "https://via.placeholder.com/300x600",
    },
    {
      title: "Ngân sách thông minh",
      desc: "Giữ chi tiêu trong kiểm soát với phân tích thông minh",
      img: "https://via.placeholder.com/300x600",
    },
  ];

  return (
    <div className="bg-gray-50 text-gray-800">
      {/* Navbar */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <Container>
          <div className="flex items-center justify-between py-4">
            <h1 className="text-xl font-bold text-teal-600">TripMate</h1>
            <div className="space-x-6 hidden md:block text-sm">
              <a href="#features" className="hover:text-teal-600">Tính năng</a>
              <a href="#about" className="hover:text-teal-600">Giới thiệu</a>
              <a href="#contact" className="hover:text-teal-600">Liên hệ</a>
            </div>
            <Button>Bắt đầu</Button>
          </div>
        </Container>
      </div>

      {/* Hero */}
      <Container>
        <div className="text-center py-20">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-6 leading-tight"
          >
            TripMate – Quản lý du lịch nhóm thông minh
          </motion.h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            TripMate là ứng dụng giúp bạn và nhóm bạn quản lý chi phí du lịch,
            chia tiền minh bạch và lên kế hoạch chuyến đi một cách hiệu quả.
          </p>
          <Button>🚀 Trải nghiệm ngay</Button>
        </div>
      </Container>

      {/* Features */}
      <Container>
        <div id="features" className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tính năng nổi bật
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {screens.map((screen, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card>
                  <img src={screen.img} className="rounded-xl mb-4" />
                  <h3 className="font-semibold text-lg mb-2">
                    {screen.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {screen.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>

      {/* About */}
      <div className="bg-white py-20" id="about">
  <Container>
    
    {/* 4 images */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      <img src="Frame 6.png" className="rounded-2xl shadow-md w-full" />
      <img src="Frame 7.png" className="rounded-2xl shadow-md w-full" />
      <img src="Frame 8.png" className="rounded-2xl shadow-md w-full" />
      <img src="Frame 9.png" className="rounded-2xl shadow-md w-full" />
    </div>

    {/* Text content */}
    <div className="text-center max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">
        Về dự án TripMate
      </h2>

      <p className="text-gray-600 mb-4">
        TripMate được phát triển nhằm giải quyết vấn đề phổ biến trong
        các chuyến du lịch nhóm: quản lý chi phí và chia tiền.
      </p>

      <p className="text-gray-600 mb-6">
        Ứng dụng cho phép người dùng ghi lại chi tiêu, tự động chia tiền
        giữa các thành viên và cung cấp báo cáo rõ ràng.
      </p>

      <ul className="space-y-2 text-gray-600 text-left inline-block">
        <li>✔ Giao diện thân thiện, dễ sử dụng</li>
        <li>✔ Cập nhật thời gian thực</li>
        <li>✔ Hỗ trợ nhiều người dùng</li>
        <li>✔ Phù hợp cho du lịch, công tác, nhóm bạn</li>
      </ul>
    </div>

  </Container>
</div>

      {/* CTA */}
      <div className="py-20 text-center">
        <Container>
          <h2 className="text-3xl font-bold mb-4">
            Sẵn sàng cho chuyến đi tiếp theo?
          </h2>
          <p className="text-gray-600 mb-6">
            Bắt đầu sử dụng TripMate để quản lý chi phí dễ dàng hơn bao giờ hết.
          </p>
          <Button>Bắt đầu miễn phí</Button>
        </Container>
      </div>
<div className="bg-gray-100 py-20" id="team">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Đội ngũ & Công nghệ</h2>

            <p className="text-gray-600 mb-6">
              TripMate được phát triển bởi một nhóm sinh viên đam mê công nghệ
              với mục tiêu xây dựng một giải pháp quản lý chi phí du lịch nhóm
              hiện đại, dễ sử dụng và hiệu quả.
            </p>

            {/* Team */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-4">👥 Thành viên nhóm</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Vũ Ngọc Anh Thư</li>
                <li>• Nguyễn Vũ Quang Minh</li>
                <li>• Tạ Quang Thái</li>
                <li>• Thái Kim Long</li>
                <li>• Dương Khả Cơ</li>
              </ul>
            </div>
             <div>
              <h3 className="text-xl font-semibold mb-4">⚙️ Công nghệ sử dụng</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-4 rounded-xl shadow">
                  <strong>Frontend</strong>
                  <p className="text-gray-600">React + TypeScript + TailwindCSS</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow">
                  <strong>Backend</strong>
                  <p className="text-gray-600">Node.js / Express (dự kiến)</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow">
                  <strong>Database</strong>
                  <p className="text-gray-600">Firebase / MongoDB</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
      <div className="bg-white py-20" id="contact">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Liên hệ với chúng tôi</h2>
            <p className="text-gray-600 mb-8">
              Nếu bạn có bất kỳ câu hỏi hoặc muốn hợp tác, đừng ngần ngại liên hệ với nhóm TripMate.
            </p>

            <div className="space-y-4 text-gray-700">
              <p>📧 Email: long.thai1210@hcmut.edu.vn</p>
              <p>📞 Phone: 09242 249 938</p>
              <p>🌐 GitHub: https://github.com/your-repo</p>
            </div>

            <div className="mt-8">
              <Button>Gửi liên hệ</Button>
            </div>
          </div>
        </Container>
      </div>
      {/* Footer */}
      <div className="bg-gray-900 text-white py-10" id="contact">
        <Container>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">TripMate</h3>
            <p className="text-gray-400 mb-4">
              Travel Smart, Spend Wisely
            </p>
            <p className="text-gray-500 text-sm">
              © 2026 TripMate. All rights reserved.
            </p>
          </div>
        </Container>
      </div>
    </div>
  );
}