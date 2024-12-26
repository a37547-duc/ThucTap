// file: ../template/resetPasswordTemplate.js

function resetPasswordTemplate(data) {
  return `
      <html>
        <head>
          <style>
            /* Các style CSS của bạn */
          </style>
        </head>
        <body>
          <h1>Xác Nhận Thay Đổi Mật Khẩu</h1>
          <p>Xin chào ${data.email},</p>
          <p>Chúng tôi nhận được yêu cầu thay đổi mật khẩu cho tài khoản của bạn.</p>
          <p>Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu:</p>
          <a href="${data.resetLink}">Đặt lại mật khẩu</a>
          <p>Trân trọng,</p>
          <p>Đội ngũ hỗ trợ khách hàng của Tech4k</p>
        </body>
      </html>
    `;
}

module.exports = { resetPasswordTemplate };
