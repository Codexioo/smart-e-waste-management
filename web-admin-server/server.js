const express = require('express');
const cors = require('cors');
const pickupRoutes = require('./routes/pickupRoutes');
const adminAuthRoutes = require('./routes/adminAuth');
const profileRoutes = require('./routes/adminProfile');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = 9091;

app.use(cors());
//app.use(express.json());

//Allow large JSON payloads (e.g., base64 images)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/requests', pickupRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', pickupRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Admin server running at http://localhost:${PORT}`);
});