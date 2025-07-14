const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const jwt = require('jsonwebtoken');

// Middleware to verify token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// POST: Save result
router.post('/', verifyToken, async (req, res) => {
  const { quizId, score, total } = req.body;

  try {
    const result = new Result({
      user: req.userId,
      quiz: quizId,
      score,
      total,
      date: new Date()
    });
    await result.save();
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save result' });
  }
});
;

// GET: User's quiz history
router.get('/my', verifyToken, async (req, res) => {
  try {
    const results = await Result.find({ user: req.userId })
      .populate('quiz', 'title')
      .sort({ date: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load history' });
  }
});

// Public leaderboard: top 10 results
router.get('/leaderboard', async (req, res) => {
  try {
    const results = await Result.find()
      .populate('user', 'email') // show user's email
      .populate('quiz', 'title') // show quiz title
      .sort({ score: -1, date: -1 }) // highest score first
      .limit(10);

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load leaderboard' });
  }
});

module.exports = router;
