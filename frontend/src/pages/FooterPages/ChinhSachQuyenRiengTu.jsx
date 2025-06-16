import React from "react";
import "./scss/FooterPages.scss";

function ChinhSachQuyenRiengTu() {
  return (
    <div className="footer-page">
      <div className="container">
        <div className="footer-page__header">
          <h1 className="footer-page__title">Chính Sách Quyền Riêng Tư</h1>
          <p className="footer-page__subtitle">
            Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
          </p>
        </div>

        <div className="footer-page__content">
          <section className="footer-page__section">
            <h2>1. Giới Thiệu</h2>
            <p>
              FakeAuto cam kết bảo vệ quyền riêng tư và thông tin cá nhân của
              bạn. Chính sách này mô tả cách chúng tôi thu thập, sử dụng, lưu
              trữ và bảo vệ thông tin cá nhân của bạn khi sử dụng dịch vụ.
            </p>
          </section>

          <section className="footer-page__section">
            <h2>2. Thông Tin Chúng Tôi Thu Thập</h2>

            <h3>2.1 Thông tin bạn cung cấp:</h3>
            <ul>
              <li>Họ tên, số điện thoại, email</li>
              <li>Địa chỉ và thông tin liên hệ</li>
              <li>Thông tin về xe bạn muốn bán/mua</li>
              <li>Ảnh và tài liệu liên quan đến xe</li>
            </ul>

            <h3>2.2 Thông tin tự động thu thập:</h3>
            <ul>
              <li>Địa chỉ IP và thông tin thiết bị</li>
              <li>Lịch sử duyệt web và cookies</li>
              <li>Thông tin về cách bạn sử dụng website</li>
              <li>Vị trí địa lý (nếu được cho phép)</li>
            </ul>
          </section>

          <section className="footer-page__section">
            <h2>3. Mục Đích Sử Dụng Thông Tin</h2>
            <p>Chúng tôi sử dụng thông tin của bạn để:</p>
            <ul>
              <li>Cung cấp và cải thiện dịch vụ</li>
              <li>Xử lý giao dịch và yêu cầu hỗ trợ</li>
              <li>Gửi thông báo về dịch vụ và khuyến mãi</li>
              <li>Phòng chống gian lận và spam</li>
              <li>Tuân thủ các yêu cầu pháp lý</li>
              <li>Phân tích và cải thiện trải nghiệm người dùng</li>
            </ul>
          </section>

          <section className="footer-page__section">
            <h2>4. Chia Sẻ Thông Tin</h2>
            <p>
              Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của
              bạn với bên thứ ba, trừ các trường hợp sau:
            </p>
            <ul>
              <li>Khi có sự đồng ý rõ ràng từ bạn</li>
              <li>Với đối tác dịch vụ cần thiết (thanh toán, vận chuyển)</li>
              <li>Khi pháp luật yêu cầu</li>
              <li>Để bảo vệ quyền lợi và an toàn của FakeAuto</li>
            </ul>
          </section>

          <section className="footer-page__section">
            <h2>5. Bảo Mật Thông Tin</h2>
            <p>Chúng tôi áp dụng các biện pháp bảo mật:</p>
            <ul>
              <li>Mã hóa SSL cho mọi giao dịch</li>
              <li>Firewall và hệ thống chống xâm nhập</li>
              <li>Kiểm soát truy cập nghiêm ngặt</li>
              <li>Sao lưu dữ liệu định kỳ</li>
              <li>Đào tạo nhân viên về bảo mật</li>
            </ul>
          </section>

          <section className="footer-page__section">
            <h2>6. Cookies và Công Nghệ Theo Dõi</h2>
            <p>Chúng tôi sử dụng cookies để:</p>
            <ul>
              <li>Ghi nhớ thông tin đăng nhập</li>
              <li>Cá nhân hóa trải nghiệm người dùng</li>
              <li>Phân tích lưu lượng website</li>
              <li>Cải thiện hiệu suất và bảo mật</li>
            </ul>
            <p>
              Bạn có thể vô hiệu hóa cookies trong trình duyệt, nhưng điều này
              có thể ảnh hưởng đến trải nghiệm sử dụng.
            </p>
          </section>

          <section className="footer-page__section">
            <h2>7. Quyền Của Bạn</h2>
            <p>Bạn có quyền:</p>
            <ul>
              <li>Truy cập và xem thông tin cá nhân được lưu trữ</li>
              <li>Yêu cầu chỉnh sửa thông tin không chính xác</li>
              <li>Xóa tài khoản và dữ liệu cá nhân</li>
              <li>Từ chối nhận email marketing</li>
              <li>Khiếu nại về việc xử lý dữ liệu</li>
            </ul>
          </section>

          <section className="footer-page__section">
            <h2>8. Lưu Trữ Dữ Liệu</h2>
            <p>Chúng tôi lưu trữ thông tin cá nhân của bạn:</p>
            <ul>
              <li>Trong thời gian bạn sử dụng dịch vụ</li>
              <li>Theo yêu cầu pháp luật (tối thiểu 5 năm)</li>
              <li>Cho mục đích giải quyết tranh chấp</li>
            </ul>
            <p>
              Sau thời hạn này, dữ liệu sẽ được xóa hoàn toàn khỏi hệ thống.
            </p>
          </section>

          <section className="footer-page__section">
            <h2>9. Chuyển Giao Dữ Liệu Quốc Tế</h2>
            <p>
              Dữ liệu của bạn được lưu trữ tại Việt Nam. Trong trường hợp cần
              chuyển giao quốc tế, chúng tôi sẽ đảm bảo mức độ bảo vệ tương
              đương.
            </p>
          </section>

          <section className="footer-page__section">
            <h2>10. Trẻ Em</h2>
            <p>
              Dịch vụ của chúng tôi không dành cho trẻ em dưới 16 tuổi. Chúng
              tôi không cố ý thu thập thông tin từ trẻ em dưới 16 tuổi.
            </p>
          </section>

          <section className="footer-page__section">
            <h2>11. Thay Đổi Chính Sách</h2>
            <p>
              Chúng tôi có thể cập nhật chính sách này định kỳ. Thông báo về
              thay đổi sẽ được gửi qua email hoặc đăng trên website.
            </p>
          </section>

          <section className="footer-page__section">
            <h2>12. Liên Hệ</h2>
            <p>Nếu có thắc mắc về chính sách quyền riêng tư:</p>
            <ul>
              <li>Email: privacy@fakeauto.vn</li>
              <li>Hotline: 1900 6969</li>
              <li>Địa chỉ: 97 Man Thiện, Hiệp Phú, Thủ Đức, TP. Hồ Chí Minh</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ChinhSachQuyenRiengTu;
