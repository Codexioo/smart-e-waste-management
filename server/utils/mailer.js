const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'smartewaste.sys@gmail.com',
    pass: 'nrng tvnv gipq jvka',
  },
});

module.exports = transporter;
