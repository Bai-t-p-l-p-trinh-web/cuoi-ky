import React, { useState } from "react";
import "./scss/FooterPages.scss";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaFacebookF,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa";
import { toast } from "react-toastify";

function LienHe() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    toast.success(
      "Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi trong vòng 24h."
    );
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="footer-page">
      <div className="container">
        <div className="footer-page__header">
          <h1 className="footer-page__title">Liên Hệ Với FakeAuto</h1>
          <p className="footer-page__subtitle">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
          </p>
        </div>

        <div className="footer-page__content">
          <div className="contact-layout">
            {/* Contact Information */}
            <div className="contact-info-section">
              <h2>Thông Tin Liên Hệ</h2>

              <div className="contact-card">
                <div className="contact-item">
                  <FaPhone className="contact-icon" />
                  <div className="contact-details">
                    <h4>Hotline</h4>
                    <p>1900 6969</p>
                    <small>Miễn phí từ 7:00 - 22:00</small>
                  </div>
                </div>
                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <div className="contact-details">
                    <h4>Email</h4>
                    <p>support@fakeauto.vn</p>
                    <small>Phản hồi trong 24h</small>
                  </div>
                </div>{" "}
                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <div className="contact-details">
                    <h4>Địa chỉ</h4>
                    <p>97 Man Thiện, Hiệp Phú</p>
                    <p>Thủ Đức, TP. Hồ Chí Minh</p>
                  </div>
                </div>
                <div className="contact-item">
                  <FaClock className="contact-icon" />
                  <div className="contact-details">
                    <h4>Giờ làm việc</h4>
                    <p>Thứ 2 - Thứ 7: 8:00 - 18:00</p>
                    <p>Chủ nhật: 9:00 - 17:00</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="social-section">
                <h3>Kết Nối Với Chúng Tôi</h3>
                <div className="social-links">
                  <a
                    href="https://facebook.com/fakeauto"
                    className="social-link facebook"
                  >
                    <FaFacebookF />
                    <span>Facebook</span>
                  </a>
                  <a
                    href="https://youtube.com/fakeauto"
                    className="social-link youtube"
                  >
                    <FaYoutube />
                    <span>YouTube</span>
                  </a>
                  <a
                    href="https://tiktok.com/@fakeauto"
                    className="social-link tiktok"
                  >
                    <FaTiktok />
                    <span>TikTok</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-section">
              <h2>Gửi Tin Nhắn</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Họ và tên *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Nhập địa chỉ email"
                  />
                </div>

                <div className="form-group">
                  <label>Chủ đề *</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Chọn chủ đề</option>
                    <option value="support">Hỗ trợ kỹ thuật</option>
                    <option value="buying">Tư vấn mua xe</option>
                    <option value="selling">Hỗ trợ bán xe</option>
                    <option value="complaint">Khiếu nại</option>
                    <option value="partnership">Hợp tác kinh doanh</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Nội dung *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    placeholder="Mô tả chi tiết vấn đề hoặc yêu cầu của bạn"
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  Gửi Tin Nhắn
                </button>
              </form>
            </div>
          </div>

          {/* Map Section */}
          <section className="map-section">
            <h2>Vị Trí Văn Phòng</h2>{" "}
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.5348863169875!2d106.78446747477519!3d10.847987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752772b245dff1%3A0xb838977f3d419d!2zSOG7jWMgdmnhu4duIEPDtG5nIG5naMG7hyBCxrB1IENow61uaCBWaeG7hW4gVGjDtG5nIGPGsSBz4bufIHThuqFpIFRQLkhDTQ!5e0!3m2!1svi!2s!4v1671123456789!5m2!1svi!2s"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="FakeAuto Office - Học viện Công nghệ Bưu Chính Viễn Thông TP.HCM"
              ></iframe>
            </div>
          </section>

          {/* Quick Support */}
          <section className="footer-page__section">
            <h2>Hỗ Trợ Nhanh</h2>
            <div className="quick-support">
              <div className="support-card">
                <h4>🚗 Tư vấn mua xe</h4>
                <p>Chuyên viên sẽ gọi lại trong 5 phút</p>
                <button className="support-btn">Yêu cầu tư vấn</button>
              </div>
              <div className="support-card">
                <h4>💰 Thẩm định giá xe</h4>
                <p>Báo giá miễn phí qua điện thoại</p>
                <button className="support-btn">Thẩm định ngay</button>
              </div>
              <div className="support-card">
                <h4>📋 Hỗ trợ đăng tin</h4>
                <p>Hướng dẫn đăng tin hiệu quả</p>
                <button className="support-btn">Liên hệ hỗ trợ</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default LienHe;
