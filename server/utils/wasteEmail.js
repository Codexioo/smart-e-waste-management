const transporter = require('./mailer');
require('dotenv').config();

const sendWasteEmail = (email, points, wasteType, weight) => {
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const html = `
    <h2>✅ Waste Submission Successful</h2>
    <p>Thank you for contributing to a greener planet!</p>
    <p><strong>Date & Time:</strong> ${formattedDate}</p>
    <p><strong>Waste Type:</strong> ${wasteType}</p>
    <p><strong>Weight:</strong> ${weight} kg</p>
    <p><strong>Points Credited:</strong> ${points} pts</p>
    <br/>
    <p>♻ Keep collecting to earn more rewards!</p>
  `;

  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Smart E-Waste – Points Credited Successfully',
    html,
  });
};

module.exports = sendWasteEmail;
