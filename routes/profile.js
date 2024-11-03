const express = require('express');
const db = require('../db');
const router = express.Router();


// Middleware untuk memastikan pengguna sudah login
router.use((req, res, next) => {
    if (!req.session.user) return res.redirect('/auth/login');
    next();
});

// Halaman Profil
router.get('/', (req, res) => {
    const userId = req.session.user.id;
    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) res.status(500).send('Error loading profile.');
        else res.render('profile', { user: results[0] });
    });
});

// Halaman Edit Profil
router.get('/edit-Profile', (req, res) => {
    const userId = req.session.user.id;
    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) res.status(500).send('Error loading profile.');
        else res.render('edit-Profile', { user: results[0] });
    });
});

// Proses Edit Profil
router.post('/edit-Profile', (req, res) => {
    const userId = req.session.user.id;
    const { username, email } = req.body;

    db.query('UPDATE users SET username = ?, email = ? WHERE id = ?', 
        [username, email, userId], 
        (err) => {
            if (err) res.status(500).send('Error updating profile.');
            else {
                req.session.user.username = username;  // Update session dengan data baru
                res.render('profile', { user: { username, email }, success: 'Perubahan berhasil disimpan.' });
            }
        }
    );
});

router.get('/edit-Profile', (req, res) => {
    res.redirect('/profile/edit-Profile');
});



module.exports = router;

