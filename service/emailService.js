const nodemailer = require("nodemailer");
const juice = require("juice");
const {
  orderConfirmationTemplate,
} = require("../template/orderConfirmationTemplate");
const {
  paymentConfirmationTemplate,
} = require("../template/paymentConfirmationTemplate");
const {
  verifyConfirmationTemplate,
} = require("../template/verifyConfirmationTemplate");

const { resetPasswordTemplate } = require("../template/resetPasswordTemplate");

// Cấu hình transporter với Gmail
const transporter = nodemailer.createTransport({
  service: "gmail", // Sử dụng dịch vụ Gmail SMTP
  auth: {
    user: "anhtupeo1234@gmail.com", // Địa chỉ email người gửi
    pass: "oloq mijp kwdq qzdh", // Mật khẩu ứng dụng
  },
});

async function sendEmail(data, type) {
  let emailContent;
  console.log(data);

  // Chọn template tùy vào loại email
  if (type === "order") {
    emailContent = orderConfirmationTemplate(data);
  } else if (type === "payment") {
    emailContent = paymentConfirmationTemplate(data);
  } else if (type === "verify") {
    emailContent = verifyConfirmationTemplate(data);
  } else if (type === "reset-password") {
    emailContent = resetPasswordTemplate(data);
  }

  try {
    const finalEmailContent = juice(emailContent);

    // Gửi email
    const info = await transporter.sendMail({
      from: '"Tech4k: Đội ngũ hỗ trợ khách hàng" <anhtupeo1234@gmail.com>', // Địa chỉ email người gửi
      to: data.email, // Địa chỉ email người nhận
      subject:
        type === "order"
          ? "Xác Nhận Đơn Hàng"
          : type === "payment"
          ? "Xác Nhận Thanh Toán"
          : "Xác Minh Tài Khoản",
      html: finalEmailContent, // Nội dung email
    });

    console.log("Email đã gửi:", info.messageId);
  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
  }
}

// Xuất hàm sendEmail để sử dụng trong các file khác
module.exports = { sendEmail };
