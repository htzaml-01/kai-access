const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(__dirname));

// Tier calculation based on Railpoin balance
function getTierByRailpoin(balance) {
    const pts = Number(balance) || 0;
    if (pts > 2000) return "Platinum Member";
    if (pts >= 1500) return "Gold Member";
    if (pts >= 1000) return "Silver Member";
    return "Basic Member";
}

// Initial database state
const defaultDb = {
    isLoggedIn: false,
    currentUser: null,
    railpoin: {
        balance: 0,
        tier: "Belum Login",
        userName: "Tamu",
        history: []
    },
    tickets: [],
    bookedSeats: {},
    users: {}
};

// Read database
function readDb() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            const parsed = JSON.parse(data);
            if (!parsed.users) parsed.users = {};
            if (!parsed.bookedSeats) parsed.bookedSeats = {};
            return parsed;
        }
    } catch (err) {
        console.error('Error reading db.json:', err);
    }
    return defaultDb;
}

// Save database
function saveDb(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing to db.json:', err);
    }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: 'KAI Access Localhost API Server', timestamp: new Date().toISOString() });
});

// GET user auth & profile state
app.get('/api/user', (req, res) => {
    const db = readDb();
    res.json({
        isLoggedIn: db.isLoggedIn,
        currentUser: db.currentUser,
        railpoin: db.railpoin,
        tickets: db.tickets,
        bookedSeats: db.bookedSeats
    });
});

// GET booked seats
app.get('/api/booked-seats', (req, res) => {
    const { scheduleId, classType } = req.query;
    const db = readDb();
    db.bookedSeats = db.bookedSeats || {};
    const key = `${scheduleId}_${classType}`;
    res.json({ scheduleId, classType, bookedSeats: db.bookedSeats[key] || [] });
});

// POST login user
app.post('/api/login', (req, res) => {
    const { name, gender, dob, nik, email, phone } = req.body;

    if (!name || !nik || !email) {
        return res.status(400).json({ success: false, message: 'Data identitas (Nama, NIK, Email) wajib diisi!' });
    }

    // NIK Validation: Must be exactly 16 digits
    const cleanNik = String(nik).trim();
    if (!/^\d{16}$/.test(cleanNik)) {
        return res.status(400).json({ success: false, message: 'NIK harus terdiri dari tepat 16 digit angka!' });
    }

    const nameParts = name.trim().split(' ');
    const shortName = nameParts.slice(0, 2).join(' ').toUpperCase();
    let initials = "AD";
    if (nameParts.length >= 2) {
        initials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    } else if (nameParts.length === 1 && nameParts[0].length > 0) {
        initials = nameParts[0].substring(0, 2).toUpperCase();
    }

    const userProfile = {
        name: name.toUpperCase(),
        shortName: shortName,
        gender: gender || 'Laki-Laki',
        dob: dob || '',
        nik: cleanNik,
        email: email,
        phone: phone || "0812-3456-7890",
        initials: initials
    };

    const db = readDb();
    db.users = db.users || {};

    // Check if user with this NIK already exists
    if (db.users[cleanNik]) {
        // Log into existing user account for this NIK
        const existingAcc = db.users[cleanNik];
        db.isLoggedIn = true;
        db.currentUser = userProfile;
        existingAcc.currentUser = userProfile;

        db.railpoin = existingAcc.railpoin || {
            balance: 0,
            tier: getTierByRailpoin(0),
            userName: shortName,
            history: []
        };
        db.railpoin.tier = getTierByRailpoin(db.railpoin.balance);
        db.tickets = existingAcc.tickets || [];
    } else {
        // Create NEW User Account with 0 Railpoin
        const newRailpoin = {
            balance: 0,
            tier: getTierByRailpoin(0),
            userName: shortName,
            history: []
        };
        db.users[cleanNik] = {
            currentUser: userProfile,
            railpoin: newRailpoin,
            tickets: []
        };
        db.isLoggedIn = true;
        db.currentUser = userProfile;
        db.railpoin = newRailpoin;
        db.tickets = [];
    }

    saveDb(db);

    console.log(`[LOGIN SUCCESS] User logged in: ${userProfile.name} (NIK: ${cleanNik})`);
    res.json({
        success: true,
        message: 'Login berhasil!',
        isLoggedIn: true,
        currentUser: db.currentUser,
        railpoin: db.railpoin,
        tickets: db.tickets
    });
});

// POST logout user
app.post('/api/logout', (req, res) => {
    const db = readDb();
    db.isLoggedIn = false;
    db.currentUser = null;
    db.railpoin = {
        balance: 0,
        tier: "Belum Login",
        userName: "Tamu",
        history: []
    };
    db.tickets = [];

    saveDb(db);
    console.log(`[LOGOUT] User logged out on server`);
    res.json({ success: true, message: 'Logout berhasil' });
});

// GET tickets
app.get('/api/tickets', (req, res) => {
    const db = readDb();
    res.json({ tickets: db.tickets });
});

// POST save ticket (+100 Railpoin reward per booking & seat occupancy update)
app.post('/api/tickets', (req, res) => {
    const { ticket } = req.body;
    if (!ticket) {
        return res.status(400).json({ success: false, message: 'Data tiket tidak valid' });
    }

    const db = readDb();
    db.tickets = db.tickets || [];
    db.tickets.unshift(ticket);

    // Save booked seat occupied status
    if (ticket.scheduleId && ticket.seatNo && ticket.classType) {
        db.bookedSeats = db.bookedSeats || {};
        const key = `${ticket.scheduleId}_${ticket.classType}`;
        db.bookedSeats[key] = db.bookedSeats[key] || [];
        if (!db.bookedSeats[key].includes(ticket.seatNo)) {
            db.bookedSeats[key].push(ticket.seatNo);
        }
    }

    // Add +100 Railpoin reward for booking a ticket
    if (db.isLoggedIn && db.railpoin) {
        db.railpoin.balance = (db.railpoin.balance || 0) + 100;
        db.railpoin.tier = getTierByRailpoin(db.railpoin.balance);
        db.railpoin.history = db.railpoin.history || [];
        db.railpoin.history.unshift({
            type: 'earn',
            title: 'Reward Pemesanan Tiket',
            desc: `${ticket.trainName} (${ticket.trainCode})`,
            points: 100,
            date: ticket.date || 'Hari ini'
        });

        // Sync with db.users[nik]
        if (db.currentUser && db.currentUser.nik && db.users && db.users[db.currentUser.nik]) {
            db.users[db.currentUser.nik].tickets = db.tickets;
            db.users[db.currentUser.nik].railpoin = db.railpoin;
        }
    }

    saveDb(db);

    res.json({
        success: true,
        tickets: db.tickets,
        railpoin: db.railpoin,
        bookedSeats: db.bookedSeats
    });
});

// Start localhost server
app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(`🚀 KAI Access Localhost Server running at:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`================================================`);
});
