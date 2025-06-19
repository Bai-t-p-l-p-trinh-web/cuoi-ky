// QR Code generation for Vietnamese banks
const generateVietQR = (amount, transactionId, bankInfo) => {
  const { accountNumber, bankName, accountHolder } = bankInfo;

  // Vietnamese QR Code format (VietQR standard)
  const qrData = {
    amount: amount * 1000000, // Convert triệu to VND
    addInfo: `COCCOC ${transactionId}`, // Transaction reference
    accountNo: accountNumber,
    bankName: bankName,
    accountName: accountHolder,
  };

  // Generate QR string (simplified - real implementation would use VietQR API)
  const qrString = `https://img.vietqr.io/image/${bankName}-${accountNumber}-compact2.jpg?amount=${qrData.amount}&addInfo=${qrData.addInfo}&accountName=${qrData.accountName}`;

  return qrString;
};

module.exports = { generateVietQR };
