// app.js
const express = require('express');
const cors = require('cors');
const categoryRoutes = require('./routes/category');
const courseRoutes = require('./routes/course');
const questionRoutes = require('./routes/question');
const questionUserRoutes = require('./routes/question_user');
const quizResultsRouter = require('./routes/quiz_results');
const roleRouter = require('./routes/role');
const sectionRouter = require('./routes/section');
const settingsRouter = require('./routes/settings');
const uploadRouter = require('./routes/upload');
const upload2Router = require('./routes/upload2');
const usersRouter = require('./routes/users');
const usersInfoRouter = require('./routes/users_info');
const blogsRouter = require('./routes/blogs'); 
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', categoryRoutes);
app.use('/api', courseRoutes);
app.use('/api', questionRoutes);
app.use('/api', questionUserRoutes);
app.use('/api', quizResultsRouter);
app.use('/api', roleRouter);
app.use('/api', sectionRouter);
app.use('/api', settingsRouter);
app.use('/api', uploadRouter);
app.use('/api', upload2Router);
app.use('/api', usersRouter);
app.use('/api', usersInfoRouter);
app.use('/api', blogsRouter); 

module.exports = app; // Export app for server.js
