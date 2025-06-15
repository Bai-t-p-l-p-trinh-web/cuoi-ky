import React, { useState } from 'react';
import { CiCircleQuestion } from "react-icons/ci";
import '../scss/Faq.scss';

const faqs = [
  {
    question: "Tôi cần chuẩn bị gì để đăng bán xe ô tô trên website?",
    answer: `
Để đăng bán xe ô tô, bạn cần:
• Tài khoản: Đăng ký hoặc đăng nhập vào tài khoản trên website.
• Nâng lên quyền người bán: Người dùng cần cung cấp thông tin hợp lệ để trở thành người bán.
• Thông tin xe: Cung cấp chi tiết về xe (tên xe, năm mua, số km đã đi, giá, v.v.).
• Hình ảnh: Chúng tôi sẽ cử đại diện người bên phía công ty đến kiểm tra và chụp ảnh giúp bạn.
• Giấy tờ xe: Đảm bảo bạn có giấy tờ hợp lệ (đăng ký xe, bảo hiểm, đăng kiểm, v.v.) để xác minh khi cần.
• Mô tả chi tiết: Viết mô tả rõ ràng về tình trạng xe, lịch sử sử dụng, và lý do bán.
    `
  },
  {
    question: "Đăng bán xe có mất phí không?",
    answer: `
• Hiện tại, việc đăng tin bán xe trên website là miễn phí cho các tin cơ bản.
• Chúng tôi thu phí hoa hồng 0.5% khi xe được bán.
    `
  },
  {
    question: "Làm thế nào để tin đăng của tôi thu hút người mua?",
    answer: `
• Mô tả chi tiết: Cung cấp thông tin về tình trạng xe, số km đã đi, các tính năng nổi bật, và lịch sử bảo dưỡng.
• Giá cả hợp lý: Tham khảo giá thị trường để đặt giá cạnh tranh.
• Phản hồi nhanh: Trả lời câu hỏi của người mua kịp thời để tăng cơ hội giao dịch.
    `
  },
  {
    question: "Tôi có thể chỉnh sửa hoặc xóa tin đăng không?",
    answer: `
• Có, bạn có thể chỉnh sửa hoặc ẩn đi tin đăng bất cứ lúc nào.
• Để chỉnh sửa, vào phần Trang của tôi (nhấn vào avatar góc phải -> Quản lý đăng bán xe).
• Để xóa, chọn "Xóa tin" và xác nhận.
    `
  },
  {
    question: "Làm sao để xác minh xe của tôi là hợp pháp?",
    answer: `
• Khi đăng tin, bạn cần cung cấp thông tin cơ bản về giấy tờ xe (số khung, số máy, đăng ký xe, v.v.).
• Đội ngũ của chúng tôi có thể yêu cầu bạn gửi hình ảnh giấy tờ để xác minh.
• Xe phải có giấy tờ hợp lệ và không vi phạm pháp luật (ví dụ: không phải xe cầm cố, tranh chấp, hoặc bị tịch thu).
    `
  },
  {
    question: "Tôi có thể đăng bán nhiều xe cùng lúc không?",
    answer: `
• Có, bạn có thể đăng bán nhiều xe trong cùng một tài khoản.
• Mỗi xe cần tạo một tin đăng riêng với thông tin và hình ảnh cụ thể.
    `
  },
  {
    question: "Nếu không bán được xe, tôi phải làm gì?",
    answer: `
• Kiểm tra lại giá bán xem có phù hợp với thị trường không.
• Cập nhật mô tả để hấp dẫn hơn.
• Liên hệ đội ngũ hỗ trợ của chúng tôi qua [Liên kết đến trang liên hệ] để được tư vấn.
    `
  },
  {
    question: "Làm thế nào để liên hệ với người mua?",
    answer: `
• Khi có người quan tâm, bạn sẽ nhận được thông báo qua email hoặc trong mục Tin nhắn trên website.
• Bạn có thể trao đổi trực tiếp với người mua qua hệ thống tin nhắn của website hoặc cung cấp email, facebook, zalo, linkedin...
• Lưu ý: Hãy cẩn thận khi chia sẻ thông tin cá nhân và gặp gỡ người mua ở nơi an toàn.
    `
  },
  {
    question: "Website có hỗ trợ kiểm tra xe trước khi mua bán không?",
    answer: `
• Có, bạn tạo yêu cầu hỗ trợ đăng bán xe sẽ có đội ngũ kỹ thuật của chúng tôi đến nhà bạn kiểm tra xe.
    `
  },
  {
    question: "Tôi quên mật khẩu tài khoản, phải làm sao?",
    answer: `
• Truy cập trang Đăng nhập và nhấp vào "Quên mật khẩu".
• Nhập email đăng ký để nhận liên kết đặt lại mật khẩu.
    `
  },
  {
    question: "Đăng ký/Đăng nhập tài khoản",
    answer: `
1. Truy cập website Fake Auto.
2. Nhấp vào Đăng ký để tạo tài khoản mới hoặc Đăng nhập nếu bạn đã có tài khoản (Có thể đăng nhập trực tiếp qua Google và cập nhật lại thông tin sau khi đăng nhập).
3. Điền đầy đủ thông tin cá nhân (email, số điện thoại, v.v.) và xác minh tài khoản nếu được yêu cầu.
    `
  },
  {
    question: "Liên hệ hỗ trợ",
    answer: `
Nếu bạn gặp bất kỳ vấn đề nào khi đăng bán xe, vui lòng liên hệ:
• Email: support@fakeauto.com
• Hotline: 0123 456 789 (8:00 - 17:00, Thứ Hai - Thứ Sáu)
• Chat trực tuyến: Truy cập [Liên kết đến chat] trên website.
    `
  }
];

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq__container">
      <h1 className="faq__title">
        <div className='faq__title__icon__contain'>
          <CiCircleQuestion className='faq__title__icon'/>
        </div>
        <span className="faq__title__span">Câu hỏi thường gặp (FAQ)</span>
      </h1>
      
      <section className="faq__section">
        
        {faqs.map((faq, index) => (
          <div key={index} className="faq__item">
            <button
              className={`faq__question ${activeIndex === index ? 'active' : ''}`}
              onClick={() => toggleAccordion(index)}
            >
              {faq.question}
            </button>
            {activeIndex === index && (
              <pre className="faq__answer">{faq.answer.trim()}</pre>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};

export default Faq;