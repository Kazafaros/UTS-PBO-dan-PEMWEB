const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const router = express.Router();

// Halaman Registrasi
router.get('/register', (req, res) => {
    res.render('register');
});

// Proses Registrasi
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) throw err;
        db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err) => {
            if (err) res.status(500).send('Error registering user.');
            else res.redirect('/auth/login');
        });
    });
});

// Halaman Login
router.get('/login', (req, res) => {
    res.render('login');
});

// Proses Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err || results.length === 0) return res.status(401).send('User not found.');
        
        bcrypt.compare(password, results[0].password, (err, match) => {
            if (match) {
                req.session.user = results[0];
                res.redirect('/');
            } else {
                res.status(401).send('Incorrect password.');
            }
        });
    });
});

// Rute Login (contoh)
router.post('/auth/login', (req, res) => {
    // Misalnya, ambil user dari database berdasarkan username dan password
    const username = req.body.username;
    const password = req.body.password;

    // Query ke database untuk memverifikasi user
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err || results.length === 0) return res.status(401).send('Invalid credentials');

        // Jika berhasil login, simpan data user di session
        req.session.user = results[0];
        res.redirect('/landing'); // Redirect ke halaman landing
    });
});


// Proses Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router;


