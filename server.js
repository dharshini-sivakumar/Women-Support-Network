const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Main Router
app.use('/api', apiRoutes);

// Fallback for React SPA
app.get(/^.*$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Backend Server running on http://localhost:${PORT}`);
});
