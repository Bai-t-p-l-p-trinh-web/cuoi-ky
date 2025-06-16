import apiClient from "../../../utils/axiosConfig";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "../scss/EditCar.scss";

function EditCar() {
  const { slugCar } = useParams();
  const [car, setCar] = useState({
    title: "",
    price: "",
    comment: "",
    status: "selling",
  });

  const [formInfo, setFormInfo] = useState({
    price: "",
    comment: "",
    status: "selling",
  });

  const isSold = car.status === "sold";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.patch(`/car/${slugCar}`, formInfo);
      toast.success("Cập nhật xe thành công!");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Cập nhật thất bại!");
    }
  };
  useEffect(() => {
    const getDataCar = async () => {
      try {
        const resDataCar = await apiClient.get(`/car/${slugCar}`);
        setCar(resDataCar.data);
      } catch (error) {
        toast.error(error?.response?.data?.message);
      }
    };
    if (slugCar) {
      getDataCar();
    }
  }, [slugCar]);

  useEffect(() => {
    setFormInfo({
      price: car.price,
      comment: car.comment,
      status: car.status,
    });
  }, [car]);

  return (
    <div className="editCar">
      <div className="editCar__header">
        <h2>Chỉnh sửa xe</h2>
      </div>
      <div className="editCar__name">
        <span className="editCar__name__title">Tên xe</span>
        <span className="editCar__name__value">{car.title}</span>
      </div>
      <div className="editCar__form__contain">
        <form className="editCar__form" onSubmit={handleSubmit}>
          <div className="editCar__form__box">
            <label className="editCar__form__label">Giá</label>
            <input
              type="number"
              min={0}
              name="price"
              value={formInfo.price}
              onChange={handleChange}
              className="editCar__form__input"
              disabled={isSold}
            />
          </div>

          <div className="editCar__form__box">
            <label className="editCar__form__label">Mô tả</label>
            <textarea
              name="comment"
              value={formInfo.comment}
              onChange={handleChange}
              className="editCar__form__textarea"
              rows={5}
              disabled={isSold}
            ></textarea>
          </div>

          {!isSold && (
            <div className="editCar__form__box">
              <label className="editCar__form__label">Trạng thái</label>
              <select
                name="status"
                value={formInfo.status}
                onChange={handleChange}
                className="editCar__form__input"
              >
                <option value="selling">Đang bán</option>
                <option value="deposited">Đã đặt cọc</option>
                <option value="hidden">Đã ẩn</option>
                <option value="sold">Đã bán</option>
              </select>
            </div>
          )}

          {!isSold && (
            <button type="submit" className="editCar__form__submit">
              Cập nhật
            </button>
          )}

          {isSold && (
            <p className="editCar__form__note">
              Xe đã bán. Không thể chỉnh sửa thông tin.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default EditCar;
