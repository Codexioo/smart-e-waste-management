const transporter = require('./mailer');

const sendOrderEmail = (email, items, totalPoints, invoiceNumber) => {
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const itemList = items
    .map((item) => {
      const itemTotal = item.price * item.quantity;
      return `<li>
        <strong>${item.product_name}</strong><br/>
        Quantity: ${item.quantity}<br/>
        Points: ${item.price} pts × ${item.quantity} = <strong>${itemTotal} pts</strong>
      </li>`;
    })
    .join('');

    const html = `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Smart E-Waste – Order Receipt</h2>
        <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <table border="1" cellspacing="0" cellpadding="6" width="100%">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemList}
          </tbody>
        </table>
        <p><strong>Total Points Used:</strong> ${totalPoints}</p>
        <p style="margin-top: 20px;">Thank you for being part of the sustainable movement ♻️</p>
      </body>
    </html>
  `;
  

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Smart E-Waste Order Confirmation',
    html,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendOrderEmail;
