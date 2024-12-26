// template/verifyConfirmationTemplate.js
const verifyConfirmationTemplate = (data) => {
  return `
      <html>
        <head>
          <style>
            /* Các style inline cho email */
            body {
              font-family: Arial, sans-serif;
              color: #333;
              line-height: 1.6;
            }
            .content {
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f8f8;
              border-radius: 8px;
              width: 80%;
            }
            .button {
              background-color: #007bff;
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 5px;
              display: inline-block;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="content">
            <h2>Xác Minh Tài Khoản</h2>
            <p>Chào ${data.email},</p>
            <p>Chúng tôi đã nhận được yêu cầu đăng ký tài khoản của bạn. Để hoàn tất quá trình đăng ký, vui lòng nhấp vào nút bên dưới để xác minh tài khoản của bạn:</p>
            <a href="${data.url}" class="button">Xác Minh Tài Khoản</a>
            <p>Nếu bạn không yêu cầu xác minh tài khoản, vui lòng bỏ qua email này.</p>
          </div>
        </body>
      </html>
    `;
};

module.exports = { verifyConfirmationTemplate };
