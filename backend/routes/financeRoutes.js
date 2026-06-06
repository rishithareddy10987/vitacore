const express = require('express');
const router = express.Router();
const { getExpenses, addExpense } = require('../controllers/financeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getExpenses).post(protect, addExpense);
router.route('/income')
  .get(protect, getIncome)
  .put(protect, updateIncome);
module.exports = router;