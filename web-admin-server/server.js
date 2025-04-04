const express = require('express');
const cors = require('cors');
const pickupRoutes = require('./routes/pickupRoutes');

const app = express();
const PORT = 9091;

app.use(cors());
app.use(express.json());


app.use('/api/requests', pickupRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Admin server running at http://localhost:${PORT}`);
});