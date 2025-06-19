import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaBan,
  FaCheckCircle,
  FaUserPlus,
  FaEye,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { adminAPI } from "../../../utils/axiosConfig";
import "./AdminUserManagement.scss";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: usersPerPage,
        search: searchTerm,
        role: filterRole,
        status: filterStatus,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const response = await adminAPI.getUsers(params);

      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalUsers(response.data.data.pagination.totalUsers);
      } else {
        toast.error("Không thể tải danh sách người dùng");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleRoleFilter = (role) => {
    setFilterRole(role);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user._id));
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const response = await adminAPI.getUserDetail(userId);
      if (response.data.success) {
        setSelectedUser(response.data.data);
        setShowUserModal(true);
      }
    } catch (error) {
      toast.error("Không thể tải thông tin người dùng");
    }
  };
  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      const response = await adminAPI.updateUserStatus(userId, {
        status: newStatus,
      });
      if (response.data.success) {
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, status: newStatus } : user
          )
        );
        toast.success(`Đã cập nhật trạng thái người dùng thành ${newStatus}`);
      }
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái người dùng");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        const response = await adminAPI.deleteUser(userId);
        if (response.data.success) {
          setUsers((prev) => prev.filter((user) => user._id !== userId));
          toast.success("Đã xóa người dùng");
          fetchUsers(); // Refresh the list
        }
      } catch (error) {
        toast.error("Không thể xóa người dùng");
      }
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một người dùng");
      return;
    }

    try {
      switch (action) {
        case "ban":
          for (const userId of selectedUsers) {
            await adminAPI.updateUserStatus(userId, { status: "banned" });
          }
          fetchUsers();
          toast.success("Đã khóa các tài khoản được chọn");
          break;
        case "activate":
          for (const userId of selectedUsers) {
            await adminAPI.updateUserStatus(userId, { status: "active" });
          }
          fetchUsers();
          toast.success("Đã kích hoạt các tài khoản được chọn");
          break;
        default:
          break;
      }
      setSelectedUsers([]);
    } catch (error) {
      toast.error("Không thể thực hiện hành động");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getRoleLabel = (role) => {
    const roleLabels = {
      admin: "Quản trị viên",
      seller: "Người bán",
      buyer: "Người mua",
    };
    return roleLabels[role] || role;
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      active: "Hoạt động",
      banned: "Đã khóa",
      inactive: "Không hoạt động",
    };
    return statusLabels[status] || status;
  };

  if (loading) {
    return (
      <div className="admin-user-management loading">
        <div className="loading-spinner">Đang tải danh sách người dùng...</div>
      </div>
    );
  }

  return (
    <div className="admin-user-management">
      <div className="page-header">
        <h1>Quản lý người dùng</h1>
        <button className="btn-primary">
          <FaUserPlus />
          Thêm người dùng
        </button>
      </div>
      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterRole}
            onChange={(e) => handleRoleFilter(e.target.value)}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="seller">Người bán</option>
            <option value="buyer">Người mua</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => handleStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="banned">Đã khóa</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>
      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bulk-actions">
          <span>Đã chọn {selectedUsers.length} người dùng</span>
          <div className="bulk-buttons">
            <button
              className="btn-warning"
              onClick={() => handleBulkAction("ban")}
            >
              <FaBan />
              Khóa tài khoản
            </button>
            <button
              className="btn-success"
              onClick={() => handleBulkAction("unban")}
            >
              <FaCheckCircle />
              Kích hoạt
            </button>
          </div>
        </div>
      )}
      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedUsers.length === users.length && users.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th>Người dùng</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tham gia</th>
              <th>Hoạt động cuối</th>
              <th>Thống kê</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  {" "}
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => handleSelectUser(user._id)}
                  />
                </td>
                <td>
                  <div className="user-info">
                    <img
                      src={user.avatar || "/avatar.jpg"}
                      alt={user.name}
                      className="user-avatar"
                    />
                    <div>
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                      <div className="user-phone">{user.phone}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {getStatusLabel(user.status)}
                  </span>
                </td>
                <td>{formatDate(user.joinDate)}</td>
                <td>{formatDate(user.lastActivity)}</td>
                <td>
                  <div className="user-stats">
                    {(user.role === "buyer" || user.role === "user") && (
                      <>
                        <div>Đơn hàng: {user.totalOrders}</div>
                        <div>Chi tiêu: {formatCurrency(user.totalSpent)}</div>
                      </>
                    )}
                    {user.role === "seller" && (
                      <>
                        <div>Xe đăng: {user.totalCarsPosted}</div>
                        <div>Doanh thu: {formatCurrency(user.totalSales)}</div>
                      </>
                    )}
                  </div>
                </td>
                <td>
                  {" "}
                  <div className="action-buttons">
                    <button
                      className="btn-info"
                      onClick={() => handleViewUser(user._id)}
                      title="Xem chi tiết"
                    >
                      <FaEye />
                    </button>
                    <button className="btn-secondary" title="Chỉnh sửa">
                      <FaEdit />
                    </button>
                    {user.status === "active" ? (
                      <button
                        className="btn-warning"
                        onClick={() =>
                          handleUpdateUserStatus(user._id, "banned")
                        }
                        title="Khóa tài khoản"
                      >
                        <FaBan />
                      </button>
                    ) : (
                      <button
                        className="btn-success"
                        onClick={() =>
                          handleUpdateUserStatus(user._id, "active")
                        }
                        title="Kích hoạt tài khoản"
                      >
                        <FaCheckCircle />
                      </button>
                    )}
                    <button
                      className="btn-danger"
                      onClick={() => handleDeleteUser(user._id)}
                      title="Xóa người dùng"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>{" "}
      {/* Pagination */}
      <div className="pagination">
        <div className="pagination-info">
          Hiển thị {(currentPage - 1) * usersPerPage + 1}-
          {Math.min(currentPage * usersPerPage, totalUsers)}
          trong tổng số {totalUsers} người dùng
        </div>
        <div className="pagination-buttons">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Trước
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }
            return (
              <button
                key={pageNumber}
                className={currentPage === pageNumber ? "active" : ""}
                onClick={() => setCurrentPage(pageNumber)}
              >
                {pageNumber}
              </button>
            );
          })}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Sau
          </button>
        </div>
      </div>
      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết người dùng</h3>
              <button
                className="close-btn"
                onClick={() => setShowUserModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="user-detail">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="user-avatar-large"
                />
                <div className="user-detail-info">
                  <h4>{selectedUser.name}</h4>
                  <p>
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong> {selectedUser.phone}
                  </p>
                  <p>
                    <strong>Vai trò:</strong> {getRoleLabel(selectedUser.role)}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    {getStatusLabel(selectedUser.status)}
                  </p>
                  <p>
                    <strong>Ngày tham gia:</strong>{" "}
                    {formatDate(selectedUser.joinDate)}
                  </p>
                  <p>
                    <strong>Hoạt động cuối:</strong>{" "}
                    {formatDate(selectedUser.lastActivity)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
