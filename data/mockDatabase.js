// In-Memory Database mapped to the exact models requested by the user
const db = {
    users: [
        { id: '1', name: 'Alice Smith', phone: '1234567890', groupId: 'g1', trustScore: 85, badges: ['Active Member', 'First Loan Repaid'] },
        { id: '2', name: 'Betty Davis', phone: '0987654321', groupId: 'g1', trustScore: 100, badges: ['Active Member', 'Consistent Saver'] },
        { id: '3', name: 'Clara Foster', phone: '1112223333', groupId: 'g1', trustScore: 40, badges: ['Active Member'] }
    ],
    groups: [
        { id: 'g1', name: 'Women Entrepreneurs Circle', members: ['1', '2', '3'], goalAmount: 5000, totalSavings: 2200 }
    ],
    transactions: [
        { id: 't1', userId: '1', groupId: 'g1', amount: 500, type: 'saving', date: new Date(Date.now() - 86400000 * 3).toISOString() },
        { id: 't2', userId: '2', groupId: 'g1', amount: 1500, type: 'saving', date: new Date(Date.now() - 86400000 * 2).toISOString() },
        { id: 't3', userId: '3', groupId: 'g1', amount: 200, type: 'saving', date: new Date(Date.now() - 86400000 * 1).toISOString() },
    ],
    loans: [
        { id: 'l1', userId: '1', groupId: 'g1', amount: 300, reason: 'Buy baking supplies', status: 'approved', repaymentStatus: 'completed', dueDate: new Date(Date.now() + 86400000 * 10).toISOString() },
        { id: 'l2', userId: '3', groupId: 'g1', amount: 500, reason: 'Sewing machine repair', status: 'approved', repaymentStatus: 'pending', dueDate: new Date(Date.now() + 86400000 * 30).toISOString() }
    ],
    votes: [
        { id: 'v1', loanId: 'l2', userId: '1', vote: 'approve' },
        { id: 'v2', loanId: 'l2', userId: '2', vote: 'approve' }
    ],
    messages: [
        { id: 'c1', userId: '2', groupId: 'g1', text: 'Hey ladies, let\'s hit our savings goal this week!', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
        { id: 'c2', userId: '1', groupId: 'g1', text: 'I just added my contribution 💖', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() }
    ],
    marketplace: [
        { id: 'm1', userId: '1', title: 'Homemade Cupcakes', description: 'Delicious vanilla cupcakes, box of 6.', createdAt: new Date().toISOString() },
        { id: 'm2', userId: '3', title: 'Tailoring Services', description: 'Custom dress alterations.', createdAt: new Date().toISOString() }
    ],
    notifications: [
        { id: 'n1', userId: '1', message: 'Welcome to the network Alice!', type: 'system', timestamp: new Date().toISOString(), readStatus: false }
    ]
};

module.exports = db;
