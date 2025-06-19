import React, { useState, useEffect } from "react";
import { notificationAPI } from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import "./NotificationCenter.scss";

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        limit: 20,
        ...(filter === "unread" && { read: false }),
        ...(filter === "read" && { read: true }),
      };

      const response = await notificationAPI.list(params);
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
    setLoading(false);
  };

  const markAsRead = async (notification) => {
    if (notification.read) return;

    try {
      await notificationAPI.markAsRead(notification._id);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("Đã đánh dấu tất cả thông báo đã đọc");
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.delete(notificationId);

      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      toast.success("Đã xóa thông báo");
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      order_created: "🛒",
      payment_received: "💰",
      payment_confirmed: "✅",
      payment_verified: "✅",
      payment_rejected: "❌",
      order_cancelled: "❌",
      delivery_started: "🚚",
      delivery_confirmed: "📦",
      order_completed: "🎉",
      refund_requested: "💸",
      refund_approved: "✅",
      refund_rejected: "❌",
      refund_completed: "💵",
      new_message: "💬",
      new_chat: "💬",
      car_approved: "🚗",
      car_rejected: "❌",
      car_featured: "⭐",
      car_expired: "⏰",
      account_verified: "✅",
      account_suspended: "🚫",
      password_changed: "🔐",
      maintenance: "🔧",
      update: "🔄",
      promotion: "🎁",
      reminder: "⏰",
      warning: "⚠️",
    };
    return icons[type] || "📢";
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority}`;
  };

  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInMinutes = Math.floor((now - notifDate) / (1000 * 60));

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    if (diffInMinutes < 10080)
      return `${Math.floor(diffInMinutes / 1440)} ngày trước`;

    return notifDate.toLocaleDateString("vi-VN");
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification);

    // Navigate to related page based on notification type
    if (notification.metadata?.orderId) {
      // Navigate to order detail
      window.location.href = `/orders/${notification.metadata.orderId}`;
    } else if (notification.metadata?.carId) {
      // Navigate to car detail
      window.location.href = `/cars/${notification.metadata.carId}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-center">
      <div className="notification-overlay" onClick={onClose}></div>

      <div className="notification-panel">
        <div className="notification-header">
          <h3>Thông báo</h3>
          <div className="header-actions">
            {unreadCount > 0 && (
              <button
                className="mark-all-read"
                onClick={markAllAsRead}
                title="Đánh dấu tất cả đã đọc"
              >
                ✅ Đọc tất cả
              </button>
            )}
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="notification-filters">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            Tất cả
          </button>
          <button
            className={filter === "unread" ? "active" : ""}
            onClick={() => setFilter("unread")}
          >
            Chưa đọc ({unreadCount})
          </button>
          <button
            className={filter === "read" ? "active" : ""}
            onClick={() => setFilter("read")}
          >
            Đã đọc
          </button>
        </div>

        <div className="notification-list">
          {loading ? (
            <div className="loading">Đang tải thông báo...</div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <p>Không có thông báo nào</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-item ${
                  !notification.read ? "unread" : ""
                } ${getPriorityClass(notification.priority)}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="notification-content">
                  <div className="notification-title">
                    {notification.title}
                    {!notification.read && <span className="unread-dot"></span>}
                  </div>
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  <div className="notification-time">
                    {formatDate(notification.createdAt)}
                  </div>
                </div>

                <div className="notification-actions">
                  {notification.priority === "high" && (
                    <span className="priority-badge">Quan trọng</span>
                  )}

                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                    title="Xóa thông báo"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {pagination.total > 1 && (
          <div className="notification-pagination">
            <button
              disabled={pagination.current === 1}
              onClick={() => {
                // Load previous page
              }}
            >
              ← Trước
            </button>

            <span>
              {pagination.current} / {pagination.total}
            </span>

            <button
              disabled={pagination.current === pagination.total}
              onClick={() => {
                // Load next page
              }}
            >
              Sau →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
