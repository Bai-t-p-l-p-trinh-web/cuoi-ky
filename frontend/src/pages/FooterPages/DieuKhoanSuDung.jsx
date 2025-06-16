import React from "react";
import "./scss/FooterPages.scss";

function DieuKhoanSuDung() {
  return (
    <div className="footer-page">
      <div className="container">
        <div className="footer-page__header">
          <h1 className="footer-page__title">Điều Khoản Sử Dụng</h1>
          <p className="footer-page__subtitle">
            Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
          </p>
        </div>

        <div className="footer-page__content">
          <section className="footer-page__section">
            <h2>1. Chấp Nhận Điều Khoản</h2>
            <p>
              Bằng việc truy cập và sử dụng website FakeAuto, bạn đồng ý tuân
              thủ và bị ràng buộc bởi các điều khoản và điều kiện sử dụng được
              quy định trong tài liệu này. Nếu bạn không đồng ý với bất kỳ phần
              nào của các điều khoản này, vui lòng không sử dụng dịch vụ của
              chúng tôi.
            </p>
          </section>

          <section className="footer-page__section">
            <h2>2. Mô Tả Dịch Vụ</h2>
            <p>FakeAuto là nền tảng trực tuyến cung cấp dịch vụ:</p>
            <ul>
              <li>Đăng tin mua bán xe ô tô</li>
              <li>Kết nối người mua và người bán</li>
              <li>Thẩm định và kiểm tra chất lượng xe</li>
              <li>Hỗ trợ thủ tục pháp lý</li>
              <li>Dịch vụ bảo hiểm và tài chính</li>
            </ul>
          </section>

          <section className="footer-page__section">
            <h2>3. Quyền và Nghĩa Vụ Của Người Dùng</h2>

            <h3>3.1 Quyền của người dùng:</h3>
            <ul>
              <li>Sử dụng miễn phí các dịch vụ cơ bản của FakeAuto</li>
              <li>Đăng tin bán xe theo quy định</li>
              <li>Tìm kiếm và liên hệ mua xe</li>
              <li>Được hỗ trợ kỹ thuật khi gặp vấn đề</li>
            </ul>

            <h3>3.2 Nghĩa vụ của người dùng:</h3>
            <ul>
              <li>Cung cấp thông tin chính xác, trung thực</li>
              <li>Không đăng nội dung vi phạm pháp luật</li>
              <li>Tuân thủ các quy định về giao dịch</li>
              <li>Chịu trách nhiệm về tính pháp lý của xe được đăng bán</li>
            </ul>
          </section>

          <section className="footer-page__section">
            <h2>4. Quy Định Về Nội Dung</h2>
            <p>Người dùng cam kết không đăng tải:</p>
            <ul>
              <li>Thông tin sai lệch về xe (giá cả, tình trạng, giấy tờ)</li>
              <li>Hình ảnh không phù hợp hoặc vi phạm bản quyền</li>
              <li>Nội dung spam, quảng cáo không liên quan</li>
              <li>Thông tin về xe có nguồn gốc không rõ ràng</li>
            </ul>
          </section>

          <section className="footer-page__section">
            <h2>5. Chính Sách Thanh Toán</h2>
            <p>
              FakeAuto không trực tiếp tham gia vào việc thanh toán giữa người
              mua và người bán. Mọi giao dịch tài chính diễn ra giữa các bên
              liên quan. Đối với các dịch vụ có phí, chúng tôi chấp nhận thanh
              toán qua:
            </p>
            <ul>
              <li>Chuyển khoản ngân hàng</li>
              <li>Ví điện tử (MoMo, ZaloPay, VNPay)</li>
              <li>Thẻ tín dụng/ghi nợ</li>
            </ul>
          </section>

          <section className="footer-page__section">
            <h2>6. Giới Hạn Trách Nhiệm</h2>
            <p>
              FakeAuto chỉ đóng vai trò là nền tảng kết nối và không chịu trách
              nhiệm về:
            </p>
            <ul>
              <li>Chất lượng thực tế của xe được quảng cáo</li>
              <li>Tranh chấp phát sinh giữa người mua và người bán</li>
              <li>Thiệt hại gián tiếp hoặc hậu quả từ việc sử dụng dịch vụ</li>
              <li>Gián đoạn dịch vụ do sự cố kỹ thuật</li>
            </ul>
          </section>

          <section className="footer-page__section">
            <h2>7. Bảo Mật Thông Tin</h2>
            <p>
              Chúng tôi cam kết bảo vệ thông tin cá nhân của người dùng theo
              Chính Sách Bảo Mật. Thông tin sẽ không được chia sẻ với bên thứ ba
              mà không có sự đồng ý, trừ trường hợp pháp luật yêu cầu.
            </p>
          </section>

          <section className="footer-page__section">
            <h2>8. Chấm Dứt Dịch Vụ</h2>
            <p>
              FakeAuto có quyền tạm ngừng hoặc chấm dứt tài khoản của người dùng
              nếu phát hiện vi phạm điều khoản sử dụng mà không cần báo trước.
            </p>
          </section>

          <section className="footer-page__section">
            <h2>9. Thay Đổi Điều Khoản</h2>
            <p>
              FakeAuto có quyền cập nhật và thay đổi các điều khoản này bất kỳ
              lúc nào. Phiên bản mới sẽ có hiệu lực khi được đăng tải trên
              website.
            </p>
          </section>

          <section className="footer-page__section">
            <h2>10. Thông Tin Liên Hệ</h2>
            <p>Nếu có thắc mắc về điều khoản sử dụng, vui lòng liên hệ:</p>
            <ul>
              <li>Email: support@fakeauto.vn</li>
              <li>Hotline: 1900 6969</li>
              <li>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default DieuKhoanSuDung;
