import BanxeAccordion from "../../components/Accordion/CustomAccordion/Banxe_Accordion";
import SwiperBanXe from "../../components/Swiper/CustomSwiper/Swiper_Banxe";
import "./scss/Banxe.scss";

const questions = [
    {
        question: "Vì sao nên mua bán xe tại Chợ tốt xe",
        answer: 
`- Khách hàng đặt lịch và tùy chọn nơi kiểm kiểm tra: tại Chợ tốt xe hoặc tại nhà theo yêu cầu của quý khách.
- Định giá tối ưu & minh bạch 
- Xe của bạn được định giá cao hơn giá thị trường. Toàn bộ quá trình giao dịch diễn ra trực tiếp giữa chủ xe và Carmudi.
- Hoàn tất thủ tục nhanh chóng, thanh toán trong vòng 24h 
- Toàn bộ quá trình mua bán diễn ra nhanh chóng. Thanh toán ngay lập tức sau khi hoàn thành các thủ tục giấy tờ pháp lý về việc chuyển quyền sở hữu xe.
- Bảo mật thông tin từ A đến Z 
- Toàn bộ quá trình từ đăng ký kiểm định giá đến hoàn tất giao dịch đều được Chợ tốt xe cam kết bảo mật thông tin.`
    },
    {
        question: "Quy trình bán xe tại Chợ tốt xe diễn ra như thế nào",
        answer: 
`Chợ tốt xe luôn hỗ trợ khách hàng để quá trình mua xe diễn ra dễ dàng hơn:
Bước 1: Khách hàng định giá xe tại Chợ tốt xe.vn và đặt lịch kiểm tra xe miễn phí
Bước 2: Sau đó, chuyên viên của Chợ tốt xe sẽ kiểm tra xe và đưa ra mức giá đề xuất cho quý khách hàng
Bước 3: Chợ tốt xe hỗ trợ hoàn tất thủ tục pháp lý để chuyển quyền sở hữu xe trong vòng 24 giờ
Bước 4: Ngay sau khi hoàn tất, Chợ tốt xe sẽ thanh toán cho bạn trong vòng 1 giờ theo mức giá chốt bán`
    },
    {
        question: "Lý do Chợ tốt xe mua được giá cao",
        answer: 
`Chợ tốt xe thu mua xe đã qua sử dụng với mức giá cao hơn thị trường vì các lí do:

- Không mất phí trung gian, chủ xe trực tiếp bán xe cho Chợ tốt xe.
- Giá trị xe được tính toán dựa trên thuật toán AI kết hợp với kinh nghiệm của chuyên gia ô tô, để đảm bảo chiếc xe được định giá đúng với giá trị nhất.
- Ngoài ra, Chợ tốt xe luôn đặt quyền lợi của quý khách hàng lên hàng đầu, vì vậy khi sử dụng dịch vụ của Chợ tốt xe bạn sẽ nhận được những lợi ích sau:

1.Định giá và đặt lịch kiểm tra xe miễn phí
2. Nhận kết quả tình trạng xe và giá đề xuất
3. Chợ tốt xe tiến hành mọi thủ tục mua bán xe trong 24 giờ
4. Chủ xe nhận thanh toán nhanh gọn trong vòng 1 giờ`
    },
    {
        question: "Cần chuẩn bị thủ tục gì khi bán xe tại Chợ tốt xe",
        answer: 
`Hồ sơ giấy tờ cần chuẩn bị để bán xe nhanh chóng:

Giấy tờ gốc của chủ xe, bao gồm:
- CCCD của người đứng tên trên Đăng ký xe
- Giấy tờ liên quan đến tình trạng hôn nhân: Xác nhận độc thân/ đăng ký kết hôn/ Xác nhận ly hôn.
- Giấy xác nhận quyền thừa kế/ cho/ biếu/ tặng (nếu có)
- CCCD của vợ hoặc chồng (nếu có)

Giấy tờ gốc của xe, bao gồm:
- Đăng ký xe
- Đăng kiểm xe
- Sổ bảo hành (nếu có)
- Bảo hiểm vật chất xe (nếu có)`
    },
    {
        question: "Hình thức thanh toán giao dịch cho khách hàng của Chợ tốt xe",
        answer: 
`Chúng tôi sẽ thanh toán qua tài khoản ngân hàng của bạn NGAY SAU KHI hoàn thành các thủ tục giấy tờ pháp lý về việc chuyển quyền sở hữu xe`
    },
];

