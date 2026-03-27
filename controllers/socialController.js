const db = require('../data/mockDatabase');

exports.sendMessage = (req, res) => {
    const { userId, groupId, text } = req.body;
    
    const msg = {
        id: 'c' + Date.now(),
        userId,
        groupId,
        text,
        timestamp: new Date().toISOString()
    };
    
    db.messages.push(msg);
    res.json(msg);
};

exports.getMessages = (req, res) => {
    const groupId = req.params.id;
    const msgs = db.messages.filter(m => m.groupId === groupId);
    // Populate user details for frontend convenience
    const populated = msgs.map(m => {
        const u = db.users.find(usr => usr.id === m.userId);
        return { ...m, senderName: u ? u.name : 'Unknown' };
    });
    res.json(populated);
};

exports.createListing = (req, res) => {
    const { userId, title, description, price } = req.body;
    const user = db.users.find(u => u.id === userId);

    if(!user || !user.groupId) return res.status(400).json({ error: 'User invalid' });

    const item = {
        id: 'm' + Date.now(),
        userId,
        groupId: user.groupId,
        title,
        description,
        price: Number(price) || 0,
        createdAt: new Date().toISOString()
    };
    
    db.marketplace.push(item);
    res.json(item);
};

exports.getMarketplace = (req, res) => {
    const groupId = req.params.id;
    const items = db.marketplace.filter(m => m.groupId === groupId);
    
    const populated = items.map(m => {
        const u = db.users.find(usr => usr.id === m.userId);
        return { ...m, sellerName: u ? u.name : 'Unknown' };
    });

    res.json(populated);
};

exports.getNotifications = (req, res) => {
    const userId = req.params.id;
    const notifs = db.notifications.filter(n => n.userId === userId).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(notifs);
};
