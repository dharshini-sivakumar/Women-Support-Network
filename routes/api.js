const express = require('express');
const router = express.Router();

const authCtrl = require('../controllers/authController');
const groupCtrl = require('../controllers/groupController');
const loanCtrl = require('../controllers/loanController');
const socialCtrl = require('../controllers/socialController');

// User routes
router.post('/users', authCtrl.createUser);
router.get('/users/:id', authCtrl.getUserDetails);

// Group routes
router.post('/groups', groupCtrl.createGroup);
router.post('/groups/join', groupCtrl.joinGroup);
router.get('/groups/:id', groupCtrl.getGroupDetails);
router.get('/groups', groupCtrl.getGroups);

// Savings & Transactions
router.post('/savings', groupCtrl.addSavings);
router.get('/transactions', groupCtrl.getTransactions); // Could be scoped to group based on auth, but returning all for demo

// Loans & Voting
router.post('/loans', loanCtrl.requestLoan);
router.post('/loans/:id/vote', loanCtrl.voteLoan);
router.post('/loans/:id/repay', loanCtrl.repayLoan);
router.get('/loans/group/:id', loanCtrl.getLoans);
router.get('/votes', loanCtrl.getVotes);

// Social & Market
router.post('/chat', socialCtrl.sendMessage);
router.get('/chat/:id', socialCtrl.getMessages);
router.post('/market', socialCtrl.createListing);
router.get('/market/:id', socialCtrl.getMarketplace);
router.get('/notifications/:id', socialCtrl.getNotifications);

module.exports = router;
