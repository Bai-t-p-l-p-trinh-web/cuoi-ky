const axios = require("axios");

class VietQRService {
  constructor() {
    this.baseURL = "https://api.vietqr.io/v2";
    this.banks = {
      970422: "MB Bank",
      970407: "Techcombank",
      970415: "Vietinbank",
      970436: "Vietcombank",
      970405: "Agribank",
      970418: "BIDV",
      970432: "VPBank",
    };
  }

  /**
   * Tạo QR code thanh toán
   * @param {Object} params
   * @param {string} params.bankCode - Mã ngân hàng
   * @param {string} params.accountNumber - Số tài khoản
   * @param {string} params.accountName - Tên chủ tài khoản
   * @param {number} params.amount - Số tiền
   * @param {string} params.description - Nội dung chuyển khoản
   * @param {string} params.template - Template QR (default: "compact")
   */
  async generateQR({
    bankCode = process.env.SYSTEM_BANK_CODE || "970422",
    accountNumber = process.env.SYSTEM_BANK_ACCOUNT_NUMBER,
    accountName = process.env.SYSTEM_BANK_ACCOUNT_NAME,
    amount,
    description,
    template = "compact",
  }) {
    try {
      const payload = {
        accountNo: accountNumber,
        accountName: accountName,
        acqId: bankCode,
        amount: amount,
        addInfo: description,
        format: "text",
        template: template,
      };

      const response = await axios.post(`${this.baseURL}/generate`, payload, {
        headers: {
          "x-client-id": process.env.VIETQR_CLIENT_ID,
          "x-api-key": process.env.VIETQR_API_KEY,
          "Content-Type": "application/json",
        },
      });

      if (response.data.code === "00") {
        return {
          success: true,
          data: {
            qrCode: response.data.data.qrCode,
            qrDataURL: response.data.data.qrDataURL,
            bankCode: bankCode,
            bankName: this.banks[bankCode] || "Unknown Bank",
            accountNumber: accountNumber,
            accountName: accountName,
            amount: amount,
            description: description,
          },
        };
      } else {
        throw new Error(response.data.desc || "Failed to generate QR code");
      }
    } catch (error) {
      console.error("VietQR Error:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Tạo QR code với thông tin đơn hàng
   * @param {Object} order - Thông tin đơn hàng
   * @param {number} amount - Số tiền cần thanh toán
   * @param {string} paymentType - Loại thanh toán (deposit/final/full)
   */
  async generateOrderQR(order, amount, paymentType) {
    const description = this.generatePaymentDescription(order, paymentType);

    return await this.generateQR({
      amount: amount,
      description: description,
    });
  }

  /**
   * Tạo nội dung chuyển khoản
   */
  generatePaymentDescription(order, paymentType) {
    const typeText = {
      deposit: "DAT COC",
      final_payment: "THANH TOAN",
      full_payment: "MUA XE",
    };

    return `${typeText[paymentType]} ${order.orderCode}`;
  }

  /**
   * Lấy danh sách ngân hàng hỗ trợ
   */
  async getSupportedBanks() {
    try {
      const response = await axios.get(`${this.baseURL}/banks`, {
        headers: {
          "x-client-id": process.env.VIETQR_CLIENT_ID,
          "x-api-key": process.env.VIETQR_API_KEY,
        },
      });

      if (response.data.code === "00") {
        return {
          success: true,
          banks: response.data.data,
        };
      } else {
        throw new Error("Failed to get banks list");
      }
    } catch (error) {
      console.error("Get Banks Error:", error.message);
      return {
        success: false,
        error: error.message,
        banks: Object.entries(this.banks).map(([code, name]) => ({
          id: code,
          name: name,
          code: code,
        })),
      };
    }
  }
}

module.exports = new VietQRService();
