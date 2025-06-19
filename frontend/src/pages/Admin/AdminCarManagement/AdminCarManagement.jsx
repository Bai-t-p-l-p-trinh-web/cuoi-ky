import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaFilter,
  FaCheck,
  FaTimes,
  FaEye,
  FaCar,
  FaClock,
  FaUserCheck,
  FaSpinner,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { adminAPI } from "../../../utils/axiosConfig";
import "./AdminCarManagement.scss";

const AdminCarManagement = () => {
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [inspectors, setInspectors] = useState([]);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedInspectors, setSelectedInspectors] = useState([]);
  const [requestsPagination, setRequestsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [carsPagination, setCarsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (activeTab === "requests") {
      fetchRequests();
    } else {
      fetchCars();
    }
    fetchInspectors();
  }, [activeTab]);

  const fetchRequests = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: searchTerm,
        status: filterStatus,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const response = await adminAPI.getRequests(params);
      // console.log(response);
      if (response.data.success) {
        setRequests(response.data.data.requests);
        setRequestsPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Không thể tải dữ liệu yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const fetchCars = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: searchTerm,
        status: filterStatus,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const response = await adminAPI.getCars(params);
      if (response.data.success) {
        setCars(response.data.data.cars);
        setCarsPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
      toast.error("Không thể tải dữ liệu xe");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = () => {
    if (activeTab === "requests") {
      fetchRequests(requestsPagination.currentPage);
    } else {
      fetchCars(carsPagination.currentPage);
    }
  };

  const fetchInspectors = async () => {
    try {
      const response = await adminAPI.getInspectors();
      // console.log('nhân viên : ', response.data.data);
      if (response.data.success) {
        setInspectors(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching inspectors:", error);
      toast.error("Không thể tải danh sách inspector");
    }
  };

  const handleAssignInspectors = async (slug, inspectorIds) => {
    try {
      const response = await adminAPI.assignInspectors(slug, {
        userIds: inspectorIds,
      });

      toast.success("Đã phân công inspector thành công");
      setAssignModal(false);
      setSelectedInspectors([]);
      fetchRequests(requestsPagination.currentPage);
    } catch (error) {
      console.error("Error assigning inspectors:", error);
      toast.error(
        error.response?.data?.message || "Không thể phân công inspector"
      );
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const response = await adminAPI.approveRequest(requestId, {
        notes: "Đã duyệt qua hệ thống admin",
      });

      if (response.data.success) {
        toast.success("Đã duyệt yêu cầu thành công");
        fetchRequests(requestsPagination.currentPage);
      }
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error(error.response?.data?.message || "Không thể duyệt yêu cầu");
    }
  };

  const handleRejectRequest = async (requestId, reason) => {
    try {
      const response = await adminAPI.rejectRequest(requestId, {
        reason: reason,
      });

      if (response.data.success) {
        toast.success("Đã từ chối yêu cầu");
        setRejectModal(false);
        setRejectReason("");
        fetchRequests(requestsPagination.currentPage);
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error(error.response?.data?.message || "Không thể từ chối yêu cầu");
    }
  };

  const handleUpdateCarStatus = async (carId, status, reason = "") => {
    try {
      const response = await adminAPI.updateCarStatus(carId, {
        status: status,
        reason: reason,
      });

      if (response.data.success) {
        toast.success("Đã cập nhật trạng thái xe thành công");
        fetchCars(carsPagination.currentPage);
      }
    } catch (error) {
      console.error("Error updating car status:", error);
      toast.error(
        error.response?.data?.message || "Không thể cập nhật trạng thái xe"
      );
    }
  };

  const handleDeleteCar = async (carId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa xe này?")) {
      try {
        const response = await adminAPI.deleteCar(carId);

        if (response.data.success) {
          toast.success("Đã xóa xe thành công");
          fetchCars(carsPagination.currentPage);
        }
      } catch (error) {
        console.error("Error deleting car:", error);
        toast.error(error.response?.data?.message || "Không thể xóa xe");
      }
    }
  };

  // Search and filter handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleSearchSubmit = () => {
    if (activeTab === "requests") {
      fetchRequests(1);
    } else {
      fetchCars(1);
    }
  };

  const handlePageChange = (page) => {
    if (activeTab === "requests") {
      fetchRequests(page);
    } else {
      fetchCars(page);
    }
  };

  const filteredRequests = requests;
  const filteredCars = cars;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      pending: "Chờ duyệt",
      checked: "Đã duyệt",
      done: "Hoàn thành",
      reject: "Từ chối",
      selling: "Đang bán",
      sold: "Đã bán",
      rejected: "Bị từ chối",
    };
    return statusLabels[status] || status;
  };

  const getFuelLabel = (fuel) => {
    const fuelLabels = {
      gasoline: "Xăng",
      oil: "Dầu",
      electric: "Điện",
    };
    return fuelLabels[fuel] || fuel;
  };

  if (loading && requests.length === 0 && cars.length === 0) {
    return (
      <div className="admin-car-management loading">
        <div className="loading-spinner">
          <FaSpinner className="spinning" />
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-car-management">
      <ToastContainer/>
      <div className="page-header">
        <h1>Quản lý xe & Yêu cầu</h1>
        <p>Quản lý yêu cầu duyệt xe và danh sách xe đang bán</p>
      </div>

      {/* Tabs */}
      <div className="tabs-navigation">
        <button
          className={activeTab === "requests" ? "active" : ""}
          onClick={() => setActiveTab("requests")}
        >
          <FaClock />
          Yêu cầu duyệt xe (
          {requests.filter((r) => r.status === "pending").length})
        </button>
        <button
          className={activeTab === "cars" ? "active" : ""}
          onClick={() => setActiveTab("cars")}
        >
          <FaCar />
          Xe đang bán ({cars.length})
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên xe, người bán..."
            value={searchTerm}
            onChange={handleSearch}
            onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit()}
          />
          <button onClick={handleSearchSubmit} className="search-btn">
            Tìm kiếm
          </button>
        </div>

        <div className="filter-controls">
          <select value={filterStatus} onChange={handleFilterChange}>
            <option value="all">Tất cả trạng thái</option>
            {activeTab === "requests" && (
              <>
                <option value="pending">Chờ duyệt</option>
                <option value="checked">Đã duyệt</option>
                <option value="reject">Từ chối</option>
                <option value="done">Hoàn thành</option>
              </>
            )}
            {activeTab === "cars" && (
              <>
                <option value="selling">Đang bán</option>
                <option value="sold">Đã bán</option>
                <option value="pending">Chờ duyệt</option>
                <option value="rejected">Bị từ chối</option>
              </>
            )}
          </select>
          <button onClick={handleSearchSubmit} className="filter-btn">
            <FaFilter />
            Lọc
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "requests" && (
        <div className="requests-section">
          {loading ? (
            <div className="loading-content">
              <FaSpinner className="spinning" />
              <span>Đang tải dữ liệu...</span>
            </div>
          ) : (
            <>
              <div className="requests-grid">
                {filteredRequests.map((request) => (
                  <div key={request._id} className="request-card">
                    <div className="request-header">
                      <div className="car-image-container">
                        <img
                          src={request.img_demo || "/car-demo.jpg"}
                          alt={request.name}
                          className="car-image"
                          onError={(e) => {
                            e.target.src = "/car-demo.jpg";
                          }}
                        />
                        <div className="status-overlay">
                          <span className={`status-badge ${request.status}`}>
                            {getStatusLabel(request.status)}
                          </span>
                        </div>
                      </div>

                      <div className="request-info">
                        <h3 className="car-title">{request.name}</h3>
                        <p className="seller-info">
                          <strong>Người bán:</strong>{" "}
                          {request.seller?.name || "N/A"}
                        </p>
                        <p className="location">📍 {request.location}</p>

                        <div className="car-specs">
                          <div className="spec-item">
                            <span className="spec-label">Năm:</span>
                            <span className="spec-value">{request.year}</span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">KM:</span>
                            <span className="spec-value">
                              {request.km?.toLocaleString() || 0}
                            </span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">Nhiên liệu:</span>
                            <span className="spec-value">
                              {getFuelLabel(request.fuel)}
                            </span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">Ghế:</span>
                            <span className="spec-value">
                              {request.seat_capacity}
                            </span>
                          </div>
                        </div>

                        <p className="created-date">
                          📅 {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>

                    {request.price_recommend_low && (
                      <div className="price-recommendation">
                        <strong>💰 Giá đề xuất: </strong>
                        <span className="price-range">
                          {formatCurrency(request.price_recommend_low)} -{" "}
                          {formatCurrency(request.price_recommend_high)}
                        </span>
                      </div>
                    )}

                    {request.inspectors && request.inspectors.length > 0 && (
                      <div className="assigned-inspectors">
                        <strong>👨‍🔧 Inspector: </strong>
                        <span>
                          {request.inspectors
                            .map((inspector) => inspector.name)
                            .join(", ")}
                        </span>
                      </div>
                    )}

                    {request.message && (
                      <div className="rejection-reason">
                        <strong>❌ Lý do từ chối: </strong>
                        <span>{request.message}</span>
                      </div>
                    )}

                    <div className="request-actions">
                      <button
                        className="btn-info"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailModal(true);
                        }}
                      >
                        <FaEye />
                        Chi tiết
                      </button>

                      {request.status === "pending" && (
                        <>
                          <button
                            className="btn-assign"
                            onClick={() => {
                              setSelectedRequest(request);
                              setAssignModal(true);
                            }}
                          >
                            <FaUserCheck />
                            Phân công
                          </button>
                          <button
                            className="btn-approve"
                            onClick={() => handleApproveRequest(request._id)}
                          >
                            <FaCheck />
                            Duyệt
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => {
                              setSelectedRequest(request);
                              setRejectModal(true);
                            }}
                          >
                            <FaTimes />
                            Từ chối
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination for requests */}
              {requestsPagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() =>
                      handlePageChange(requestsPagination.currentPage - 1)
                    }
                    disabled={!requestsPagination.hasPrev}
                    className="pagination-btn"
                  >
                    Trước
                  </button>

                  <span className="pagination-info">
                    Trang {requestsPagination.currentPage} /{" "}
                    {requestsPagination.totalPages}(
                    {requestsPagination.totalItems} yêu cầu)
                  </span>

                  <button
                    onClick={() =>
                      handlePageChange(requestsPagination.currentPage + 1)
                    }
                    disabled={!requestsPagination.hasNext}
                    className="pagination-btn"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "cars" && (
        <div className="cars-section">
          {loading ? (
            <div className="loading-content">
              <FaSpinner className="spinning" />
              <span>Đang tải dữ liệu...</span>
            </div>
          ) : (
            <>
              <div className="cars-grid">
                {filteredCars.map((car) => (
                  <div key={car._id} className="car-card">
                    <div className="car-header">
                      <div className="car-image-container">
                        <img
                          src={car.img_demo || "/car-demo.jpg"}
                          alt={car.title}
                          className="car-image"
                          onError={(e) => {
                            e.target.src = "/car-demo.jpg";
                          }}
                        />
                        <div className="status-overlay">
                          <span className={`status-badge ${car.status}`}>
                            {getStatusLabel(car.status)}
                          </span>
                        </div>
                      </div>

                      <div className="car-info">
                        <h3 className="car-title">{car.title}</h3>
                        <p className="price">{formatCurrency(car.price)}</p>
                        <p className="seller">
                          <strong>Người bán:</strong>{" "}
                          {car.seller?.name || "N/A"}
                        </p>

                        <div className="car-specs">
                          <div className="spec-item">
                            <span className="spec-label">Năm:</span>
                            <span className="spec-value">{car.year}</span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">KM:</span>
                            <span className="spec-value">
                              {car.km?.toLocaleString() || 0}
                            </span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">Nhiên liệu:</span>
                            <span className="spec-value">
                              {getFuelLabel(car.fuel)}
                            </span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">Ghế:</span>
                            <span className="spec-value">
                              {car.seat_capacity}
                            </span>
                          </div>
                        </div>

                        <div className="car-stats">
                          <div className="stat-item">
                            <span className="stat-label">👁️ Lượt xem:</span>
                            <span className="stat-value">{car.views || 0}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">❤️ Yêu thích:</span>
                            <span className="stat-value">
                              {car.favorites || 0}
                            </span>
                          </div>
                        </div>

                        <p className="created-date">
                          📅 Đăng ngày: {formatDate(car.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="car-actions">
                      <button
                        className="btn-info"
                        onClick={() => {
                          setSelectedCar(car);
                          setShowDetailModal(true);
                        }}
                      >
                        <FaEye />
                        Chi tiết
                      </button>

                      <button
                        className="btn-edit"
                        onClick={() =>
                          handleUpdateCarStatus(
                            car._id,
                            car.status === "selling" ? "sold" : "selling"
                          )
                        }
                      >
                        <FaEdit />
                        {car.status === "selling"
                          ? "Đánh dấu đã bán"
                          : "Đánh dấu đang bán"}
                      </button>

                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteCar(car._id)}
                      >
                        <FaTrash />
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination for cars */}
              {carsPagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() =>
                      handlePageChange(carsPagination.currentPage - 1)
                    }
                    disabled={!carsPagination.hasPrev}
                    className="pagination-btn"
                  >
                    Trước
                  </button>

                  <span className="pagination-info">
                    Trang {carsPagination.currentPage} /{" "}
                    {carsPagination.totalPages}({carsPagination.totalItems} xe)
                  </span>

                  <button
                    onClick={() =>
                      handlePageChange(carsPagination.currentPage + 1)
                    }
                    disabled={!carsPagination.hasNext}
                    className="pagination-btn"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (selectedRequest || selectedCar) && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowDetailModal(false);
            setSelectedRequest(null);
            setSelectedCar(null);
          }}
        >
          <div
            className="modal-content detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{selectedRequest ? "Chi tiết yêu cầu" : "Chi tiết xe"}</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedRequest(null);
                  setSelectedCar(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-content">
                {selectedRequest && (
                  <>
                    <div className="detail-image">
                      <img
                        src={selectedRequest.img_demo || "/car-demo.jpg"}
                        alt={selectedRequest.name}
                        className="car-image-modal"
                        onError={(e) => {
                          e.target.src = "/car-demo.jpg";
                        }}
                      />
                    </div>
                    <div className="detail-info">
                      <h4>{selectedRequest.name}</h4>

                      <div className="info-section">
                        <h5>Thông tin xe</h5>
                        <div className="info-grid">
                          <div className="info-item">
                            <strong>Năm sản xuất:</strong>{" "}
                            {selectedRequest.year}
                          </div>
                          <div className="info-item">
                            <strong>Số km:</strong>{" "}
                            {selectedRequest.km?.toLocaleString() || 0}
                          </div>
                          <div className="info-item">
                            <strong>Nhiên liệu:</strong>{" "}
                            {getFuelLabel(selectedRequest.fuel)}
                          </div>
                          <div className="info-item">
                            <strong>Số ghế:</strong>{" "}
                            {selectedRequest.seat_capacity}
                          </div>
                          <div className="info-item">
                            <strong>Địa điểm:</strong>{" "}
                            {selectedRequest.location}
                          </div>
                          <div className="info-item">
                            <strong>Trạng thái:</strong>{" "}
                            <span
                              className={`status-badge ${selectedRequest.status}`}
                            >
                              {getStatusLabel(selectedRequest.status)}
                            </span>
                          </div>
                          <div className="info-item">
                            <strong>Ngày tạo:</strong>{" "}
                            {formatDate(selectedRequest.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="info-section">
                        <h5>Thông tin người bán</h5>
                        <div className="seller-info-detail">
                          <div className="info-item">
                            <strong>Tên:</strong>{" "}
                            {selectedRequest.seller?.name || "N/A"}
                          </div>
                          <div className="info-item">
                            <strong>Email:</strong>{" "}
                            {selectedRequest.seller?.email || "N/A"}
                          </div>
                          <div className="info-item">
                            <strong>Điện thoại:</strong>{" "}
                            {selectedRequest.seller?.phone || "N/A"}
                          </div>
                        </div>
                      </div>

                      {selectedRequest.price_recommend_low && (
                        <div className="info-section">
                          <h5>Giá đề xuất</h5>
                          <div className="price-range">
                            <span className="price-low">
                              {formatCurrency(
                                selectedRequest.price_recommend_low
                              )}
                            </span>
                            <span className="price-separator"> - </span>
                            <span className="price-high">
                              {formatCurrency(
                                selectedRequest.price_recommend_high
                              )}
                            </span>
                          </div>
                        </div>
                      )}

                      {selectedRequest.inspectors &&
                        selectedRequest.inspectors.length > 0 && (
                          <div className="info-section">
                            <h5>Inspector đã phân công</h5>
                            <div className="inspectors-list">
                              {selectedRequest.inspectors.map(
                                (inspector, index) => (
                                  <span key={index} className="inspector-badge">
                                    {inspector.name}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {selectedRequest.message && (
                        <div className="info-section">
                          <h5>Lý do từ chối</h5>
                          <div className="rejection-message">
                            {selectedRequest.message}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {selectedCar && (
                  <>
                    <div className="detail-image">
                      <img
                        src={selectedCar.img_demo || "/car-demo.jpg"}
                        alt={selectedCar.title}
                        className="car-image-modal"
                        onError={(e) => {
                          e.target.src = "/car-demo.jpg";
                        }}
                      />
                    </div>
                    <div className="detail-info">
                      <h4>{selectedCar.title}</h4>

                      <div className="info-section">
                        <h5>Thông tin xe</h5>
                        <div className="info-grid">
                          <div className="info-item">
                            <strong>Giá bán:</strong>{" "}
                            <span className="price-highlight">
                              {formatCurrency(selectedCar.price)}
                            </span>
                          </div>
                          <div className="info-item">
                            <strong>Năm sản xuất:</strong> {selectedCar.year}
                          </div>
                          <div className="info-item">
                            <strong>Số km:</strong>{" "}
                            {selectedCar.km?.toLocaleString() || 0}
                          </div>
                          <div className="info-item">
                            <strong>Nhiên liệu:</strong>{" "}
                            {getFuelLabel(selectedCar.fuel)}
                          </div>
                          <div className="info-item">
                            <strong>Số ghế:</strong> {selectedCar.seat_capacity}
                          </div>
                          <div className="info-item">
                            <strong>Địa điểm:</strong> {selectedCar.location}
                          </div>
                          <div className="info-item">
                            <strong>Trạng thái:</strong>{" "}
                            <span
                              className={`status-badge ${selectedCar.status}`}
                            >
                              {getStatusLabel(selectedCar.status)}
                            </span>
                          </div>
                          <div className="info-item">
                            <strong>Ngày đăng:</strong>{" "}
                            {formatDate(selectedCar.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="info-section">
                        <h5>Thông tin người bán</h5>
                        <div className="seller-info-detail">
                          <div className="info-item">
                            <strong>Tên:</strong>{" "}
                            {selectedCar.seller?.name || "N/A"}
                          </div>
                          <div className="info-item">
                            <strong>Email:</strong>{" "}
                            {selectedCar.seller?.email || "N/A"}
                          </div>
                          <div className="info-item">
                            <strong>Điện thoại:</strong>{" "}
                            {selectedCar.seller?.phone || "N/A"}
                          </div>
                        </div>
                      </div>

                      <div className="info-section">
                        <h5>Thống kê</h5>
                        <div className="stats-grid">
                          <div className="stat-item">
                            <span className="stat-label">Lượt xem:</span>
                            <span className="stat-value">
                              {selectedCar.views || 0}
                            </span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Yêu thích:</span>
                            <span className="stat-value">
                              {selectedCar.favorites || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {selectedCar.description && (
                        <div className="info-section">
                          <h5>Mô tả</h5>
                          <div className="description">
                            {selectedCar.description}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Request Modal */}
      {rejectModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Từ chối yêu cầu</h3>
              <button
                className="close-btn"
                onClick={() => setRejectModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Nhập lý do từ chối yêu cầu cho xe:{" "}
                <strong>{selectedRequest.name}</strong>
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                rows={4}
                className="reject-reason-input"
              />
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setRejectModal(false)}
                >
                  Hủy
                </button>
                <button
                  className="btn-danger"
                  onClick={() => {
                    if (rejectReason.trim()) {
                      handleRejectRequest(selectedRequest._id, rejectReason);
                    } else {
                      toast.error("Vui lòng nhập lý do từ chối");
                    }
                  }}
                  disabled={!rejectReason.trim()}
                >
                  Từ chối
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Inspector Modal */}
      {assignModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Phân công Inspector</h3>
              <button
                className="close-btn"
                onClick={() => setAssignModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Chọn inspector cho xe: <strong>{selectedRequest.name}</strong>
              </p>
              <div className="inspectors-list">
                {inspectors.map((inspector) => (
                  <label key={inspector._id} className="inspector-item">
                    <input
                      type="checkbox"
                      checked={selectedInspectors.includes(inspector._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedInspectors([
                            ...selectedInspectors,
                            inspector._id,
                          ]);
                        } else {
                          setSelectedInspectors(
                            selectedInspectors.filter(
                              (id) => id !== inspector._id
                            )
                          );
                        }
                      }}
                    />
                    <div className="inspector-info">
                      <span className="inspector-name">{inspector.name}</span>
                      <small className="inspector-email">
                        {inspector.email}
                      </small>
                    </div>
                  </label>
                ))}
              </div>
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setAssignModal(false);
                    setSelectedInspectors([]);
                  }}
                >
                  Hủy
                </button>
                <button
                  className="btn-primary"
                  onClick={() => {
                    if (selectedInspectors.length > 0) {
                      handleAssignInspectors(
                        selectedRequest.slug,
                        selectedInspectors
                      );
                    } else {
                      toast.error("Vui lòng chọn ít nhất một inspector");
                    }
                  }}
                  disabled={selectedInspectors.length === 0}
                >
                  Phân công
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCarManagement;
