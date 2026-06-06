const express = require('express');
const router = express.Router();
const { getExpenses, addExpense, getIncome, updateIncome } = require('../controllers/financeController');
const { protect } = require('../middleware/authMiddleware');

// /income must be before / to avoid route conflicts
router.route('/income')
  .get(protect, getIncome)
  .put(protect, updateIncome);

router.route('/')
  .get(protect, getExpenses)
  .post(protect, addExpense);

module.exports = router;