import { Link } from "react-router-dom";

function HeaderMuaXe(){
    return (
        <>
            <div className="header__dropdownMuaXe">
                <div className="header__dropdownMuaXe__top">
                    <div className="header__dropdownMuaXe__top-hang">
                        <h3 className="header__dropdownMuaXe__top-hangTitle">HÃNG XE PHỔ BIẾN</h3>
                        <ul className="header__dropdownMuaXe__top-hangList">
                            <li className="header__dropdownMuaXe__top-hangList-item">Toyota</li>
                            <li className="header__dropdownMuaXe__top-hangList-item">Honda</li>
                            <li className="header__dropdownMuaXe__top-hangList-item">Mercedes-Benz</li>
                            <li className="header__dropdownMuaXe__top-hangList-item">Ford</li>
                            <li className="header__dropdownMuaXe__top-hangList-item">BMW</li>
                            <li className="header__dropdownMuaXe__top-hangList-item">Chevrolet</li>
                            <li className="header__dropdownMuaXe__top-hangList-item">Hyndai</li>
                            <li className="header__dropdownMuaXe__top-hangList-item">Kia</li>
                            <li className="header__dropdownMuaXe__top-hangList-item">Mazda</li>
                            <li className="header__dropdownMuaXe__top-hangList-item">Vinfast</li>
                        </ul>
                    </div>
                    <div className="header__dropdownMuaXe__top-dong">
                        <h3 className="header__dropdownMuaXe__top-dongTitle">DÒNG XE PHỔ BIẾN</h3>
                        <ul className="header__dropdownMuaXe__top-dongList">
                            <li className="header__dropdownMuaXe__top-dongList-item">Mercedes-Benz GL Class</li>
                            <li className="header__dropdownMuaXe__top-dongList-item">Mercedes-Benz E Class</li>
                            <li className="header__dropdownMuaXe__top-dongList-item">Mitsubishi Xpander Cross</li>
                            <li className="header__dropdownMuaXe__top-dongList-item">Toyota Fortuner</li>
                            <li className="header__dropdownMuaXe__top-dongList-item">Mercedes-Benz S Class</li>
                            <li className="header__dropdownMuaXe__top-dongList-item">Mercedes-Benz C Class</li>
                            <li className="header__dropdownMuaXe__top-dongList-item">Huyndai Santafe</li>
                            <li className="header__dropdownMuaXe__top-dongList-item">Toyota Corolla Cross</li>
                            <li className="header__dropdownMuaXe__top-dongList-item">Ford Everest</li>
                            <li className="header__dropdownMuaXe__top-dongList-item">Toyota Vios</li>
                        </ul>
                    </div>
                    <div className="header__dropdownMuaXe__top-gia">
                        <h3 className="header__dropdownMuaXe__top-giaTitle">GIÁ XE</h3>
                        <ul className="header__dropdownMuaXe__top-giaList">
                            <li className="header__dropdownMuaXe__top-giaList-item">Dưới 500 triệu</li>
                            <li className="header__dropdownMuaXe__top-giaList-item">Từ 500 - 700 triệu</li>
                            <li className="header__dropdownMuaXe__top-giaList-item">Từ 700 - 1 tỷ</li>
                            <li className="header__dropdownMuaXe__top-giaList-item">Trên 1 tỷ</li>
                        </ul>
                    </div>
                </div>
                <Link to="/xe-o-to" className="header__dropdownMuaXe__bottom">Xem tất cả xe</Link>
            </div>
        </>
    )
};
export default HeaderMuaXe;