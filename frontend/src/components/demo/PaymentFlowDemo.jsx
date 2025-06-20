import React, { useState } from "react";
import AdminPaymentFlow from "../admin/AdminPaymentFlow";
import PaymentFlowTracker from "../order/PaymentFlowTracker";
import "./PaymentFlowDemo.scss";

const PaymentFlowDemo = () => {
  const [activeTab, setActiveTab] = useState("admin");
  const [demoOrderId, setDemoOrderId] = useState("");
  const [userRole, setUserRole] = useState("buyer");

  return (
    <div className="payment-flow-demo">
      <div className="demo-header">
        <h1>Payment Flow System Demo</h1>
        <p>Hệ thống quản lý luồng thanh toán từ buyer → admin → seller</p>
      </div>

      <div className="demo-tabs">
        <button
          className={`tab ${activeTab === "admin" ? "active" : ""}`}
          onClick={() => setActiveTab("admin")}
        >
          Admin Panel
        </button>
        <button
          className={`tab ${activeTab === "user" ? "active" : ""}`}
          onClick={() => setActiveTab("user")}
        >
          User Flow Tracker
        </button>
        <button
          className={`tab ${activeTab === "flow" ? "active" : ""}`}
          onClick={() => setActiveTab("flow")}
        >
          Flow Description
        </button>
      </div>

      <div className="demo-content">
        {activeTab === "admin" && (
          <div className="admin-section">
            <h2>Admin Payment Management</h2>
            <p>
              Quản lý tất cả các thanh toán và thực hiện các bước trong luồng
            </p>
            <AdminPaymentFlow />
          </div>
        )}

        {activeTab === "user" && (
          <div className="user-section">
            <h2>User Payment Flow Tracker</h2>
            <div className="user-controls">
              <div className="control-group">
                <label>Order ID để test:</label>
                <input
                  type="text"
                  value={demoOrderId}
                  onChange={(e) => setDemoOrderId(e.target.value)}
                  placeholder="Nhập Order ID"
                  className="form-control"
                />
              </div>
              <div className="control-group">
                <label>Role:</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="form-control"
                >
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
              </div>
            </div>

            {demoOrderId && (
              <PaymentFlowTracker orderId={demoOrderId} userRole={userRole} />
            )}
          </div>
        )}

        {activeTab === "flow" && (
          <div className="flow-section">
            <h2>Payment Flow Description</h2>
            <div className="flow-steps">
              <div className="flow-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Admin xác nhận nhận tiền</h3>
                  <p>
                    Admin kiểm tra ngân hàng và xác nhận đã nhận được tiền từ
                    buyer
                  </p>
                  <ul>
                    <li>Admin vào ngân hàng check transaction</li>
                    <li>Nhập mã giao dịch và ghi chú</li>
                    <li>Payment status: PENDING → ADMIN_CONFIRMED</li>
                  </ul>
                </div>
              </div>

              <div className="flow-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Thông báo buyer và seller</h3>
                  <p>
                    Hệ thống gửi thông báo cho cả buyer và seller về việc đã
                    nhận tiền
                  </p>
                  <ul>
                    <li>Gửi notification cho buyer</li>
                    <li>Gửi notification cho seller</li>
                    <li>
                      Payment status: ADMIN_CONFIRMED → BUYER_SELLER_NOTIFIED
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flow-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Sắp xếp cuộc gặp</h3>
                  <p>
                    Buyer và seller trao đổi để sắp xếp địa điểm và thời gian
                    gặp nhau
                  </p>
                  <ul>
                    <li>Buyer hoặc seller tạo meeting schedule</li>
                    <li>Nhập địa điểm, thời gian, ghi chú</li>
                    <li>Order status: PENDING_MEETING → MEETING_SCHEDULED</li>
                  </ul>
                </div>
              </div>

              <div className="flow-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Xác nhận trao đổi</h3>
                  <p>
                    Sau khi gặp nhau và trao đổi xe, cả hai bên xác nhận thành
                    công
                  </p>
                  <ul>
                    <li>Buyer xác nhận đã nhận xe</li>
                    <li>Seller xác nhận đã giao xe</li>
                    <li>
                      Payment status: EXCHANGE_IN_PROGRESS → EXCHANGE_COMPLETED
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flow-step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h3>Admin chuyển tiền cho seller</h3>
                  <p>
                    Admin thực hiện chuyển tiền vào tài khoản ngân hàng của
                    seller
                  </p>
                  <ul>
                    <li>Admin kiểm tra thông tin ngân hàng seller</li>
                    <li>Thực hiện chuyển khoản</li>
                    <li>Nhập mã tham chiếu và chứng từ</li>
                    <li>Payment status: EXCHANGE_COMPLETED → COMPLETED</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flow-benefits">
              <h3>Lợi ích của hệ thống:</h3>
              <ul>
                <li>✅ Bảo mật cao: Admin kiểm soát toàn bộ luồng tiền</li>
                <li>✅ Minh bạch: Tất cả bên đều thấy được trạng thái</li>
                <li>
                  ✅ An toàn: Tiền chỉ được chuyển khi cả hai bên xác nhận
                </li>
                <li>✅ Theo dõi: Log đầy đủ mọi thao tác</li>
                <li>✅ Linh hoạt: Có thể xử lý dispute và refund</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentFlowDemo;
