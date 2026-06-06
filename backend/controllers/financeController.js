const Expense = require('../models/Expense');
const UserFinance = require('../models/UserFinance');
const { sendAutomaticSMS } = require('../utils/smsHelper');
const mongoose = require('mongoose');

// @desc    Get user expenses
// @route   GET /api/finance
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add an expense or income
// @route   POST /api/finance
// @access  Private
const addExpense = async (req, res) => {
  try {
    const { amount, category, description, type, date } = req.body;
    if (!amount || !category) {
      return res.status(400).json({ message: 'Please provide amount and category' });
    }
    const expense = await Expense.create({
      user: req.user.id,
      date: date || Date.now(),
      amount,
      category,
      description,
      type
    });

    // --- Automatic Budget & Expense Warning System ---
    if (expense.type === 'Expense') {
      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyExpenses = await Expense.aggregate([
          {
            $match: {
              user: new mongoose.Types.ObjectId(req.user.id),
              type: 'Expense',
              date: { $gte: startOfMonth }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);

        const totalSpent = (monthlyExpenses[0]?.total || 0);
        const monthlyBudget = 15000;

        if (totalSpent > monthlyBudget) {
          const budgetExceededMsg = `💸 VitaCore Budget Alert: You have exceeded your monthly budget! Total spent: ₹${totalSpent.toLocaleString()} (Limit: ₹${monthlyBudget.toLocaleString()}). Try to minimize extra costs. 📉`;
          sendAutomaticSMS({ userId: req.user.id, message: budgetExceededMsg });
        } else if (expense.amount >= 3000) {
          const highExpenseMsg = `⚠️ VitaCore Finance: You logged a high individual expense of ₹${expense.amount.toLocaleString()} for "${expense.category}" (${expense.description || 'No description'}).`;
          sendAutomaticSMS({ userId: req.user.id, message: highExpenseMsg });
        }
      } catch (aggErr) {
        console.error('[FinanceAlert] Aggregation error:', aggErr.message);
      }
    }

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get monthly income
// @route   GET /api/finance/income
// @access  Private
const getIncome = async (req, res) => {
  try {
    const finance = await UserFinance.findOne({ user: req.user.id });
    res.status(200).json({ monthlyIncome: finance?.monthlyIncome || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update monthly income
// @route   PUT /api/finance/income
// @access  Private
const updateIncome = async (req, res) => {
  try {
    const { monthlyIncome } = req.body;
    if (monthlyIncome === undefined || monthlyIncome < 0) {
      return res.status(400).json({ message: 'Please provide a valid income amount' });
    }
    const finance = await UserFinance.findOneAndUpdate(
      { user: req.user.id },
      { monthlyIncome },
      { new: true, upsert: true }
    );
    res.status(200).json(finance);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getExpenses, addExpense, getIncome, updateIncome };