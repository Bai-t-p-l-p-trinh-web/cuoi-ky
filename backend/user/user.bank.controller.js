const User = require("./user.model");

class UserBankController {
  /**
   * Cập nhật thông tin ngân hàng của user
   */
  async updateBankInfo(req, res) {
    try {
      const userId = req.user.id;
      const { bankName, bankCode, accountNumber, accountHolder } = req.body;

      // Validate required fields
      if (!bankName || !bankCode || !accountNumber || !accountHolder) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp đầy đủ thông tin ngân hàng",
        });
      }

      // Update user bank info
      const user = await User.findByIdAndUpdate(
        userId,
        {
          bankInfo: {
            bankName,
            bankCode,
            accountNumber,
            accountHolder,
            isVerified: false, // Reset verification status
            verifiedAt: null,
          },
        },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user",
        });
      }

      res.json({
        success: true,
        message: "Cập nhật thông tin ngân hàng thành công",
        data: {
          bankInfo: user.bankInfo,
        },
      });
    } catch (error) {
      console.error("Update bank info error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi cập nhật thông tin ngân hàng",
        error: error.message,
      });
    }
  }

  /**
   * Lấy thông tin ngân hàng của user
   */
  async getBankInfo(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId).select("bankInfo");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user",
        });
      }
      res.json({
        success: true,
        bankInfo: user.bankInfo,
      });
    } catch (error) {
      console.error("Get bank info error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi lấy thông tin ngân hàng",
        error: error.message,
      });
    }
  }

  /**
   * Admin xác minh thông tin ngân hàng của user
   */
  async verifyBankInfo(req, res) {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Chỉ admin mới có quyền xác minh",
        });
      }

      const { userId } = req.params;
      const { verified } = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        {
          "bankInfo.isVerified": verified,
          "bankInfo.verifiedAt": verified ? new Date() : null,
        },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user",
        });
      }

      res.json({
        success: true,
        message: `Đã ${
          verified ? "xác minh" : "hủy xác minh"
        } thông tin ngân hàng`,
        data: {
          bankInfo: user.bankInfo,
        },
      });
    } catch (error) {
      console.error("Verify bank info error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi xác minh thông tin ngân hàng",
        error: error.message,
      });
    }
  }

  /**
   * Lấy danh sách users chờ xác minh ngân hàng
   */
  async getPendingVerifications(req, res) {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Chỉ admin mới có quyền xem",
        });
      }

      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const users = await User.find({
        "bankInfo.accountNumber": { $exists: true, $ne: null },
        "bankInfo.isVerified": false,
      })
        .select("fullName email phoneNumber bankInfo createdAt")
        .sort({ "bankInfo.updatedAt": -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await User.countDocuments({
        "bankInfo.accountNumber": { $exists: true, $ne: null },
        "bankInfo.isVerified": false,
      });

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get pending verifications error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi lấy danh sách chờ xác minh",
        error: error.message,
      });
    }
  }
}

module.exports = new UserBankController();
