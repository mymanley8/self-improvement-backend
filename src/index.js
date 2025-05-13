const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected')).catch(err => console.error(err));

// Directory Structure
// - src/
//   - controllers/
//   - models/
//   - routes/
//   - index.js
// - .env
// - .gitignore
// - package.json
// - README.md

// .gitignore
// node_modules/
// .env
// .DS_Store

// .env example:
// MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
// JWT_SECRET=your_secret_key

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Productivity Schema
const productivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const Productivity = mongoose.model('Productivity', productivitySchema);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.get('/productivity', authenticateToken, async (req, res) => {
  const tasks = await Productivity.find({ userId: req.user.userId });
  res.json(tasks);
});

app.post('/productivity', authenticateToken, async (req, res) => {
  const { task } = req.body;
  const newTask = new Productivity({ userId: req.user.userId, task });
  await newTask.save();
  res.status(201).json(newTask);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
