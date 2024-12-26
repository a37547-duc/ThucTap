const orderConfirmationTemplate = (data) => {
  const {
    email,
    orderId,
    totalAmount,
    products,
    shippingInfo,
    discount,
    finalAmount,
    orderDate,
    paymentMethod,
    id,
  } = data;

  // Xử lý mảng products để tạo HTML cho từng sản phẩm
  const productHtml = products
    .map(
      (product) => ` 
      <p><strong>${product.name}</strong> (Số lượng: ${product.quantity} x ${product.price} VND)</p>
      <img src="${product.image}" alt="${product.name}" width="100px">
    `
    )
    .join("");

  // Hiển thị thông tin giao hàng
  const shippingHtml = `
      <p><strong>Họ và tên:</strong> ${shippingInfo.fullName}</p>
      <p><strong>Điện thoại:</strong> ${shippingInfo.phone}</p>
      <p><strong>Địa chỉ:</strong> ${shippingInfo.address}, ${shippingInfo.ward}, ${shippingInfo.district}, ${shippingInfo.city}</p>
    `;

  return `
      <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 20px;">
            <tr>
              <td style="text-align: center; padding-bottom: 20px;">
                <h1 style="font-size: 24px; color: #333333; margin: 0;">Xác Nhận Đơn Hàng</h1>
              </td>
            </tr>
            <tr>
              <td style="font-size: 16px; color: #333333;">
                <p>Xin chào <strong>${email}</strong>,</p>
                <p>Cảm ơn bạn đã tin tưởng và đặt hàng tại cửa hàng của chúng tôi. Dưới đây là các chi tiết đơn hàng của bạn:</p>
              </td>
            </tr>
            <tr>
              <td>
                <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                  <tr>
                    <th style="padding: 10px; background-color: #f1f1f1; text-align: left; font-weight: bold; color: #333333;">Mã đơn hàng</th>
                    <td style="padding: 10px; border: 1px solid #dddddd; color: #333333;">${id}</td>
                  </tr>
                  <tr>
                  <th style="padding: 10px; background-color: #f1f1f1; text-align: left; font-weight: bold; color: #333333;">Ngày tạo</th>
                  <td style="padding: 10px; border: 1px solid #dddddd; color: #333333;">${orderDate}</td>
                </tr>
                <tr>
                  <th style="padding: 10px; background-color: #f1f1f1; text-align: left; font-weight: bold; color: #333333;">Phương thức thanh toán</th>
                  <td style="padding: 10px; border: 1px solid #dddddd; color: #333333;">${paymentMethod}</td>
                </tr>
                  <tr>
                    <th style="padding: 10px; background-color: #f1f1f1; text-align: left; font-weight: bold; color: #333333;">Tổng tiền</th>
                    <td style="padding: 10px; border: 1px solid #dddddd; color: #333333;">${totalAmount} VND</td>
  
                  </tr>
                  <tr>
                  <th style="padding: 10px; background-color: #f1f1f1; text-align: left; font-weight: bold; color: #333333;">Giarm giá</th>
                  <td style="padding: 10px; border: 1px solid #dddddd; color: #333333;">${discount}%</td>
                  </tr>
                  <tr>
                  <th style="padding: 10px; background-color: #f1f1f1; text-align: left; font-weight: bold; color: #333333;">Số tiền phải thanh toán</th>
                  <td style="padding: 10px; border: 1px solid #dddddd; color: #333333;">${finalAmount}VND</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding-top: 20px; font-size: 14px; color: #777777;">
                <p>Chi tiết sản phẩm:</p>
                ${productHtml}
              </td>
            </tr>
            <tr>
              <td style="padding-top: 20px; font-size: 14px; color: #777777;">
                <p><strong>Thông tin giao hàng:</strong></p>
                ${shippingHtml}
              </td>
            </tr>
            <tr>
              <td style="padding-top: 20px; font-size: 14px; color: #777777;">
                <p>Trân trọng,</p>
                <p>Đội ngũ hỗ trợ khách hàng</p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
};
module.exports = {
  orderConfirmationTemplate,
};
