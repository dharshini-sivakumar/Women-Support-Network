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
    
    // Check Active Member
    if (user.groupId && !user.badges.includes('Active Member')) {
        user.badges.push('Active Member');
    }
    
    // Check Consistent Saver
    const savings = db.transactions.filter(t => t.userId === userId && t.type === 'saving');
    if (savings.length >= 3 && !user.badges.includes('Consistent Saver')) {
        user.badges.push('Consistent Saver');
        generateNotification(userId, "You earned the 'Consistent Saver' badge! 💰", "badge");
    }
};

exports.createGroup = (req, res) => {
    const { userId, groupName, goalAmount } = req.body;
    const user = db.users.find(u => u.id === userId);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.groupId) return res.status(400).json({ error: 'User already in a group' });

    const newGroup = {
        id: 'g' + Date.now().toString(),
        name: groupName,
        members: [userId],
        totalSavings: 0,
        goalAmount: Number(goalAmount) || 5000
    };
    
    db.groups.push(newGroup);
    user.groupId = newGroup.id;
    checkAndAwardBadges(userId);

    res.json(newGroup);
};

exports.joinGroup = (req, res) => {
    const { userId, groupId } = req.body;
    const user = db.users.find(u => u.id === userId);
    const group = db.groups.find(g => g.id === groupId);

    if (!user || !group) return res.status(404).json({ error: 'Not found' });
    if (user.groupId) return res.status(400).json({ error: 'User already in a group' });

    group.members.push(userId);
    user.groupId = groupId;
    checkAndAwardBadges(userId);

    res.json({ message: 'Joined group successfully', group });
};

exports.addSavings = (req, res) => {
    const { userId, amount } = req.body;
    const user = db.users.find(u => u.id === userId);
    
    if (!user || !user.groupId) return res.status(400).json({ error: 'Invalid user or not in group' });
    const group = db.groups.find(g => g.id === user.groupId);

    const transaction = {
        id: 't' + Date.now(),
        userId,
        groupId: user.groupId,
        amount: Number(amount),
        type: 'saving',
        date: new Date().toISOString()
    };

    db.transactions.push(transaction);
    group.totalSavings += Number(amount);
    
    // +5 trust score
    user.trustScore = Math.min(user.trustScore + 5, 100);
    
    generateNotification(userId, `You successfully contributed $${amount}. Trust score +5!`, "saving");
    checkAndAwardBadges(userId);

    const progress = (group.totalSavings / group.goalAmount) * 100;

    res.json({ message: 'Savings added', transaction, progress, totalSavings: group.totalSavings, trustScore: user.trustScore });
};

exports.getGroupDetails = (req, res) => {
    const groupId = req.params.id;
    const group = db.groups.find(g => g.id === groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const progress = Math.min((group.totalSavings / group.goalAmount) * 100, 100);
    
    // Populate members
    const members = group.members.map(mid => db.users.find(u => u.id === mid));
    
    res.json({ ...group, progress, membersPopulated: members });
};

exports.getGroups = (req, res) => {
    res.json(db.groups);
};

exports.getTransactions = (req, res) => {
    res.json(db.transactions);
};
