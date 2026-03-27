const db = require('../data/mockDatabase');

const generateNotification = (userId, message, type) => {
    db.notifications.push({
        id: 'n' + Date.now(),
        userId,
        message,
        type,
        timestamp: new Date().toISOString(),
        readStatus: false
    });
};

const checkAndAwardBadges = (userId) => {
    const user = db.users.find(u => u.id === userId);
    if (!user) return;
    
    // Check First Loan Repaid
    const paidLoans = db.loans.filter(l => l.userId === userId && l.repaymentStatus === 'completed');
    if (paidLoans.length >= 1 && !user.badges.includes('First Loan Repaid')) {
        user.badges.push('First Loan Repaid');
        generateNotification(userId, "You earned the 'First Loan Repaid' badge! ⭐", "badge");
    }
};

exports.requestLoan = (req, res) => {
    const { userId, amount, reason } = req.body;
    const user = db.users.find(u => u.id === userId);
    
    if (!user || !user.groupId) return res.status(400).json({ error: 'User must belong to a group.' });
    const group = db.groups.find(g => g.id === user.groupId);

    if (group.totalSavings < Number(amount)) {
        return res.status(400).json({ error: 'Insufficient group funds for this loan size.' });
    }

    const loan = {
        id: 'l' + Date.now().toString(),
        userId,
        groupId: user.groupId,
        amount: Number(amount),
        reason,
        status: 'pending',
        repaymentStatus: 'pending',
        dueDate: new Date(Date.now() + 86400000 * 30).toISOString() // 30 days
    };
    
    db.loans.push(loan);

    // Notify other members
    group.members.forEach(memberId => {
        if (memberId !== userId) {
            generateNotification(memberId, `${user.name} requested a loan of $${amount} for: ${reason}. Please vote.`, 'loan_request');
        }
    });

    res.json(loan);
};

exports.voteLoan = (req, res) => {
    const loanId = req.params.id;
    const { userId, vote } = req.body; // vote is 'approve' or 'reject'
    const user = db.users.find(u => u.id === userId);
    const loan = db.loans.find(l => l.id === loanId);

    if (!user || !loan) return res.status(404).json({ error: 'Not found' });
    if (loan.status !== 'pending') return res.status(400).json({ error: 'Loan already resolved.' });
    if (loan.userId === userId) return res.status(400).json({ error: 'Borrower cannot vote on own loan.' });
    
    const existingVote = db.votes.find(v => v.loanId === loanId && v.userId === userId);
    if (existingVote) return res.status(400).json({ error: 'You have already voted on this loan.' });

    db.votes.push({
        id: 'v' + Date.now(),
        loanId,
        userId,
        vote
    });

    // +2 trust score for voting participation
    user.trustScore = Math.min(user.trustScore + 2, 100);

    const group = db.groups.find(g => g.id === loan.groupId);
    const totalEligibleVoters = group.members.length - 1;
    const loanVotes = db.votes.filter(v => v.loanId === loanId);
    
    const requiredMajority = Math.floor(totalEligibleVoters / 2) + 1;
    const approves = loanVotes.filter(v => v.vote === 'approve').length;
    const rejects = loanVotes.filter(v => v.vote === 'reject').length;

    if (approves >= requiredMajority) {
        loan.status = 'approved';
        group.totalSavings -= loan.amount; // Deduct funds logically
        generateNotification(loan.userId, `Your loan request for $${loan.amount} was approved!`, 'loan_approved');
    } else if (rejects >= requiredMajority || (loanVotes.length === totalEligibleVoters)) {
        loan.status = 'rejected';
        generateNotification(loan.userId, `Your loan request for $${loan.amount} was rejected by the group.`, 'loan_rejected');
    }

    res.json({ message: 'Vote recorded', loan, newTrustScore: user.trustScore });
};

exports.repayLoan = (req, res) => {
    const loanId = req.params.id;
    const { userId } = req.body;
    
    const loan = db.loans.find(l => l.id === loanId);
    if (!loan || loan.userId !== userId) return res.status(404).json({ error: 'Loan not found for this user.' });
    if (loan.repaymentStatus === 'completed') return res.status(400).json({ error: 'Loan already repaid.' });

    loan.repaymentStatus = 'completed';

    const transaction = {
        id: 't' + Date.now(),
        userId,
        groupId: loan.groupId,
        amount: loan.amount,
        type: 'repayment',
        date: new Date().toISOString()
    };
    db.transactions.push(transaction);

    const group = db.groups.find(g => g.id === loan.groupId);
    group.totalSavings += loan.amount;

    const user = db.users.find(u => u.id === userId);
    
    // Check if on time 
    const isLate = new Date() > new Date(loan.dueDate);
    if (!isLate) {
        user.trustScore = Math.min(user.trustScore + 10, 100);
        generateNotification(userId, `Loan repaid on time! Trust Score +10`, 'repayment');
    } else {
        user.trustScore = Math.max(user.trustScore - 5, 0);
        generateNotification(userId, `Loan repaid late. Trust Score -5`, 'repayment_late');
    }

    checkAndAwardBadges(userId);

    res.json({ message: 'Loan repaid successfully', loan, trustScore: user.trustScore });
};

exports.getLoans = (req, res) => {
    const groupId = req.params.id;
    const groupLoans = db.loans.filter(l => l.groupId === groupId);
    res.json(groupLoans);
};

exports.getVotes = (req, res) => {
    res.json(db.votes);
};
