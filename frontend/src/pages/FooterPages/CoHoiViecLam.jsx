import React, { useState } from "react";
import "./scss/FooterPages.scss";
import {
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaUsers,
  FaGraduationCap,
  FaStar,
} from "react-icons/fa";

function CoHoiViecLam() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const jobCategories = [
    { id: "all", name: "Tất cả vị trí" },
    { id: "tech", name: "Công nghệ" },
    { id: "sales", name: "Kinh doanh" },
    { id: "marketing", name: "Marketing" },
    { id: "support", name: "Hỗ trợ khách hàng" },
    { id: "admin", name: "Hành chính" },
  ];

  const jobList = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      category: "tech",
      location: "TP.HCM",
      type: "Full-time",
      salary: "25-35 triệu",
      experience: "3+ năm",
      urgent: true,
      description:
        "Phát triển giao diện website và ứng dụng di động cho nền tảng FakeAuto với React, Vue.js",
    },
    {
      id: 2,
      title: "Sales Executive - Ô tô",
      category: "sales",
      location: "TP.HCM, Hà Nội",
      type: "Full-time",
      salary: "15-25 triệu + Hoa hồng",
      experience: "2+ năm",
      urgent: false,
      description:
        "Tư vấn khách hàng mua bán xe, đạt target doanh số, phát triển thị trường mới",
    },
    {
      id: 3,
      title: "Digital Marketing Specialist",
      category: "marketing",
      location: "TP.HCM",
      type: "Full-time",
      salary: "18-28 triệu",
      experience: "2+ năm",
      urgent: true,
      description:
        "Lập kế hoạch marketing online, quản lý quảng cáo Facebook, Google Ads, SEO/SEM",
    },
    {
      id: 4,
      title: "Customer Success Manager",
      category: "support",
      location: "Remote",
      type: "Full-time",
      salary: "20-30 triệu",
      experience: "3+ năm",
      urgent: false,
      description:
        "Chăm sóc khách hàng VIP, giải quyết khiếu nại, đảm bảo trải nghiệm tốt nhất",
    },
    {
      id: 5,
      title: "Backend Developer (Node.js)",
      category: "tech",
      location: "TP.HCM",
      type: "Full-time",
      salary: "22-32 triệu",
      experience: "2+ năm",
      urgent: false,
      description:
        "Phát triển API, database, hệ thống backend cho ứng dụng FakeAuto",
    },
    {
      id: 6,
      title: "Content Creator",
      category: "marketing",
      location: "TP.HCM",
      type: "Part-time",
      salary: "12-18 triệu",
      experience: "1+ năm",
      urgent: false,
      description: "Sáng tạo nội dung video, blog, social media về ngành ô tô",
    },
    {
      id: 7,
      title: "HR Business Partner",
      category: "admin",
      location: "TP.HCM",
      type: "Full-time",
      salary: "25-35 triệu",
      experience: "5+ năm",
      urgent: true,
      description:
        "Phát triển chiến lược nhân sự, tuyển dụng, đào tạo và phát triển nhân viên",
    },
    {
      id: 8,
      title: "Mobile App Developer (React Native)",
      category: "tech",
      location: "TP.HCM",
      type: "Full-time",
      salary: "20-30 triệu",
      experience: "2+ năm",
      urgent: false,
      description: "Phát triển ứng dụng di động FakeAuto cho iOS và Android",
    },
  ];

  const filteredJobs =
    selectedCategory === "all"
      ? jobList
      : jobList.filter((job) => job.category === selectedCategory);

  const benefits = [
    "💰 Lương thưởng cạnh tranh, xét tăng lương 6 tháng/lần",
    "🏥 Bảo hiểm sức khỏe cao cấp cho nhân viên và gia đình",
    "🎯 Thưởng KPI hàng quý, thưởng cuối năm",
    "📚 Đào tạo và phát triển nghề nghiệp liên tục",
    "🏖️ 15 ngày phép/năm + các ngày lễ tết",
    "🍕 Team building, company trip hàng năm",
    "🚗 Hỗ trợ mua xe với lãi suất ưu đãi",
    "💻 Trang bị đầy đủ thiết bị làm việc hiện đại",
  ];

  return (
    <div className="footer-page">
      <div className="container">
        <div className="footer-page__header">
          <h1 className="footer-page__title">Cơ Hội Việc Làm Tại FakeAuto</h1>
          <p className="footer-page__subtitle">
            Gia nhập đội ngũ FakeAuto và xây dựng tương lai cùng chúng tôi
          </p>
        </div>

        <div className="footer-page__content">
          {/* Company Overview */}
          <section className="company-overview">
            <h2>Tại Sao Chọn FakeAuto?</h2>
            <div className="overview-grid">
              <div className="overview-card">
                <FaUsers className="overview-icon" />
                <h4>Môi trường năng động</h4>
                <p>Team trẻ, sáng tạo, không ngừng học hỏi và phát triển</p>
              </div>
              <div className="overview-card">
                <FaStar className="overview-icon" />
                <h4>Công ty hàng đầu</h4>
                <p>Leader trong lĩnh vực mua bán xe trực tuyến tại Việt Nam</p>
              </div>
              <div className="overview-card">
                <FaGraduationCap className="overview-icon" />
                <h4>Phát triển bản thân</h4>
                <p>
                  Cơ hội học hỏi, thăng tiến và phát triển nghề nghiệp rõ ràng
                </p>
              </div>
            </div>
          </section>

          {/* Job Filter */}
          <section className="job-filter-section">
            <h2>Vị Trí Đang Tuyển</h2>
            <div className="job-categories">
              {jobCategories.map((category) => (
                <button
                  key={category.id}
                  className={`category-btn ${
                    selectedCategory === category.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </section>

          {/* Job Listings */}
          <section className="job-listings">
            <div className="job-grid">
              {filteredJobs.map((job) => (
                <div key={job.id} className="job-card">
                  {job.urgent && (
                    <span className="urgent-badge">🔥 Tuyển gấp</span>
                  )}
                  <h3 className="job-title">{job.title}</h3>
                  <p className="job-description">{job.description}</p>

                  <div className="job-details">
                    <div className="job-detail">
                      <FaMapMarkerAlt />
                      <span>{job.location}</span>
                    </div>
                    <div className="job-detail">
                      <FaClock />
                      <span>{job.type}</span>
                    </div>
                    <div className="job-detail">
                      <FaDollarSign />
                      <span>{job.salary}</span>
                    </div>
                    <div className="job-detail">
                      <FaGraduationCap />
                      <span>Kinh nghiệm: {job.experience}</span>
                    </div>
                  </div>

                  <button className="apply-btn">Ứng tuyển ngay</button>
                </div>
              ))}
            </div>
          </section>

          {/* Benefits */}
          <section className="benefits-section">
            <h2>Quyền Lợi & Phúc Lợi</h2>
            <div className="benefits-grid">
              {benefits.map((benefit, index) => (
                <div key={index} className="benefit-item">
                  {benefit}
                </div>
              ))}
            </div>
          </section>

          {/* Application Process */}
          <section className="application-process">
            <h2>Quy Trình Tuyển Dụng</h2>
            <div className="process-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Nộp hồ sơ</h4>
                  <p>Gửi CV qua email hoặc ứng tuyển trực tuyến</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Phỏng vấn HR</h4>
                  <p>Phỏng vấn với phòng nhân sự (30 phút)</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Test kỹ năng</h4>
                  <p>Làm bài test chuyên môn theo vị trí</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Phỏng vấn chuyên môn</h4>
                  <p>Phỏng vấn với team leader (45 phút)</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h4>Thông báo kết quả</h4>
                  <p>Nhận offer và thảo luận package</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact HR */}
          <section className="hr-contact">
            <h2>Liên Hệ Phòng Nhân Sự</h2>
            <div className="hr-info">
              <div className="hr-card">
                <h4>📧 Email tuyển dụng</h4>
                <p>careers@fakeauto.vn</p>
                <small>Phản hồi trong 3 ngày làm việc</small>
              </div>
              <div className="hr-card">
                <h4>📞 Hotline HR</h4>
                <p>028 1234 5678</p>
                <small>8:30 - 17:30 (Thứ 2 - Thứ 6)</small>
              </div>
              <div className="hr-card">
                <h4>📍 Địa chỉ</h4>
                <p>123 Đường ABC, Q.1, TP.HCM</p>
                <small>Tầng 15, Tòa nhà XYZ</small>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="cta-section">
            <div className="cta-content">
              <h2>Sẵn Sàng Gia Nhập FakeAuto?</h2>
              <p>
                Chúng tôi luôn chào đón những tài năng xuất sắc. Nếu bạn đam mê
                công nghệ và ngành ô tô, hãy gia nhập đội ngũ FakeAuto ngay hôm
                nay!
              </p>
              <div className="cta-buttons">
                <button className="cta-btn primary">Gửi CV tự do</button>
                <button className="cta-btn secondary">
                  Tải job description
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default CoHoiViecLam;
