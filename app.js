const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const profileRoutes = require('./routes/profile');
const db = require('./db');

const app = express();

// Konfigurasi View Engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

// Rute Utama: Untuk memeriksa apakah pengguna sudah login
app.get('/', (req, res) => {
    if (req.session.user) {
        // Jika pengguna sudah login, maka akan menampilkan ke halaman landing
        res.render('landing', { user: req.session.user });
    } else {
        // Jika belum login, tampilkan halaman utama
        res.render('index', { user: null });
    }
});

// Rute Autentikasi, Transaksi dan Profile
app.use('/auth', authRoutes);
app.use('/transactions', transactionRoutes);
app.use('/profile', profileRoutes);



// Jalankan Server
app.listen(3000, () => {
    console.log('Server running on port http://localhost:3000');
});