function BanXe(){
    return (
        <>
            
            <div className="banxe">
                {/* Form  */}
                <div className="banxe__head">
                    <form className="banxe__head__form">
                        Form
                    </form>
                </div>

                {/* Huong dan  */}
                <div className="banxe__guide__contain">
                    <div className="banxe__guide container">
                        <h3 className="banxe__guide__title">4 bước bán xe chỉ trong 1 giờ cùng Chợ tốt xe</h3>
                        <ul className="banxe__guide__list">
                            <li className="banxe__guide__list-item">
                                <div className="banxe__guide__list-item-corner">
                                    <span>1</span>
                                </div>
                                <img src="/calender.svg" alt="calender" />
                                <p className="banxe__guide__list-item-description">
                                    1.Định giá và đặt lịch kiểm tra xe miễn phí
                                </p>
                            </li>
                            <li className="banxe__guide__list-item">
                                <div className="banxe__guide__list-item-corner">
                                    <span>2</span>
                                </div>
                                <img src="/mail.svg" alt="calender" />
                                <p className="banxe__guide__list-item-description">
                                    2. Nhận kết quả tình trạng xe và giá đề xuất
                                </p>
                            </li>
                            <li className="banxe__guide__list-item">
                                <div className="banxe__guide__list-item-corner">
                                    <span>3</span>
                                </div>
                                <img src="/car.svg" alt="calender" />
                                <p className="banxe__guide__list-item-description">
                                    3. chợ tốt xe tiến hành mọi thủ tục mua-bán xe trong 24 giờ
                                </p>
                            </li>
                            <li className="banxe__guide__list-item">
                                <div className="banxe__guide__list-item-corner">
                                    <span>4</span>
                                </div>
                                <img src="/money.svg" alt="calender" />
                                <p className="banxe__guide__list-item-description">
                                    4. Chủ xe nhận thanh toán nhanh - gọn trong vòng 1 giờ
                                </p>
                            </li>
                        </ul>

                        <div className="banxe__guide__nav">
                            <label className="banxe__guide__nav-label">Đăng ký hỗ trợ ngay!</label>
                        </div>
                    </div>
                </div>
                
                {/* Li do  */}
                <div className="banxe__why">
                    <h3 className="banxe__why-title">
                        Lí do nên bán xe tại chợ xe tốt
                    </h3>
                    <div className="banxe__why__contain">
                        <div className="banxe__why__contain--left">
                            <img 
                                className="banxe__why__contain--left--img"
                                src="https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fimages%2Freason_bg.jpg&w=828&q=75" 
                                alt="xe"
                            />
                        </div>
                        <div className="banxe__why__contain--right">
                            <ul className="banxe__why__contain--right__list">
                                <li className="banxe__why__contain--right__list-item">
                                    <img  className="banxe__why__contain--right__list-item--image" src="/calendar.svg" alt="calendar"/>
                                    <span className="banxe__why__contain--right__list-item--content">Hẹn kiểm tra xe tại nơi bạn chọn</span>
                                </li>
                                <li className="banxe__why__contain--right__list-item">
                                    <img  className="banxe__why__contain--right__list-item--image" src="/car-inspection.svg" alt="calendar"/>
                                    <span className="banxe__why__contain--right__list-item--content">Định giá minh bạch và tốt nhất thị trường</span>
                                </li>
                                <li className="banxe__why__contain--right__list-item">
                                    <img  className="banxe__why__contain--right__list-item--image" src="/fast-time.svg" alt="calendar"/>
                                    <span className="banxe__why__contain--right__list-item--content">Hoàn tất thủ tục, thanh toán nhanh chóng</span>
                                </li>
                                <li className="banxe__why__contain--right__list-item">
                                    <img  className="banxe__why__contain--right__list-item--image" src="/security.svg" alt="calendar"/>
                                    <span className="banxe__why__contain--right__list-item--content">Bảo mật thông tin từ A đến Z</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                </div>

                {/* Ho Tro  */}
                <div className="banxe__hotro">
                    <h2 className="banxe__hotro__title">Đăng ký kiểm định xe miễn phí</h2>
                    <div className="banxe__hotro__banner">
                        <ul className="banxe__hotro__banner--left">
                            <li className="banxe__hotro__banner--left-item">
                                <p className="banxe__hotro__banner--left-item-description">Nhập thông tin cơ bản của xe</p>
                                <div className="banxe__hotro__banner--left-item-line"></div>
                            </li>
                            <li className="banxe__hotro__banner--left-item">
                                <p className="banxe__hotro__banner--left-item-description">Nhập giá ước tính theo trình trạng xe</p>
                                <div className="banxe__hotro__banner--left-item-line"></div>
                            </li>
                            <li className="banxe__hotro__banner--left-item">
                                <p className="banxe__hotro__banner--left-item-description">Đặt lịch kiểm tra xe và giao dịch</p>
                            </li>
                        </ul>
                        <div className="banxe__hotro__banner--right">
                            <img src="/ban-xe-intro.webp" alt="logo" />
                        </div>
                    </div>
                    <div className="banxe__hotro__dangky">
                        <button className="banxe__hotro__dangky--button">Đăng ký hỗ trợ ngay!</button>
                    </div>
                </div>

                {/* Danh gia  */}
                <SwiperBanXe/>

                {/* Accordion  */}
                <div className="banxe__cauhoi">
                    <h3 className="banxe__cauhoi__title">Một số câu hỏi khi cần bán xe</h3>
                    <BanxeAccordion questions={questions}/>
                </div>   

            </div>
        </>
    )
};
export default BanXe;