const Goal = require('../models/Goal');

// @desc    Get user goals
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    const { title, domain, targetValue, currentValue, deadline } = req.body;
    if (!title || !targetValue || !deadline) {
      return res.status(400).json({ message: 'Please provide title, targetValue, and deadline' });
    }

    const goal = await Goal.create({
      user: req.user.id,
      title,
      domain: domain || 'Finance',
      targetValue,
      currentValue: currentValue || 0,
      deadline,
      status: 'Active'
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a goal (including adding contributions)
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check ownership
    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { title, targetValue, currentValue, deadline, status, contribution } = req.body;

    if (title) goal.title = title;
    if (targetValue !== undefined) goal.targetValue = targetValue;
    if (deadline) goal.deadline = deadline;
    if (status) goal.status = status;

    if (currentValue !== undefined) {
      goal.currentValue = currentValue;
    } else if (contribution !== undefined) {
      // Allow relative additions to currentValue easily
      goal.currentValue = (goal.currentValue || 0) + Number(contribution);
    }

    // Check if goal is completed
    if (goal.currentValue >= goal.targetValue) {
      goal.status = 'Completed';
    } else {
      goal.status = 'Active';
    }

    const updatedGoal = await goal.save();
    res.status(200).json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check ownership
    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await goal.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Goal removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal
};