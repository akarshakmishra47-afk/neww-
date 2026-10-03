const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const opportunityRoutes = require('./src/routes/opportunityRoutes');
const recommendationRoutes = require('./src/routes/recommendationRoutes');
const skillRoutes = require('./src/routes/skillRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const roadmapRoutes = require('./src/routes/roadmapRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const searchRoutes = require('./src/routes/searchRoutes');
const errorHandler = require('./src/middleware/errorHandler');
const { startDeadlineChecker } = require('./src/services/deadlineChecker');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Student Opportunity Engine API is running' });
});

// Centralized error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Start deadline notification checker
  startDeadlineChecker();
});
