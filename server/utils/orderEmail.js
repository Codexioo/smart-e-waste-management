const transporter = require("./mailer");

const sendOrderEmail = (email, items, totalPoints, invoiceNumber) => {
  const now = new Date();
  const formattedDate = now.toLocaleString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const itemBlocks = items
    .map((item) => {
      const itemTotal = item.price * item.quantity;
      return `
        <div style="margin-bottom: 16px; border-bottom: 1px solid #ddd; padding-bottom: 12px;">
          <div style="font-weight: bold; font-size: 16px;">${item.product_name}</div>
          <div style="font-size: 14px; margin-top: 4px;">
            Quantity: <strong>${item.quantity}</strong><br/>
            Points per unit: <strong>${item.price} pts</strong><br/>
            Total: <strong>${itemTotal} pts</strong>
          </div>
        </div>
      `;
    })
    .join("");

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f8f8f8; padding: 32px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 24px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="text-align: center; color: #2e7d32;">♻️ Smart E-Waste – Order Receipt</h2>

          <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>

          <hr style="margin: 20px 0;" />

          ${itemBlocks}

          <hr style="margin: 20px 0;" />

          <p style="font-size: 16px;"><strong>Total Points Used:</strong> ${totalPoints}</p>

          <p style="margin-top: 24px; font-size: 14px; text-align: center;">
            Thank you for being part of the sustainable movement ♻️
          </p>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Smart E-Waste Order Confirmation",
    html,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendOrderEmail;
