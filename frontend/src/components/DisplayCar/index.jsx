import { Link } from "react-router-dom";
import { convertNum } from "../../utils/ConvertNumber";
import CardCar from "./Card_Car/CardCar";
import "./scss/DisplayCar.scss";

function DisplayCar(){
    const list = {
        num: 1372,
        minPrice: 1,
        maxPrice: 15990,
        cars: [
            {
                title: "Vinfast Lux A2.0 Plus",
                year: 2020,
                km: 60000,
                fuel: "gasoline",
                seat_capacity: 4,
                price: 535,
                slug: "vinfast-lux-a20-plus",
                location: {
                    query_location: "HaNoi",
                    query_name: "Hà Nội"
                },
                img_src: [
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066712%2Fconversions%2F68070f3623486_5DCCD97C-2F08-4241-A87F-E2454C3EAD39-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066713%2Fconversions%2F68070f3d68436_C8628312-F226-4E45-9533-2ABFE8C862AC-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066714%2Fconversions%2F68070f4ded3e2_75324F1A-044C-4888-AC75-6D219A9C4E50-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066715%2Fconversions%2F68070f5e6ed0e_FC16B92D-F1F7-4A1D-ABD3-A55CFD97A20E-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066716%2Fconversions%2F68070f6e79b14_28FE868F-2E93-4B1E-9FF0-AE4E1C450D1F-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066717%2Fconversions%2F68070f762ce7b_9570E8C0-67A8-4B61-B8DF-0ACD695A64BC-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066718%2Fconversions%2F68070f7dde300_9FA4BD31-CD9E-43C4-AED7-096802F1BCAE-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066719%2Fconversions%2F68070f8e3c209_47995784-A3EF-43B8-9EAA-5ADF91C46455-636_424.jpg&w=1200&q=75"
                ]
            },
            {
                title: "Toyota Camry 3.0V 2002",
                year: 2002,
                km: 260000,
                fuel: "gasoline",
                seat_capacity: 7,
                price: 2125,
                location: {
                    query_location: "VinhPhuc",
                    query_name: "Vĩnh Phúc"
                },
                slug: "toyota-camry-30V",
                img_src: [
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066712%2Fconversions%2F68070f3623486_5DCCD97C-2F08-4241-A87F-E2454C3EAD39-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066713%2Fconversions%2F68070f3d68436_C8628312-F226-4E45-9533-2ABFE8C862AC-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066714%2Fconversions%2F68070f4ded3e2_75324F1A-044C-4888-AC75-6D219A9C4E50-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066715%2Fconversions%2F68070f5e6ed0e_FC16B92D-F1F7-4A1D-ABD3-A55CFD97A20E-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066716%2Fconversions%2F68070f6e79b14_28FE868F-2E93-4B1E-9FF0-AE4E1C450D1F-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066717%2Fconversions%2F68070f762ce7b_9570E8C0-67A8-4B61-B8DF-0ACD695A64BC-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066718%2Fconversions%2F68070f7dde300_9FA4BD31-CD9E-43C4-AED7-096802F1BCAE-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066719%2Fconversions%2F68070f8e3c209_47995784-A3EF-43B8-9EAA-5ADF91C46455-636_424.jpg&w=1200&q=75"
                ]
            },
            {
                title: "Toyota Camry 3.0V 2002",
                year: 2002,
                km: 260000,
                fuel: "gasoline",
                seat_capacity: 7,
                price: 12125,
                location: {
                    query_location: "VinhPhuc+VinhYen",
                    query_name: "Vĩnh Phúc - Vĩnh Yên"
                },
                slug: "toyota-camry-30V",
                img_src: [
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066712%2Fconversions%2F68070f3623486_5DCCD97C-2F08-4241-A87F-E2454C3EAD39-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066713%2Fconversions%2F68070f3d68436_C8628312-F226-4E45-9533-2ABFE8C862AC-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066714%2Fconversions%2F68070f4ded3e2_75324F1A-044C-4888-AC75-6D219A9C4E50-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066715%2Fconversions%2F68070f5e6ed0e_FC16B92D-F1F7-4A1D-ABD3-A55CFD97A20E-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066716%2Fconversions%2F68070f6e79b14_28FE868F-2E93-4B1E-9FF0-AE4E1C450D1F-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066717%2Fconversions%2F68070f762ce7b_9570E8C0-67A8-4B61-B8DF-0ACD695A64BC-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066718%2Fconversions%2F68070f7dde300_9FA4BD31-CD9E-43C4-AED7-096802F1BCAE-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066719%2Fconversions%2F68070f8e3c209_47995784-A3EF-43B8-9EAA-5ADF91C46455-636_424.jpg&w=1200&q=75"
                ]
            },
            {
                title: "Toyota Camry 3.0V 2002",
                year: 2002,
                km: 260000,
                fuel: "gasoline",
                seat_capacity: 7,
                price: 125,
                location: {
                    query_location: "VinhPhuc+VinhYen",
                    query_name: "Vĩnh Phúc - Vĩnh Yên"
                },
                slug: "toyota-camry-30V",
                img_src: [
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066712%2Fconversions%2F68070f3623486_5DCCD97C-2F08-4241-A87F-E2454C3EAD39-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066713%2Fconversions%2F68070f3d68436_C8628312-F226-4E45-9533-2ABFE8C862AC-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066714%2Fconversions%2F68070f4ded3e2_75324F1A-044C-4888-AC75-6D219A9C4E50-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066715%2Fconversions%2F68070f5e6ed0e_FC16B92D-F1F7-4A1D-ABD3-A55CFD97A20E-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066716%2Fconversions%2F68070f6e79b14_28FE868F-2E93-4B1E-9FF0-AE4E1C450D1F-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066717%2Fconversions%2F68070f762ce7b_9570E8C0-67A8-4B61-B8DF-0ACD695A64BC-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066718%2Fconversions%2F68070f7dde300_9FA4BD31-CD9E-43C4-AED7-096802F1BCAE-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066719%2Fconversions%2F68070f8e3c209_47995784-A3EF-43B8-9EAA-5ADF91C46455-636_424.jpg&w=1200&q=75"
                ]
            },
            {
                title: "Toyota Camry 3.0V 2002",
                year: 2002,
                km: 260000,
                fuel: "gasoline",
                seat_capacity: 7,
                price: 121325,
                location: {
                    query_location: "VinhPhuc+VinhYen",
                    query_name: "Vĩnh Phúc - Vĩnh Yên"
                },
                slug: "toyota-camry-30V",
                img_src: [
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066712%2Fconversions%2F68070f3623486_5DCCD97C-2F08-4241-A87F-E2454C3EAD39-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066713%2Fconversions%2F68070f3d68436_C8628312-F226-4E45-9533-2ABFE8C862AC-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066714%2Fconversions%2F68070f4ded3e2_75324F1A-044C-4888-AC75-6D219A9C4E50-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066715%2Fconversions%2F68070f5e6ed0e_FC16B92D-F1F7-4A1D-ABD3-A55CFD97A20E-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066716%2Fconversions%2F68070f6e79b14_28FE868F-2E93-4B1E-9FF0-AE4E1C450D1F-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066717%2Fconversions%2F68070f762ce7b_9570E8C0-67A8-4B61-B8DF-0ACD695A64BC-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066718%2Fconversions%2F68070f7dde300_9FA4BD31-CD9E-43C4-AED7-096802F1BCAE-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066719%2Fconversions%2F68070f8e3c209_47995784-A3EF-43B8-9EAA-5ADF91C46455-636_424.jpg&w=1200&q=75"
                ]
            },
            {
                title: "Toyota Camry 3.0V 2002 kakakakakakakakakakaka",
                year: 2002,
                km: 260000,
                fuel: "gasoline",
                seat_capacity: 7,
                price: 125,
                location: {
                    query_location: "VinhPhuc+VinhYen",
                    query_name: "Vĩnh Phúc - Vĩnh Yên"
                },
                slug: "toyota-camry-30V",
                img_src: [
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066712%2Fconversions%2F68070f3623486_5DCCD97C-2F08-4241-A87F-E2454C3EAD39-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066713%2Fconversions%2F68070f3d68436_C8628312-F226-4E45-9533-2ABFE8C862AC-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066714%2Fconversions%2F68070f4ded3e2_75324F1A-044C-4888-AC75-6D219A9C4E50-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066715%2Fconversions%2F68070f5e6ed0e_FC16B92D-F1F7-4A1D-ABD3-A55CFD97A20E-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066716%2Fconversions%2F68070f6e79b14_28FE868F-2E93-4B1E-9FF0-AE4E1C450D1F-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066717%2Fconversions%2F68070f762ce7b_9570E8C0-67A8-4B61-B8DF-0ACD695A64BC-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066718%2Fconversions%2F68070f7dde300_9FA4BD31-CD9E-43C4-AED7-096802F1BCAE-636_424.jpg&w=1200&q=75",
                    "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066719%2Fconversions%2F68070f8e3c209_47995784-A3EF-43B8-9EAA-5ADF91C46455-636_424.jpg&w=1200&q=75"
                ]
            },
        ]
    };
    return (
        <>
            <div className="home__content__main__display">
                <h1 className="home__content__main__display--title">Mua bán oto - Xe ô tô cũ - Xe hơi mới toàn quốc</h1>
                <p className="home__content__main__display--description">Có {convertNum(list.num)} tin bán xe giá từ {list.minPrice} triệu đến {Math.floor(Number(list.maxPrice)/1000)} tỷ {Number(list.maxPrice)%1000} triệu cập nhập mới nhất 05/2025</p>
                <div className="home__content__main__display__list">
                    {
                        list?.cars.length > 0 && 
                        list?.cars.map((item, index) => (
                            <Link to={`/${item.slug}`} className="home__content__main__display__list-item" key={index}>
                                <CardCar item={item} />
                            </Link>
                        ))
                    }
                </div>
            </div>
        </>
    )
};
export default DisplayCar;