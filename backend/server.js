const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');

// Load .env file
dotenv.config({ path: './.env' });
console.log("CALORIE_NINJAS_KEY =", process.env.CALORIE_NINJAS_KEY);
console.log("Loaded OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY);

// Force Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express(); 
 
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Check env values
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Loaded" : "Missing");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Loaded" : "Missing");
console.log("OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY ? "Loaded" : "Missing");

// Routes
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const healthRoutes = require('./routes/healthRoutes');
const financeRoutes = require('./routes/financeRoutes');
const careerRoutes = require('./routes/careerRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const goalRoutes = require('./routes/goalRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/goals', goalRoutes);
console.log('Novu Secret Key:', process.env.NOVU_SECRET_KEY ? 'Loaded ✅' : 'Missing ❌');

// MongoDB connection
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('MongoDB connection error:', err));
} else {
    console.log('MONGODB_URI missing');
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});