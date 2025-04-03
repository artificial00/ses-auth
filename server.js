require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const { getCachedData, cache } = require('./cache');

const app = express();
const PORT = process.env.PORT || 3000;
const SALT_ROUNDS = 10;

const users = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key_here',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    next();
};

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Необходимо ввести юзернейм и пароль' });
        }
        
        const userExists = users.some(u => u.username === username);
        if (userExists) {
            return res.status(409).json({ success: false, message: 'Юзренейм уже существует' });
        }
        
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        users.push({ username, password: hashedPassword });
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Регистрация не удалась' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = users.find(u => u.username === username);
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Неверные данные' });
        }
        
        req.session.user = { username };
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Вход не удался' });
    }
});

app.get('/profile', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Выход не удался' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});

app.get('/data', requireAuth, async (req, res) => {
    try {
        const data = await getCachedData();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Не удалось получить данные' });
    }
});

app.get('/check-auth', (req, res) => {
    res.json({ authenticated: !!req.session.user, user: req.session.user });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});