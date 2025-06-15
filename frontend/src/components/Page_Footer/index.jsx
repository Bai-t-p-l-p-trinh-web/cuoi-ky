import { Link } from "react-router-dom";
import "./scss/Page_Footer.scss";
import { FaFacebookF, FaTiktok, FaYoutube, FaLinkedin } from "react-icons/fa";
function PageFooter() {
  return (
    <>
      <footer className="footer">
        <div className="footer__contact">
          <div className="footer__contact__contain">
            <img
              className="footer__contact__contain-image"
              src={import.meta.env.VITE_LOGO_URL}
              alt="logo"
            />
          </div>
          <div className="footer__contact__description">
            FakeAuto - nền tảng hàng đầu trong lĩnh vực xe cũ tại Việt Nam. Cam
            kết mang đến cho khách hàng trải nghiệm hoàn toàn minh bạch, nhanh
            chóng và đáng tin cậy.
          </div>
          <ul className="footer__contact__list">
            <li className="footer__contact__list-item">
              <Link to="https://www.facebook.com/">
                <FaFacebookF />
              </Link>
            </li>
            <li className="footer__contact__list-item">
              <Link to="https://www.tiktok.com/">
                <FaTiktok />
              </Link>
            </li>
            <li className="footer__contact__list-item">
              <Link to="https://www.youtube.com/">
                <FaYoutube />
              </Link>
            </li>
            <li className="footer__contact__list-item">
              <Link to="https://www.linkedin.com/">
                <FaLinkedin />
              </Link>
            </li>
          </ul>
        </div>
        <div className="footer__about">
          <h3 className="footer__about-title">Đăng ký nhận bản tin</h3>
          <p className="footer__about-description">
            Nhận bản tin để không bỏ lỡ thông tin và khuyến mãi của FakeAuto
          </p>
          <form className="footer__about__email" method="POST">
            <input
              className="footer__about__email--input"
              type="email"
              name="email"
              placeholder="Nhập vào email của bạn"
            />
            <button className="footer__about__email--submit" type="submit">
              Gửi
            </button>
          </form>
          <ul className="footer__about__services">
            <li className="footer__about__services--service">
              <ul className="footer__about__services--service__list">
                <li className="footer__about__services--service__list--item--head">
                  <Link
                    className="footer__about__services--service__list--item--head-link"
                    to="/"
                  >
                    Dịch vụ
                  </Link>
                </li>
                <li className="footer__about__services--service__list--item">
                  <Link
                    className="footer__about__services--service__list--item-link"
                    to="/"
                  >
                    Mua xe ô tô
                  </Link>
                </li>
                <li className="footer__about__services--service__list--item">
                  <Link
                    className="footer__about__services--service__list--item-link"
                    to="/"
                  >
                    Bán xe ô tô
                  </Link>
                </li>
                <li className="footer__about__services--service__list--item">
                  <Link
                    className="footer__about__services--service__list--item-link"
                    to="/"
                  >
                    Trở thành cộng tác viên
                  </Link>
                </li>
                <li className="footer__about__services--service__list--item">
                  <Link
                    className="footer__about__services--service__list--item-link"
                    to="/"
                  >
                    Báo giá cửa hàng
                  </Link>
                </li>
              </ul>
            </li>
            <li className="footer__about__services--service">
              <ul className="footer__about__services--service__list">
                <li className="footer__about__services--service__list--item--head">
                  <Link
                    className="footer__about__services--service__list--item--head-link"
                    to="/"
                  >
                    Hỗ trợ
                  </Link>
                </li>
                <li className="footer__about__services--service__list--item">
                  <Link
                    className="footer__about__services--service__list--item-link"
                    to="/"
                  >
                    Mua bảo hiểm ô tô
                  </Link>
                </li>
                <li className="footer__about__services--service__list--item">
                  <Link
                    className="footer__about__services--service__list--item-link"
                    to="/"
                  >
                    Trả góp mua xe
                  </Link>
                </li>
                <li className="footer__about__services--service__list--item">
                  <Link
                    className="footer__about__services--service__list--item-link"
                    to="/"
                  >
                    Câu hỏi thường gặp
                  </Link>
                </li>
                <li className="footer__about__services--service__list--item">
                  <Link
                    className="footer__about__services--service__list--item-link"
                    to="/"
                  >
                    Liên hệ
                  </Link>
                </li>
              </ul>
            </li>
            <li className="footer__about__services--service">
              <ul className="footer__about__services--service__list">
                <li className="footer__about__services--service__list--item--head">
                  <Link
                    className="footer__about__services--service__list--item--head-link"
                    to="/"
                  >
                    Về FakeAuto
                  </Link>
                </li>
                <li className="footer__about__services--service__list--item">
                  <Link
                    className="footer__about__services--service__list--item-link"
                    to="/"
                  >
                    Giới thiệu công ty
                  </Link>
                </li>
                <li className="footer__about__services--service__list--item">
                  <Link
                    className="footer__about__services--service__list--item-link"
                    to="/"
                  >
                    Tin tức
                  </Link>
                </li>
                <li className="footer__about__services--service__list--item">
                  <Link
                    className="footer__about__services--service__list--item-link"
                    to="/"
                  >
                    Chính sách quyền riêng tư
                  </Link>
                </li>
                <li className="footer__about__services--service__list--item">
                  <Link
                    className="footer__about__services--service__list--item-link"
                    to="/"
                  >
                    Điều khoản sử dụng
                  </Link>
                </li>
                <li className="footer__about__services--service__list--item">
                  <Link
                    className="footer__about__services--service__list--item-link"
                    to="/"
                  >
                    Cơ hội việc làm
                  </Link>
                </li>
                <li className="footer__about__services--service__list--item">
                  <Link
                    className="footer__about__services--service__list--item-link"
                    to="/"
                  >
                    Chứng nhận FakeAuto
                  </Link>
                </li>
              </ul>
            </li>
            <li className="footer__about__services--service">
              <ul className="footer__about__services--service__list">
                <li className="footer__about__services--service__list--item--head">
                  <Link
                    className="footer__about__services--service__list--item--head-link"
                    to="/"
                  >
                    Công ty thành viên
                  </Link>
                </li>
                <li className="footer__about__services--service__list--item">
                  <Link
                    className="footer__about__services--service__list--item-link"
                    to="/"
                  >
                    OtoS - Trang đăng bán xe uy tín tại Việt Nam
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </footer>
    </>
  );
}
export default PageFooter;
