import React, { useState, useEffect } from "react";
import {
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaUserPlus,
  FaSearch,
  FaFilter,
  FaDownload,
  FaSync,
  FaSortUp,
  FaSortDown,
  FaSort,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./AdminRequestManagement.scss";

const AdminRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    checked: 0,
    rejected: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    dateFrom: "",
    dateTo: "",
    search: "",
    seller: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedRequests, setSelectedRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [currentPage, itemsPerPage, sortField, sortDirection, filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // API call to fetch requests with filters, pagination, and sorting
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        sortField,
        sortDirection,
        ...filters,
      });

      // Mock data for now
      const mockRequests = [
        {
          id: "1",
          name: "Toyota Camry 2020",
          seller: {
            name: "Nguyễn Văn A",
            email: "nguyenvana@email.com",
            phone: "0901234567",
          },
          status: "pending",
          createdAt: "2024-01-15T10:30:00Z",
          year: 2020,
          km: 25000,
          fuel: "gasoline",
          location: "TP. Hồ Chí Minh",
          priority: "high",
        },
        {
          id: "2",
          name: "Honda Civic 2019",
          seller: {
            name: "Trần Thị B",
            email: "tranthib@email.com",
            phone: "0901234568",
          },
          status: "checked",
          createdAt: "2024-01-14T14:20:00Z",
          year: 2019,
          km: 35000,
          fuel: "gasoline",
          location: "Hà Nội",
          priority: "medium",
        },
        // Add more mock data...
      ];

      setRequests(mockRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Lỗi khi tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats data
      setStats({
        total: 156,
        pending: 45,
        checked: 89,
        rejected: 22,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleAssignInspector = async (requestId) => {
    try {
      // Open modal to select inspector
      toast.info("Chức năng phân công thanh tra viên đang được phát triển");
    } catch (error) {
      toast.error("Lỗi khi phân công thanh tra viên");
    }
  };

  const handleApprove = async (requestId) => {
    try {
      // API call to approve request
      toast.success("Đã duyệt yêu cầu thành công");
      fetchRequests();
    } catch (error) {
      toast.error("Lỗi khi duyệt yêu cầu");
    }
  };

  const handleReject = async (requestId) => {
    try {
      // API call to reject request
      toast.success("Đã từ chối yêu cầu");
      fetchRequests();
    } catch (error) {
      toast.error("Lỗi khi từ chối yêu cầu");
    }
  };

  const handleViewRequest = (requestId) => {
    // Navigate to request detail page
    toast.info("Chức năng xem chi tiết đang được phát triển");
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      status: "",
      dateFrom: "",
      dateTo: "",
      search: "",
      seller: "",
    });
    setCurrentPage(1);
  };

  const handleExportData = () => {
    toast.info("Chức năng xuất dữ liệu đang được phát triển");
  };

  const handleSelectRequest = (requestId) => {
    setSelectedRequests((prev) => {
      if (prev.includes(requestId)) {
        return prev.filter((id) => id !== requestId);
      } else {
        return [...prev, requestId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === requests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(requests.map((req) => req.id));
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "Chờ duyệt", class: "pending", icon: <FaClock /> },
      checked: { label: "Đã duyệt", class: "checked", icon: <FaCheckCircle /> },
      rejected: {
        label: "Từ chối",
        class: "rejected",
        icon: <FaTimesCircle />,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`status-badge ${config.class}`}>
        <span className="status-dot"></span>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { label: "Cao", class: "high" },
      medium: { label: "Trung bình", class: "medium" },
      low: { label: "Thấp", class: "low" },
    };

    const config = priorityConfig[priority] || priorityConfig.medium;
    return (
      <span className={`priority-badge ${config.class}`}>{config.label}</span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, requests.length);

  return (
    <div className="admin-request-management">
      {/* Page Header */}
      <div className="page-header">
        <h1>Quản lý yêu cầu đăng bán</h1>
        <p>Quản lý và duyệt các yêu cầu đăng bán xe từ người dùng</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card total">
          <div className="stat-icon">
            <FaClipboardList />
          </div>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Tổng yêu cầu</div>
          <div className="stat-change neutral">+12% từ tháng trước</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Chờ duyệt</div>
          <div className="stat-change positive">+5% từ tuần trước</div>
        </div>
        <div className="stat-card checked">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-number">{stats.checked}</div>
          <div className="stat-label">Đã duyệt</div>
          <div className="stat-change positive">+8% từ tuần trước</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-icon">
            <FaTimesCircle />
          </div>
          <div className="stat-number">{stats.rejected}</div>
          <div className="stat-label">Từ chối</div>
          <div className="stat-change negative">-2% từ tuần trước</div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-header">
          <h3>Bộ lọc tìm kiếm</h3>
          <button className="filter-toggle">Ẩn bộ lọc</button>
        </div>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tên xe, người bán..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="checked">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Người bán</label>
            <input
              type="text"
              placeholder="Tên hoặc email người bán"
              value={filters.seller}
              onChange={(e) => handleFilterChange("seller", e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Thời gian</label>
            <div className="date-range">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              />
              <span>đến</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="filter-actions">
          <button className="btn btn-apply" onClick={fetchRequests}>
            <FaSearch /> Tìm kiếm
          </button>
          <button className="btn btn-reset" onClick={handleResetFilters}>
            Đặt lại
          </button>
          <button className="btn btn-export" onClick={handleExportData}>
            <FaDownload /> Xuất Excel
          </button>
          <div className="results-count">
            Tìm thấy {requests.length} yêu cầu
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="requests-table-container">
        <div className="table-header">
          <h3>Danh sách yêu cầu</h3>
          <div className="table-actions">
            <button className="btn btn-refresh" onClick={fetchRequests}>
              <FaSync /> Làm mới
            </button>
            <button
              className="btn btn-bulk-action"
              disabled={selectedRequests.length === 0}
            >
              Thao tác hàng loạt ({selectedRequests.length})
            </button>
            <div className="view-options">
              <button className="view-btn active">Bảng</button>
              <button className="view-btn">Thẻ</button>
            </div>
          </div>
        </div>

        <div className="table-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📋</div>
              <h3>Không có yêu cầu nào</h3>
              <p>Chưa có yêu cầu đăng bán xe nào được tạo</p>
            </div>
          ) : (
            <>
              <table className="requests-table">
                <thead>
                  <tr>
                    <th className="checkbox-col">
                      <input
                        type="checkbox"
                        checked={selectedRequests.length === requests.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="sortable" onClick={() => handleSort("name")}>
                      Thông tin xe {getSortIcon("name")}
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSort("seller")}
                    >
                      Người bán {getSortIcon("seller")}
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSort("status")}
                    >
                      Trạng thái {getSortIcon("status")}
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSort("priority")}
                    >
                      Độ ưu tiên {getSortIcon("priority")}
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSort("createdAt")}
                    >
                      Ngày tạo {getSortIcon("createdAt")}
                    </th>
                    <th className="actions-col">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.slice(startIndex, endIndex).map((request) => (
                    <tr
                      key={request.id}
                      className={
                        selectedRequests.includes(request.id) ? "selected" : ""
                      }
                    >
                      <td className="checkbox-col">
                        <input
                          type="checkbox"
                          checked={selectedRequests.includes(request.id)}
                          onChange={() => handleSelectRequest(request.id)}
                        />
                      </td>
                      <td className="request-info">
                        <div className="request-title">{request.name}</div>
                        <div className="request-meta">
                          <div className="meta-item">
                            <span className="icon">🗓</span>
                            <span>{request.year}</span>
                          </div>
                          <div className="meta-item">
                            <span className="icon">🛣</span>
                            <span>{request.km.toLocaleString()} km</span>
                          </div>
                          <div className="meta-item">
                            <span className="icon">⛽</span>
                            <span>{request.fuel}</span>
                          </div>
                          <div className="meta-item">
                            <span className="icon">📍</span>
                            <span>{request.location}</span>
                          </div>
                        </div>
                      </td>
                      <td className="seller-info">
                        <div className="seller-name">{request.seller.name}</div>
                        <div className="seller-contact">
                          {request.seller.email}
                          <br />
                          {request.seller.phone}
                        </div>
                      </td>
                      <td className="status-col">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="priority-col">
                        {getPriorityBadge(request.priority)}
                      </td>
                      <td>{formatDate(request.createdAt)}</td>
                      <td className="actions-col">
                        <div className="action-buttons">
                          <button
                            className="btn btn-view"
                            onClick={() => handleViewRequest(request.id)}
                            title="Xem chi tiết"
                          >
                            <FaEye />
                          </button>
                          {request.status === "pending" && (
                            <button
                              className="btn btn-assign"
                              onClick={() => handleAssignInspector(request.id)}
                              title="Phân công thanh tra"
                            >
                              <FaUserPlus />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="table-pagination">
                <div className="pagination-info">
                  Hiển thị{" "}
                  <span className="current-range">
                    {startIndex + 1}-{endIndex}
                  </span>{" "}
                  của {requests.length} yêu cầu
                </div>
                <div className="pagination-controls">
                  <button
                    className="page-btn prev"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    ‹ Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        className={`page-btn ${
                          currentPage === page ? "active" : ""
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    className="page-btn next"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Sau ›
                  </button>
                </div>
                <div className="page-size-selector">
                  <span>Hiển thị:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>/ trang</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRequestManagement;
