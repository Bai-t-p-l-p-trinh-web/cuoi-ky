const PDFDocument = require("pdfkit");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const fs = require("fs");
const path = require("path");

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class ContractService {
  constructor() {
    this.contractsDir = path.join(__dirname, "../contracts");
    this.ensureContractsDir();
  }

  ensureContractsDir() {
    if (!fs.existsSync(this.contractsDir)) {
      fs.mkdirSync(this.contractsDir, { recursive: true });
    }
  }
  /**
   * Tạo hợp đồng PDF cho đơn hàng
   * @param {Object} order - Thông tin đơn hàng (populated)
   * @param {Object} payment - Thông tin thanh toán
   */
  async generateContract(order, payment) {
    try {
      const fileName = `contract_${order.orderCode}_${Date.now()}.pdf`;

      // Tạo PDF buffer thay vì file
      const buffers = [];
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        info: {
          Title: `Hợp đồng mua bán xe ${order.orderCode}`,
          Author: "Car Trading Platform",
          Subject: "Hợp đồng mua bán xe ô tô",
          Creator: "Car Trading Platform",
        },
      });

      // Collect PDF data into buffer
      doc.on("data", buffers.push.bind(buffers));

      // Promise để đợi PDF hoàn thành
      const pdfPromise = new Promise((resolve) => {
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
      });

      // Header
      this.addHeader(doc);

      // Contract title
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("HỢP ĐỒNG MUA BÁN XE Ô TÔ", { align: "center" })
        .moveDown();

      doc
        .fontSize(14)
        .font("Helvetica")
        .text(`Số hợp đồng: ${order.orderCode}`, { align: "center" })
        .text(`Ngày lập: ${new Date().toLocaleDateString("vi-VN")}`, {
          align: "center",
        })
        .moveDown(2);

      // Thông tin các bên
      this.addPartyInfo(doc, order);

      // Thông tin xe
      this.addCarInfo(doc, order.car);

      // Thông tin thanh toán
      this.addPaymentInfo(doc, order, payment);

      // Điều khoản
      this.addTermsAndConditions(doc);

      // Chữ ký
      this.addSignatureSection(doc);

      // Footer
      this.addFooter(doc);

      doc.end();

      // Đợi PDF hoàn thành
      const pdfBuffer = await pdfPromise;

      // Upload lên Cloudinary
      const cloudinaryResult = await this.uploadPdfToCloudinary(
        pdfBuffer,
        fileName
      );

      return {
        success: true,
        fileName: fileName,
        cloudinaryUrl: cloudinaryResult.secure_url,
        cloudinaryPublicId: cloudinaryResult.public_id,
        fileSize: cloudinaryResult.bytes,
        contractData: {
          orderId: order._id,
          orderCode: order.orderCode,
          generatedAt: new Date(),
          downloadUrl: cloudinaryResult.secure_url,
        },
      };
    } catch (error) {
      console.error("Contract generation error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  addHeader(doc) {
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("NỀN TẢNG MUA BÁN XE Ô TÔ", 50, 50)
      .fontSize(10)
      .font("Helvetica")
      .text("Website: " + process.env.CLIENT_URL, 50, 70)
      .text("Email: support@cartradingplatform.com", 50, 85)
      .text("Hotline: 1900-xxxx", 50, 100)
      .moveDown(2);
  }

  addPartyInfo(doc, order) {
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("I. THÔNG TIN CÁC BÊN THAM GIA", { underline: true })
      .moveDown();

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("BÊN BÁN (Bên A):")
      .font("Helvetica")
      .text(`Họ tên: ${order.seller.fullName}`)
      .text(`Số điện thoại: ${order.seller.phoneNumber}`)
      .text(`Email: ${order.seller.email}`)
      .text(`Địa chỉ: ${order.seller.address || "Chưa cập nhật"}`)
      .moveDown();

    doc
      .font("Helvetica-Bold")
      .text("BÊN MUA (Bên B):")
      .font("Helvetica")
      .text(`Họ tên: ${order.buyer.fullName}`)
      .text(`Số điện thoại: ${order.buyer.phoneNumber}`)
      .text(`Email: ${order.buyer.email}`)
      .text(`Địa chỉ: ${order.buyer.address || "Chưa cập nhật"}`)
      .moveDown(2);
  }

  addCarInfo(doc, car) {
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("II. THÔNG TIN XE Ô TÔ", { underline: true })
      .moveDown();

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Tên xe: ${car.name}`)
      .text(`Hãng: ${car.brand}`)
      .text(`Năm sản xuất: ${car.year}`)
      .text(`Biển số: ${car.licensePlate || "Chưa có"}`)
      .text(`Số km đã đi: ${car.mileage?.toLocaleString("vi-VN")} km`)
      .text(`Tình trạng: ${car.condition}`)
      .text(`Mô tả: ${car.description || "Không có"}`)
      .moveDown(2);
  }

  addPaymentInfo(doc, order, payment) {
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("III. THÔNG TIN THANH TOÁN", { underline: true })
      .moveDown();

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Tổng giá trị xe: ${order.totalAmount.toLocaleString("vi-VN")} VNĐ`)
      .text(
        `Phương thức thanh toán: ${this.getPaymentMethodText(
          order.paymentMethod
        )}`
      );

    if (order.paymentMethod === "deposit") {
      doc
        .text(
          `Số tiền đặt cọc: ${order.depositAmount.toLocaleString("vi-VN")} VNĐ`
        )
        .text(
          `Số tiền còn lại: ${order.remainingAmount.toLocaleString(
            "vi-VN"
          )} VNĐ`
        );
    }

    doc
      .text(`Đã thanh toán: ${order.paidAmount.toLocaleString("vi-VN")} VNĐ`)
      .text(`Ngày thanh toán: ${payment.createdAt.toLocaleDateString("vi-VN")}`)
      .moveDown(2);
  }

  addTermsAndConditions(doc) {
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("IV. ĐIỀU KHOẢN VÀ ĐIỀU KIỆN", { underline: true })
      .moveDown();

    const terms = [
      "1. Bên A cam kết xe đúng như mô tả, có đầy đủ giấy tờ pháp lý.",
      "2. Bên B có quyền kiểm tra xe trước khi nhận và thanh toán.",
      "3. Việc chuyển nhượng sở hữu xe sẽ được thực hiện sau khi hoàn tất thanh toán.",
      "4. Mọi tranh chấp sẽ được giải quyết thông qua nền tảng hoặc pháp luật Việt Nam.",
      "5. Hợp đồng có hiệu lực kể từ ngày ký và thanh toán.",
      "6. Nền tảng chỉ đóng vai trò trung gian, không chịu trách nhiệm về chất lượng xe.",
      "7. Phí dịch vụ nền tảng: 2% giá trị giao dịch (tối đa 5,000,000 VNĐ).",
    ];

    doc.fontSize(12).font("Helvetica");

    terms.forEach((term) => {
      doc.text(term, { align: "justify" }).moveDown(0.5);
    });

    doc.moveDown();
  }

  addSignatureSection(doc) {
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("V. CHỮ KÝ XÁC NHẬN", { underline: true })
      .moveDown(2);

    const currentY = doc.y;

    // Seller signature
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("BÊN BÁN (Bên A)", 80, currentY)
      .font("Helvetica")
      .text("(Ký và ghi rõ họ tên)", 80, currentY + 15)
      .moveDown(3)
      .text("_____________________", 80);

    // Buyer signature
    doc
      .font("Helvetica-Bold")
      .text("BÊN MUA (Bên B)", 350, currentY)
      .font("Helvetica")
      .text("(Ký và ghi rõ họ tên)", 350, currentY + 15)
      .moveDown(3)
      .text("_____________________", 350);

    doc.moveDown(4);
  }

  addFooter(doc) {
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Hợp đồng được tạo tự động bởi hệ thống nền tảng mua bán xe", {
        align: "center",
      })
      .text(`Thời gian tạo: ${new Date().toLocaleString("vi-VN")}`, {
        align: "center",
      });
  }

  getPaymentMethodText(method) {
    const methods = {
      deposit: "Đặt cọc trước",
      full_payment: "Thanh toán toàn bộ",
      direct_transaction: "Giao dịch trực tiếp",
    };
    return methods[method] || method;
  }

  /**
   * Xóa hợp đồng cũ (cleanup)
   */
  async cleanupOldContracts(daysOld = 30) {
    try {
      const files = fs.readdirSync(this.contractsDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let deletedCount = 0;

      files.forEach((file) => {
        const filePath = path.join(this.contractsDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      });

      return {
        success: true,
        deletedCount: deletedCount,
      };
    } catch (error) {
      console.error("Contract cleanup error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Upload PDF to Cloudinary
   */
  uploadPdfToCloudinary(buffer, fileName) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "contracts",
          public_id: fileName.replace(".pdf", ""),
          format: "pdf",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }
}

module.exports = new ContractService();
