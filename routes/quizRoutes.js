const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const jwt = require('jsonwebtoken');

function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) return res.status(403).json({ message: 'Admins only' });
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

router.post('/', verifyAdmin, async (req, res) => {
  const { title, questions } = req.body;
  try {
    const quiz = await Quiz.create({ title, questions });
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create quiz' });
  }
});

// Public route: Get all quizzes
router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    let filter = {};
    if (category) filter.category = category;

    const quizzes = await Quiz.find(filter).select('title category');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
});

// Get a quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load quiz' });
  }
});

module.exports = router;
