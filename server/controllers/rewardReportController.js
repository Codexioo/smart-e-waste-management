const PDFDocument = require('pdfkit');
const db = require('../database');

const generateRewardSummaryPDF = (req, res) => {
  const userId = req.user.id;

  db.get(`SELECT username, email, total_reward_points FROM users WHERE id = ?`, [userId], (err, user) => {
    if (err || !user) {
      console.error('User fetch error:', err);
      return res.status(500).json({ error: 'Failed to retrieve user' });
    }

    db.all(`
      SELECT transaction_type, points, transaction_date, source
      FROM reward_history
      WHERE user_id = ?
      ORDER BY transaction_date DESC
    `, [userId], (err, rewardHistory) => {
      if (err) {
        console.error('Reward history error:', err);
        return res.status(500).json({ error: 'Failed to retrieve reward history' });
      }

      db.all(`
        SELECT waste_type, waste_weight, collection_date
        FROM waste_collections
        WHERE user_id = ?
        ORDER BY collection_date DESC
      `, [userId], (err, pickupHistory) => {
        if (err) {
          console.error('Pickup history error:', err);
          return res.status(500).json({ error: 'Failed to retrieve pickup history' });
        }

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });
        let buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          res
            .writeHead(200, {
              'Content-Length': pdfData.length,
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'attachment; filename=reward_summary.pdf',
            })
            .end(pdfData);
        });

        // Header
        doc.fontSize(22).text('Reward Summary Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown();
        doc.moveDown(1.5);

        // User Info
        doc.fontSize(14).fillColor('#000').text(`Name: ${user.username}`);
        doc.text(`Total Reward Points: ${user.total_reward_points}`);
        doc.moveDown(2);

        // Reward History Section
        doc.fontSize(16).fillColor('#0A8F08').text('Reward History', { underline: true });
        doc.moveDown(0.5);

        if (rewardHistory.length === 0) {
          doc.fontSize(12).fillColor('black').text('No reward history available.');
        } else {
          rewardHistory.forEach((r, i) => {
            doc
              .fontSize(12)
              .fillColor('black')
              .text(`${i + 1}. ${r.transaction_type.toUpperCase()} - ${r.points} pts on ${r.transaction_date} (${r.source || "N/A"})`);
          });
        }

        doc.moveDown(2);


        // Pickup History Section
        doc.fontSize(16).fillColor('#0A8F08').text('Pickup History', { underline: true });
        doc.moveDown(0.5);

        if (pickupHistory.length === 0) {
          doc.fontSize(12).fillColor('black').text('No pickup history found.');
        } else {
          pickupHistory.forEach((p, i) => {
            doc
              .fontSize(12)
              .fillColor('black')
              .text(`${i + 1}. ${p.waste_type} - ${p.waste_weight} kg on ${p.collection_date}`);
          });
        }

        doc.end();
      });
    });
  });
};

const getRewardSummaryData = (req, res) => {
  const userId = req.user.id;

  db.get(
    `SELECT username, email, telephone, total_reward_points FROM users WHERE id = ?`,
    [userId],
    (err, user) => {
      if (err || !user) {
        console.error("User fetch error:", err);
        return res.status(500).json({ error: "Failed to retrieve user" });
      }

      db.all(
        `SELECT transaction_type, points, transaction_date FROM reward_history WHERE user_id = ? ORDER BY transaction_date DESC`,
        [userId],
        (err, rewardHistory) => {
          if (err) {
            console.error("Reward history error:", err);
            return res.status(500).json({ error: "Failed to retrieve reward history" });
          }

          db.all(
            `SELECT waste_type, waste_weight, collection_date FROM waste_collections WHERE user_id = ? ORDER BY collection_date DESC`,
            [userId],
            (err, pickupHistory) => {
              if (err) {
                console.error("Pickup history error:", err);
                return res.status(500).json({ error: "Failed to retrieve pickup history" });
              }

              return res.json({
                user,
                rewardHistory,
                pickupHistory,
              });
            }
          );
        }
      );
    }
  );
};

module.exports = {
  generateRewardSummaryPDF,
  getRewardSummaryData,
};



