import React, { useState } from "react";
import "./scss/FooterPages.scss";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

function CauHoiThuongGap() {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqData = [
    {
      question: "Làm thế nào để đăng tin bán xe trên FakeAuto?",
      answer:
        "Bạn cần tạo tài khoản, sau đó chọn 'Đăng tin bán xe', điền đầy đủ thông tin về xe và upload hình ảnh. Tin đăng sẽ được duyệt trong vòng 24h.",
    },
    {
      question: "Chi phí đăng tin bán xe là bao nhiều?",
      answer:
        "Gói cơ bản miễn phí trong 30 ngày. Gói VIP từ 200.000đ với nhiều tính năng nổi bật như ưu tiên hiển thị, badge VIP, và hỗ trợ marketing.",
    },
    {
      question: "Tôi có thể tin tưởng vào chất lượng xe được đăng không?",
      answer:
        "FakeAuto có dịch vụ thẩm định xe với đội ngũ chuyên gia. Xe có chứng nhận 'FakeAuto Certified' đã được kiểm tra kỹ về động cơ, gầm bệ, nội thất và giấy tờ.",
    },
    {
      question: "Làm sao để liên hệ với người bán?",
      answer:
        "Bạn có thể gọi điện trực tiếp, gửi tin nhắn qua hệ thống chat của FakeAuto, hoặc đặt lịch xem xe online.",
    },
    {
      question: "FakeAuto có hỗ trợ vay mua xe không?",
      answer:
        "Có, chúng tôi hợp tác với nhiều ngân hàng và công ty tài chính để cung cấp gói vay ưu đãi với lãi suất từ 6.9%/năm, vay lên đến 80% giá trị xe.",
    },
    {
      question: "Tôi có thể trade-in xe cũ lấy xe mới không?",
      answer:
        "Có, FakeAuto hỗ trợ dịch vụ trade-in với mạng lưới đại lý chính hãng. Chúng tôi sẽ định giá xe cũ và hỗ trợ thủ tục đổi xe mới.",
    },
    {
      question: "Xe trên FakeAuto có được bảo hành không?",
      answer:
        "Xe có chứng nhận FakeAuto Certified được bảo hành 6 tháng hoặc 10.000km. Các xe khác tùy thuộc vào thỏa thuận với người bán.",
    },
    {
      question: "Làm thế nào để kiểm tra lịch sử xe?",
      answer:
        "Bạn có thể yêu cầu báo cáo lịch sử xe từ FakeAuto, bao gồm: lịch sử tai nạn, bảo dưỡng, số chủ sở hữu trước đó và tình trạng pháp lý.",
    },
    {
      question: "Tôi có thể hủy giao dịch sau khi đã đặt cọc không?",
      answer:
        "Tùy vào thỏa thuận với người bán. Thông thường, nếu hủy do lỗi của người mua, tiền cọc có thể bị mất. FakeAuto khuyến khích ký hợp đồng rõ ràng.",
    },
    {
      question: "FakeAuto có hỗ trợ mua bảo hiểm xe không?",
      answer:
        "Có, chúng tôi hợp tác với các công ty bảo hiểm uy tín để cung cấp bảo hiểm xe với giá ưu đãi và quy trình nhanh chóng.",
    },
    {
      question: "Làm sao để báo cáo tin đăng lừa đảo?",
      answer:
        "Bạn có thể click vào nút 'Báo cáo' trên tin đăng hoặc liên hệ hotline 1900 6969. Chúng tôi sẽ xử lý trong vòng 2h làm việc.",
    },
    {
      question: "Tôi có thể bán xe máy trên FakeAuto không?",
      answer:
        "Hiện tại FakeAuto chỉ chuyên về ô tô 4 bánh trở lên. Chúng tôi có kế hoạch mở rộng sang xe máy trong tương lai.",
    },
  ];

  return (
    <div className="footer-page">
      <div className="container">
        <div className="footer-page__header">
          <h1 className="footer-page__title">Câu Hỏi Thường Gặp</h1>
          <p className="footer-page__subtitle">
            Tìm hiểu những thắc mắc phổ biến về dịch vụ FakeAuto
          </p>
        </div>

        <div className="footer-page__content">
          <div className="faq-container">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${openFAQ === index ? "active" : ""}`}
              >
                <div className="faq-question" onClick={() => toggleFAQ(index)}>
                  <h3>{faq.question}</h3>
                  {openFAQ === index ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {openFAQ === index && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <section className="footer-page__section">
            <h2>Vẫn Chưa Tìm Được Câu Trả Lời?</h2>
            <p>
              Nếu bạn có thắc mắc khác không có trong danh sách trên, đừng ngần
              ngại liên hệ với chúng tôi:
            </p>
            <div className="contact-info">
              <div className="contact-item">
                <strong>Hotline:</strong> 1900 6969 (7:00 - 22:00)
              </div>
              <div className="contact-item">
                <strong>Email:</strong> support@fakeauto.vn
              </div>
              <div className="contact-item">
                <strong>Chat online:</strong> Góc phải màn hình
              </div>
              <div className="contact-item">
                <strong>Fanpage:</strong> fb.com/FakeAutoVietnam
              </div>
            </div>
          </section>

          <section className="footer-page__section">
            <h2>Hướng Dẫn Sử Dụng</h2>
            <div className="guide-links">
              <a href="/huong-dan-ban-xe" className="guide-link">
                📖 Hướng dẫn bán xe
              </a>
              <a href="/huong-dan-mua-xe" className="guide-link">
                🚗 Hướng dẫn mua xe
              </a>
              <a href="/huong-dan-tham-dinh" className="guide-link">
                🔍 Hướng dẫn thẩm định
              </a>
              <a href="/huong-dan-vay-von" className="guide-link">
                💰 Hướng dẫn vay vốn
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default CauHoiThuongGap;
