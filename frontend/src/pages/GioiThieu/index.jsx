import "./scss/GioiThieu.scss";
import { FaChessKing } from "react-icons/fa";
function GioiThieu() {
  return (
    <>
      <div className="gioithieu">
        {/* Gioi thieu 1  */}
        <div className="gioithieu__web">
          <div className="gioithieu__web__title">Giới thiệu về Fake Auto</div>
          <div className="gioithieu__web__horizontal"></div>
          <div className="container">
            <div className="gioithieu__web__description">
              <div className="gioithieu__web__description__div">
                Fake Auto là thương hiệu uy tín, dẫn đầu thị trường về dịch vụ
                rao vặt và truyền thông về ngành ô tô tại Việt Nam. Với hai lợi
                thế cạnh tranh cốt lõi: một là về đội ngũ chuyên môn có kinh
                nghiệm lâu năm; hai là áp dụng công nghệ hiện đại, giúp mang đến
                cho khách hàng một trải nghiệm mua bán xe cũ hoàn toàn khác biệt
                và chuyên nghiệp.
                <br />
                <br />
                Tại Fake Auto, chúng tôi làm việc trực tiếp với người mua và
                người bán, họ có thể là đại lý, công ty hoặc cá nhân. Từ đó cung
                cấp các dịch vụ tối ưu như: mua bán xe, thẩm định, thanh toán
                linh hoạt và nhiều dịch vụ khác để đảm bảo quy trình mua bán xe
                trở nên dễ dàng hơn. Fake Auto đảm bảo rằng mỗi chiếc xe được
                bán ra đã được kiểm tra kỹ lưỡng để đảm bảo chất lượng và tính
                đúng giá trị của nó.
              </div>{" "}
              <div className="gioithieu__web__description__img">
                <img
                  className="gioithieu__web__description__img-img"
                  src={import.meta.env.VITE_LOGO_URL}
                  alt="Fake Auto Logo"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Gioi thieu 2  */}
        <div className="gioithieu__tamnhin">
          <div className="container">
            <h3 className="gioithieu__tamnhin__title">Tầm nhìn</h3>
            <p className="gioithieu__tamnhin__description">
              Trở thành nền tảng hàng đầu trong lĩnh vực xe cũ tại Việt Nam bằng
              việc cho khách hàng trải nghiệm hoàn toàn minh bạch, tin cậy,
              nhanh chóng và thông tin rõ ràng. Chúng tôi cam kết sử dụng công
              nghệ tiên tiến và hiện đại nhất để đảm bảo quá trình mua bán xe cũ
              được diễn ra một cách thuận tiện và đáng tin cậy nhất.
            </p>
            <h3 className="gioithieu__tamnhin__title">Sứ mệnh</h3>
            <p className="gioithieu__tamnhin__description">
              Trở thành lựa chọn tối ưu cho mọi nhu cầu liên quan đến xe ô tô
              tại Việt Nam. Fake Auto cam kết nâng tầm hệ sinh thái ô tô tại
              Việt Nam bằng cách thiết lập các tiêu chuẩn cao và đem lại trải
              nghiệm tuyệt vời cho khách hàng và đối tác của chúng tôi.
            </p>
          </div>
        </div>

        {/* Gioi thieu 3  */}
        <div className="gioithieu__lichsu">
          <h3 className="gioithieu__lichsu__title">
            Lịch sử phát triển của Fake Auto
          </h3>{" "}
          <div className="gioithieu__lichsu__contain">
            <ul className="gioithieu__lichsu__list">
              <li className="gioithieu__lichsu__item">
                <time className="gioithieu__lichsu__item__time" dateTime="2018">
                  2018
                </time>
                <p className="gioithieu__lichsu__item__activity">
                  Fake Auto được thành lập với tầm nhìn trở thành nền tảng mua
                  bán ô tô trực tuyến hàng đầu tại Việt Nam.
                </p>
                <p className="gioithieu__lichsu__item__activity">
                  Ra mắt website đầu tiên với giao diện đơn giản, tập trung vào
                  việc kết nối người mua và người bán xe.
                </p>
                <FaChessKing className="gioithieu__lichsu__item__corner" />
              </li>
              <li className="gioithieu__lichsu__item">
                <time className="gioithieu__lichsu__item__time" dateTime="2019">
                  2019
                </time>
                <p className="gioithieu__lichsu__item__activity">
                  Phát triển hệ thống thẩm định xe chuyên nghiệp với đội ngũ
                  chuyên gia có kinh nghiệm.
                </p>
                <p className="gioithieu__lichsu__item__activity">
                  Đạt mốc 10,000 giao dịch thành công và mở rộng phủ sóng ra 5
                  tỉnh thành lớn.
                </p>
                <FaChessKing className="gioithieu__lichsu__item__corner" />
              </li>
              <li className="gioithieu__lichsu__item">
                <time className="gioithieu__lichsu__item__time" dateTime="2020">
                  2020
                </time>
                <p className="gioithieu__lichsu__item__activity">
                  Ra mắt ứng dụng di động và hệ thống chatbot hỗ trợ khách hàng
                  24/7.
                </p>
                <p className="gioithieu__lichsu__item__activity">
                  Áp dụng công nghệ AI trong việc định giá xe và dự đoán xu
                  hướng thị trường.
                </p>
                <FaChessKing className="gioithieu__lichsu__item__corner" />
              </li>
              <li className="gioithieu__lichsu__item">
                <time className="gioithieu__lichsu__item__time" dateTime="2021">
                  2021
                </time>
                <p className="gioithieu__lichsu__item__activity">
                  Hợp tác với các ngân hàng lớn để cung cấp dịch vụ vay mua xe
                  với lãi suất ưu đãi.
                </p>
                <p className="gioithieu__lichsu__item__activity">
                  Mở rộng dịch vụ bảo hiểm xe và bảo hành cho xe đã qua sử dụng.
                </p>
                <FaChessKing className="gioithieu__lichsu__item__corner" />
              </li>
              <li className="gioithieu__lichsu__item">
                <time className="gioithieu__lichsu__item__time" dateTime="2022">
                  2022
                </time>
                <p className="gioithieu__lichsu__item__activity">
                  Ra mắt chương trình "Fake Auto Certified" - chứng nhận chất
                  lượng xe với tiêu chuẩn quốc tế.
                </p>
                <p className="gioithieu__lichsu__item__activity">
                  Đạt mốc 100,000 xe được đăng bán và phủ sóng toàn quốc với 63
                  tỉnh thành.
                </p>
                <FaChessKing className="gioithieu__lichsu__item__corner" />
              </li>
              <li className="gioithieu__lichsu__item">
                <time className="gioithieu__lichsu__item__time" dateTime="2023">
                  2023
                </time>
                <p className="gioithieu__lichsu__item__activity">
                  Triển khai hệ thống showroom ảo 360° và dịch vụ test drive tại
                  nhà.
                </p>
                <p className="gioithieu__lichsu__item__activity">
                  Nhận giải thưởng "Nền tảng Thương mại Điện tử Xuất sắc nhất"
                  do Hiệp hội Thương mại Điện tử Việt Nam trao tặng.
                </p>
                <FaChessKing className="gioithieu__lichsu__item__corner" />
              </li>
              <li className="gioithieu__lichsu__item">
                <time className="gioithieu__lichsu__item__time" dateTime="2024">
                  2024
                </time>
                <p className="gioithieu__lichsu__item__activity">
                  Hợp tác với các hãng xe lớn để phân phối xe mới và cung cấp
                  dịch vụ trade-in.
                </p>
                <p className="gioithieu__lichsu__item__activity">
                  Phát triển hệ sinh thái hoàn chỉnh bao gồm: mua bán, bảo hiểm,
                  bảo dưỡng và phụ tùng ô tô.
                </p>
                <FaChessKing className="gioithieu__lichsu__item__corner" />
              </li>
              <li className="gioithieu__lichsu__item">
                <time className="gioithieu__lichsu__item__time" dateTime="2025">
                  2025
                </time>
                <p className="gioithieu__lichsu__item__activity">
                  Ra mắt nền tảng mới với công nghệ Blockchain để đảm bảo minh
                  bạch lịch sử xe.
                </p>
                <p className="gioithieu__lichsu__item__activity">
                  Mục tiêu trở thành "Super App" cho mọi nhu cầu liên quan đến ô
                  tô tại Đông Nam Á.
                </p>
                <FaChessKing className="gioithieu__lichsu__item__corner" />
              </li>
            </ul>
          </div>
        </div>

        <div className="gioithieu__banxe">
          <h3 className="gioithieu__banxe__title">
            Mua hoặc bán xe ngay hôm nay
          </h3>
          <p className="gioithieu__banxe__description">
            Cho dù là xe mới hay cũ, Fake Auto luôn có sẵn để bạn lựa chọn chiếc
            xe mà bạn yêu thích
          </p>
          <div className="gioithieu__buttons">
            <div className="gioithieu__buttons__banxe">Bán xe ngay</div>
            <div className="gioithieu__buttons__muaxe">Mua xe ngay</div>
          </div>
        </div>
      </div>
    </>
  );
}
export default GioiThieu;
