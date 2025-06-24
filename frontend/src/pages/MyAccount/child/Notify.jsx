import { useState, useEffect } from "react";
import "../scss/Notify.scss";
import { notificationAPI } from "../../../utils/axiosConfig";
import { formatTimeStamp } from "../../../utils/formatDate";
import { toast } from "react-toastify";

function Notify() {
  const [notifications, setNotifications] = useState([]);
  const [curPage, setCurPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const notificationsPerPage = 10;

  useEffect(() => {
    getNotifications();
  }, [curPage]);

  const getNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationAPI.list({
        page: curPage,
        limit: notificationsPerPage,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      console.log("Notifications response:", res.data);

      if (res.data.success) {
        const notificationsList =
          res.data.data?.notifications || res.data.data || [];
        const paginationInfo =
          res.data.data?.pagination || res.data.pagination || {};

        setNotifications(notificationsList);
        setTotalPages(
          paginationInfo.pages ||
            Math.ceil(paginationInfo.total / notificationsPerPage) ||
            1
        );
        setUnreadCount(res.data.data?.unreadCount || 0);
      } else {
        setNotifications([]);
        setTotalPages(1);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error(error.response?.data?.message || "Lỗi khi lấy thông báo!");
      setNotifications([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      // Refresh notifications after marking as read
      getNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Lỗi khi đánh dấu đã đọc");
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      getNotifications();
      toast.success("Đã đánh dấu tất cả thông báo đã đọc");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Lỗi khi đánh dấu đã đọc");
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurPage(page);
    }
  };

  return (
    <div className="notify">
      <div className="notify__header">
        <h2 className="notify__title">Thông báo của bạn</h2>
        {unreadCount > 0 && (
          <div className="notify__actions">
            <span className="notify__unread-count">
              {unreadCount} thông báo chưa đọc
            </span>
            <button
              className="notify__mark-all-btn"
              onClick={markAllAsRead}
              disabled={loading}
            >
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="notify__loading">Đang tải thông báo...</div>
      ) : (
        <>
          <div className="notify__list">
            {" "}
            {notifications.map((notification, index) => (
              <div
                className={`notify__item ${
                  !notification.read ? "notify__item--unread" : ""
                }`}
                key={notification._id || index}
              >
                <div className="notify__content-wrapper">
                  <h4 className="notify__title-text">{notification.title}</h4>
                  <p className="notify__content">{notification.message}</p>
                  <span className="notify__date">
                    {formatTimeStamp(notification.createdAt)}
                  </span>
                </div>
                {!notification.read && (
                  <button
                    className="notify__mark-read-btn"
                    onClick={() => markAsRead(notification._id)}
                    title="Đánh dấu đã đọc"
                  >
                    ✓
                  </button>
                )}
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="notify__empty">Không có thông báo nào.</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="notify__pagination">
              <button
                className="notify__pagination-btn"
                onClick={() => goToPage(curPage - 1)}
                disabled={curPage === 1}
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`notify__pagination-btn ${
                    i + 1 === curPage ? "notify__pagination-btn--active" : ""
                  }`}
                  onClick={() => goToPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="notify__pagination-btn"
                onClick={() => goToPage(curPage + 1)}
                disabled={curPage === totalPages}
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Notify;
