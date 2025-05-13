import "./scss/GioiThieu.scss";
import { FaChessKing } from "react-icons/fa";
function GioiThieu(){
    return (
        <>
            <div className="gioithieu">
                {/* Gioi thieu 1  */}
                <div className="gioithieu__web">
                    <div className="gioithieu__web__title">Giới thiệu về Chợ tốt xe</div>
                    <div className="gioithieu__web__horizontal"></div>
                    <div className="container">
                        <div className="gioithieu__web__description">
                            <div className="gioithieu__web__description__div">
                                Chợ tốt xe.vn là thương hiệu uy tín, dẫn đầu thị trường về dịch vụ rao vặt và truyền thông về ngành ô tô tại Việt Nam. 
                                Với hai lợi thế cạnh tranh cốt lõi: một là về đội ngũ chuyên môn có kinh nghiệm lâu năm; hai là áp dụng công nghệ hiện đại, 
                                giúp mang đến cho khách hàng một trải nghiệm mua bán xe cũ hoàn toàn khác biệt và chuyên nghiệp.
                                <br/>
                                <br/>
                                Tại Chợ tốt xe, chúng tôi làm việc trực tiếp với người mua và người bán, 
                                họ có thể là đại lý, công ty hoặc cá nhân. Từ đó cung cấp các dịch vụ tối ưu như: 
                                mua bán xe, thẩm định, thanh toán linh hoạt và nhiều dịch vụ khác để đảm bảo quy trình mua bán xe trở nên dễ dàng hơn. 
                                Chợ tốt xe đảm bảo rằng mỗi chiếc xe được bán ra đã được kiểm tra kỹ lưỡng để đảm bảo chất lượng và tính đúng giá trị của nó.
                            </div>
                            <div className="gioithieu__web__description__img">
                                <img className="gioithieu__web__description__img-img" src="/header__logo.png"/>
                            </div>
                        </div>
                    </div>
                    
                </div>
                
                {/* Gioi thieu 2  */}
                <div className="gioithieu__tamnhin">
                    <div className="container">
                        <h3 className="gioithieu__tamnhin__title">Tầm nhìn</h3>
                        <p className="gioithieu__tamnhin__description">
                        Trở thành nền tảng hàng đầu trong lĩnh vực xe cũ tại Việt Nam
                        bằng việc cho khách hàng trải nghiệm hoàn toàn minh bạch, tin cậy, nhanh chóng và thông tin rõ ràng. 
                        Chúng tôi cam kết sử dụng công nghệ tiên tiến và hiện đại nhất 
                        để đảm bảo quá trình mua bán xe cũ được diễn ra một cách thuận tiện và đáng tin cậy nhất.
                        </p>
                        <h3 className="gioithieu__tamnhin__title">Sứ mệnh</h3>
                        <p className="gioithieu__tamnhin__description">
                        Trở thành lựa chọn tối ưu cho mọi nhu cầu liên quan đến xe ô tô tại Việt Nam. 
                        Chợ tốt xe cam kết nâng tầm hệ sinh thái ô tô tại Việt Nam bằng cách thiết lập các tiêu chuẩn cao 
                        và đem lại trải nghiệm tuyệt vời cho khách hàng và đối tác của chúng tôi.
                        </p>
                    </div>
                    
                </div>

                {/* Gioi thieu 3  */}   
                <div className="gioithieu__lichsu">
                    <h3 className="gioithieu__lichsu__title">
                        Lịch sử phát triển của Chợ tốt xe
                    </h3>
                    <div className="gioithieu__lichsu__contain">
                        <ul className="gioithieu__lichsu__list">
                            <li className="gioithieu__lichsu__item">
                                <time className="gioithieu__lichsu__item__time" dateTime="2014">2014</time>
                                <p className="gioithieu__lichsu__item__activity">Chợ tốt xe.vn – một trong những nền tảng mua bán ô tô trực tuyến đầu tiên tại Việt Nam chính thức ra mắt, dưới điều hành của Rocket Internet.</p>
                                <p className="gioithieu__lichsu__item__activity">Rocket Internet cũng là một trong những công ty ươm mầm khởi nghiệp lớn nhất trên thế giới.</p>
                                <FaChessKing className="gioithieu__lichsu__item__corner"/>
                            </li>
                            <li className="gioithieu__lichsu__item">
                                <time className="gioithieu__lichsu__item__time" dateTime="2014">2014</time>
                                <p className="gioithieu__lichsu__item__activity">Chợ tốt xe.vn – một trong những nền tảng mua bán ô tô trực tuyến đầu tiên tại Việt Nam chính thức ra mắt, dưới điều hành của Rocket Internet.</p>
                                <p className="gioithieu__lichsu__item__activity">Rocket Internet cũng là một trong những công ty ươm mầm khởi nghiệp lớn nhất trên thế giới.</p>
                                <FaChessKing className="gioithieu__lichsu__item__corner"/>
                            </li>
                            <li className="gioithieu__lichsu__item">
                                <time className="gioithieu__lichsu__item__time" dateTime="2014">2014</time>
                                <p className="gioithieu__lichsu__item__activity">Chợ tốt xe.vn – một trong những nền tảng mua bán ô tô trực tuyến đầu tiên tại Việt Nam chính thức ra mắt, dưới điều hành của Rocket Internet.</p>
                                <p className="gioithieu__lichsu__item__activity">Rocket Internet cũng là một trong những công ty ươm mầm khởi nghiệp lớn nhất trên thế giới.</p>
                                <FaChessKing className="gioithieu__lichsu__item__corner"/>
                            </li>
                            <li className="gioithieu__lichsu__item">
                                <time className="gioithieu__lichsu__item__time" dateTime="2014">2014</time>
                                <p className="gioithieu__lichsu__item__activity">Chợ tốt xe.vn – một trong những nền tảng mua bán ô tô trực tuyến đầu tiên tại Việt Nam chính thức ra mắt, dưới điều hành của Rocket Internet.</p>
                                <p className="gioithieu__lichsu__item__activity">Rocket Internet cũng là một trong những công ty ươm mầm khởi nghiệp lớn nhất trên thế giới.</p>
                                <FaChessKing className="gioithieu__lichsu__item__corner"/>
                            </li>
                            <li className="gioithieu__lichsu__item">
                                <time className="gioithieu__lichsu__item__time" dateTime="2014">2014</time>
                                <p className="gioithieu__lichsu__item__activity">Chợ tốt xe.vn – một trong những nền tảng mua bán ô tô trực tuyến đầu tiên tại Việt Nam chính thức ra mắt, dưới điều hành của Rocket Internet.</p>
                                <p className="gioithieu__lichsu__item__activity">Rocket Internet cũng là một trong những công ty ươm mầm khởi nghiệp lớn nhất trên thế giới.</p>
                                <FaChessKing className="gioithieu__lichsu__item__corner"/>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="gioithieu__banxe">
                    <h3 className="gioithieu__banxe__title">Mua hoặc bán xe ngay hôm nay</h3>
                    <p className="gioithieu__banxe__description">Cho dù là xe mới hay cũ, Chợ tốt xe luôn có sẵn để bạn lựa chọn chiếc xe mà bạn yêu thích</p>
                    <div className="gioithieu__buttons">
                        <div className="gioithieu__buttons__banxe">Bán xe ngay</div>
                        <div className="gioithieu__buttons__muaxe">Mua xe ngay</div>
                    </div>
                </div>
            </div>

           
        </>
    )
};
export default GioiThieu;