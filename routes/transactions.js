const express = require('express');
const db = require('../db');
const router = express.Router();

// Middleware untuk memvalidasi user sudah login
router.use((req, res, next) => {
    if (!req.session.user) return res.redirect('/auth/login');
    next();
});

// Fungsi format Rupiah
function formatRupiah(angka) {
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Halaman Daftar Transaksi Bulanan
router.get('/', (req, res) => {
    const userId = req.session.user.id;
    const { month, year } = req.query;

    // Default ke bulan dan tahun saat ini jika user tidak ada input
    const currentDate = new Date();
    const selectedMonth = month || currentDate.getMonth() + 1; // Bulan 1-12
    const selectedYear = year || currentDate.getFullYear();

    db.query(
        `SELECT * FROM transactions 
        WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
        [userId, selectedMonth, selectedYear],
        (err, results) => {
            if (err) return res.status(500).send('Error fetching transactions.');

            // Format setiap transaksi dalam bentuk Rupiah
            const formattedResults = results.map(transaction => ({
                ...transaction,
                amount: formatRupiah(transaction.amount)
            }));

            res.render('transactions', { 
                transactions: formattedResults, 
                selectedMonth, 
                selectedYear 
            });
        }
    );
});

// Tambah Transaksi Baru
router.post('/add', (req, res) => {
    const { amount, description, date } = req.body;
    const userId = req.session.user.id;
    db.query(
        'INSERT INTO transactions (user_id, amount, description, date) VALUES (?, ?, ?, ?)',
        [userId, amount, description, date],
        (err) => {
            if (err) return res.status(500).send('Error adding transaction.');
            res.redirect('/transactions');
        }
    );
});

// Halaman Tambah Transaksi Baru
router.get('/add', (req, res) => {
    res.render('addTransaction');
});

router.post('/add', (req, res) => {
    const { amount, description, date } = req.body;
    const userId = req.session.user.id;
    
    db.query(
        'INSERT INTO transactions (user_id, amount, description, date) VALUES (?, ?, ?, ?)',
        [userId, amount, description, date],
        (err) => {
            if (err) return res.status(500).send('Error adding transaction.');
            res.redirect('/transactions');
        }
    );
});

// Halaman Edit Transaksi
router.get('/edit/:id', (req, res) => {
    const { id } = req.params;
    
    db.query('SELECT * FROM transactions WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0) return res.status(404).send('Transaction not found.');
        
        res.render('edit', { transaction: results[0] });
    });
});

// Proses Edit Transaksi
router.post('/edit/:id', (req, res) => {
    const { id } = req.params;
    const { amount, description, date } = req.body;
    
    db.query(
        'UPDATE transactions SET amount = ?, description = ?, date = ? WHERE id = ?',
        [amount, description, date, id],
        (err) => {
            if (err) return res.status(500).send('Error updating transaction.');
            res.redirect('/transactions');
        }
    );
});

// Hapus Transaksi
router.post('/delete/:id', (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM transactions WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).send('Error deleting transaction.');
        res.redirect('/transactions');
    });
});




module.exports = router;



