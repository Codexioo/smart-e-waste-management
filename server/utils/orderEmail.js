const transporter = require('./mailer');
require('dotenv').config();

const sendOrderEmail = (email, items, totalPoints) => {
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
    <h2>🎉 Smart E-Waste – Order Confirmation</h2>
    <p><strong>Date:</strong> ${formattedDate}</p>
    <p>You have successfully redeemed the following items:</p>
    <ul>${itemList}</ul>
    <p><strong>Total Points Used:</strong> ${totalPoints}</p>
    <p>Thank you for being part of the sustainable movement ♻️</p>
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
