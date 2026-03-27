const db = require('../data/mockDatabase');

exports.createUser = (req, res) => {
    const { name, phone } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });

    let user = db.users.find(u => u.phone === phone);
    if (!user) {
        user = {
            id: Date.now().toString(),
            name,
            phone,
            groupId: null,
            trustScore: 50,
            badges: []
        };
        db.users.push(user);
    }
    
    res.json(user);
};

exports.getUserDetails = (req, res) => {
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
};
