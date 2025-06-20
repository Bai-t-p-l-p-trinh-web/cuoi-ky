/**
 * Utility functions for VietQR integration
 */

/**
 * Generate VietQR URL for payment
 * @param {number} amount - Payment amount
 * @param {string} content - Payment content/description
 * @param {Object} options - Optional bank account override
 * @returns {string} VietQR URL
 */
export const generateVietQRUrl = (amount, content, options = {}) => {
  const bankCode = options.bankCode || import.meta.env.VITE_SYSTEM_BANK_CODE;
  const accountNumber =
    options.accountNumber || import.meta.env.VITE_SYSTEM_BANK_ACCOUNT_NUMBER;
  const accountName =
    options.accountName || import.meta.env.VITE_SYSTEM_BANK_ACCOUNT_NAME;

  // Tạo VietQR URL theo chuẩn
  const vietqrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
    content
  )}&accountName=${encodeURIComponent(accountName)}`;

  return vietqrUrl;
};

/**
 * Get bank account info from environment variables
 * @returns {Object} Bank account information
 */
export const getBankAccountInfo = () => {
  return {
    bankCode: import.meta.env.VITE_SYSTEM_BANK_CODE || "970422",
    bankName: import.meta.env.VITE_SYSTEM_BANK_NAME || "MB Bank",
    accountNumber:
      import.meta.env.VITE_SYSTEM_BANK_ACCOUNT_NUMBER || "0345377247",
    accountName:
      import.meta.env.VITE_SYSTEM_BANK_ACCOUNT_NAME || "LAM NHAT TIEN",
  };
};

/**
 * Generate payment content for VietQR
 * @param {string} orderCode - Order code
 * @param {number} amount - Payment amount
 * @param {string} paymentType - Payment type (deposit, full_payment, etc.)
 * @returns {string} Payment content
 */
export const generatePaymentContent = (
  orderCode,
  amount,
  paymentType = "payment"
) => {
  const typeText = {
    deposit: "DAT COC",
    full_payment: "MUA XE",
    final_payment: "THANH TOAN",
    payment: "THANH TOAN",
  };

  return `${typeText[paymentType]} ${orderCode}`;
};

/**
 * Create complete QR data object for payment
 * @param {number} amount - Payment amount
 * @param {string} orderCode - Order code
 * @param {string} paymentType - Payment type
 * @param {Object} options - Optional overrides
 * @returns {Object} Complete QR data object
 */
export const createQRData = (
  amount,
  orderCode,
  paymentType = "payment",
  options = {}
) => {
  const bankInfo = getBankAccountInfo();
  const content = generatePaymentContent(orderCode, amount, paymentType);
  const qrDataURL = generateVietQRUrl(amount, content, options);
  return {
    qrDataURL,
    ...bankInfo,
    content,
    description: content, // Add description alias for backward compatibility
    amount,
    orderCode,
    paymentType,
  };
};
