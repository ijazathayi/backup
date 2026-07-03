require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize DB and Auth
const db = require('./db');
require('./auth');

const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Setup multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const isAllowed = allowedOrigins.includes(origin) ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.startsWith('http://[::1]:');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'private_chat_secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Auth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('http://localhost:5173/');
  }
);

app.post('/auth/otp/request', (req, res) => {
    const { phone_number } = req.body;
    if (!phone_number) return res.status(400).json({ error: 'Phone number required' });
    
    // Generate 6 digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    db.run('INSERT INTO otps (phone_number, code, expires_at) VALUES (?, ?, ?)', [phone_number, code, expires_at], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // Mock sending SMS (plug in Twilio API here later)
        console.log(`\n\n=== MOCK SMS ===\nTo: ${phone_number}\nYour OTP is: ${code}\n================\n\n`);
        
        res.json({ success: true, message: 'OTP sent successfully' });
    });
});

app.post('/auth/otp/verify', (req, res) => {
    const { phone_number, code, name } = req.body;
    if (!phone_number || !code) return res.status(400).json({ error: 'Missing fields' });
    
    db.get('SELECT * FROM otps WHERE phone_number = ? AND code = ? AND expires_at > ? ORDER BY id DESC LIMIT 1', 
        [phone_number, code, new Date().toISOString()], 
        (err, otpRow) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!otpRow) return res.status(401).json({ error: 'Invalid or expired OTP' });
            
            // OTP is valid. Check if user exists
            db.get('SELECT * FROM users WHERE phone_number = ?', [phone_number], (err, user) => {
                if (err) return res.status(500).json({ error: err.message });
                
                if (user) {
                    req.login(user, (err) => {
                        if (err) return res.status(500).json({ error: err.message });
                        return res.json({ success: true, user });
                    });
                } else {
                    const defaultName = name || 'User ' + Math.floor(1000 + Math.random() * 9000);
                    db.run('INSERT INTO users (phone_number, name) VALUES (?, ?)', [phone_number, defaultName], function(err) {
                        if (err) return res.status(500).json({ error: err.message });
                        
                        const newUser = { id: this.lastID, phone_number, name: defaultName };
                        req.login(newUser, (err) => {
                            if (err) return res.status(500).json({ error: err.message });
                            return res.json({ success: true, user: newUser });
                        });
                    });
                }
            });
        }
    );
});

app.post('/auth/saved_login', (req, res) => {
    const { phone_number } = req.body;
    if (!phone_number) return res.status(400).json({ error: 'Phone number required' });
    
    db.get('SELECT * FROM users WHERE phone_number = ?', [phone_number], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        req.login(user, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json({ success: true, user });
        });
    });
});

app.get('/auth/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ authenticated: true, user: req.user });
    } else {
        res.json({ authenticated: false });
    }
});

app.post('/auth/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.json({ success: true });
    });
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/admin.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/admin.html'));
});

// ─── Admin Routes ────────────────────────────────────────────
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';

const adminAuth = (req, res, next) => {
    const key = req.headers['x-admin-key'] || req.query.key;
    if (key !== ADMIN_KEY) return res.status(403).json({ error: 'Forbidden: Invalid admin key' });
    next();
};

// GET /admin/stats
app.get('/admin/stats', adminAuth, (req, res) => {
    db.get('SELECT COUNT(*) as total FROM users', (err, usersRow) => {
        if (err) return res.status(500).json({ error: err.message });
        db.get('SELECT COUNT(*) as total FROM messages WHERE is_deleted = 0', (err, msgRow) => {
            if (err) return res.status(500).json({ error: err.message });
            db.get("SELECT COUNT(*) as total FROM otps WHERE expires_at > datetime('now')", (err, otpRow) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({
                    total_users: usersRow.total,
                    total_messages: msgRow.total,
                    active_otps: otpRow.total,
                    online_users: userSockets.size,
                    online_user_ids: Array.from(userSockets.keys())
                });
            });
        });
    });
});

// GET /admin/users
app.get('/admin/users', adminAuth, (req, res) => {
    db.all(`SELECT id, name, email, phone_number, avatar, about, created_at,
        (SELECT COUNT(*) FROM messages WHERE sender_id = users.id OR receiver_id = users.id) as message_count
        FROM users ORDER BY created_at DESC`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const onlineIds = new Set(userSockets.keys());
        const result = rows.map(u => ({ ...u, is_online: onlineIds.has(u.id) }));
        res.json(result);
    });
});

// GET /admin/otps
app.get('/admin/otps', adminAuth, (req, res) => {
    db.all(`SELECT o.*, 
        CASE WHEN o.expires_at > datetime('now') THEN 1 ELSE 0 END as is_active
        FROM otps o ORDER BY o.id DESC LIMIT 30`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// DELETE /admin/users/:id
app.delete('/admin/users/:id', adminAuth, (req, res) => {
    const userId = req.params.id;
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });
        db.serialize(() => {
            db.run('DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?', [userId, userId]);
            db.run('DELETE FROM otps WHERE phone_number = ?', [user.phone_number]);
            db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                // Force disconnect if online
                const socketId = userSockets.get(parseInt(userId));
                if (socketId) {
                    io.to(socketId).emit('force_logout', { reason: 'Account deleted by admin' });
                    userSockets.delete(parseInt(userId));
                }
                res.json({ success: true, deleted_user: user.name });
            });
        });
    });
});

// GET /admin/users/:id/conversations  — all people this user has chatted with + last message
app.get('/admin/users/:id/conversations', adminAuth, (req, res) => {
    const userId = parseInt(req.params.id);
    db.all(`
        SELECT
            u.id, u.name, u.avatar, u.phone_number,
            m.text as last_message,
            m.created_at as last_at,
            m.attachment_type,
            m.is_deleted,
            (SELECT COUNT(*) FROM messages
             WHERE ((sender_id = ? AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = ?))
             AND is_deleted = 0) as message_count
        FROM users u
        JOIN messages m ON m.id = (
            SELECT id FROM messages
            WHERE (sender_id = ? AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = ?)
            ORDER BY created_at DESC LIMIT 1
        )
        WHERE u.id != ?
        ORDER BY m.created_at DESC
    `, [userId, userId, userId, userId, userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /admin/messages?user1=X&user2=Y  — full chat between two users
app.get('/admin/messages', adminAuth, (req, res) => {
    const { user1, user2 } = req.query;
    if (!user1 || !user2) return res.status(400).json({ error: 'user1 and user2 required' });
    db.all(`
        SELECT m.*, 
            s.name as sender_name, s.avatar as sender_avatar,
            r.name as receiver_name
        FROM messages m
        JOIN users s ON s.id = m.sender_id
        JOIN users r ON r.id = m.receiver_id
        WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
        ORDER BY m.created_at ASC
    `, [user1, user2, user2, user1], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Users Routes
app.get('/api/users', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
    
    // Get all users except current user
    db.all('SELECT id, name, email, avatar, phone_number, about FROM users WHERE id != ?', [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.put('/api/users/profile', upload.single('avatar'), (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
    
    const { name, about } = req.body;
    const userId = req.user.id;
    let avatarUrl = req.user.avatar; // Keep existing if not uploaded

    if (req.file) {
        avatarUrl = `http://localhost:3001/uploads/${req.file.filename}`;
    }
    
    db.run('UPDATE users SET name = ?, about = ?, avatar = ? WHERE id = ?', [name, about, avatarUrl, userId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        res.json({ success: true, name, about, avatar: avatarUrl });
    });
});

// Messages API
app.get('/api/messages/:userId', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
    
    const otherUserId = req.params.userId;
    const currentUserId = req.user.id;
    
    db.all(
        `SELECT * FROM messages 
         WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) 
         ORDER BY created_at ASC`,
        [currentUserId, otherUserId, otherUserId, currentUserId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

app.post('/api/messages/upload', upload.single('media'), (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
    
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const mediaUrl = `http://localhost:3001/uploads/${req.file.filename}`;
    const mediaType = req.file.mimetype;
    
    res.json({ success: true, url: mediaUrl, type: mediaType });
});

// Socket.IO for real-time messaging
const userSockets = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('register', (rawUserId) => {
        const userId = parseInt(rawUserId, 10);
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);
        // Immediately send the current online list to this socket
        socket.emit('online_users_list', Array.from(userSockets.keys()));
        // Broadcast to everyone else that this user is now online
        socket.broadcast.emit('user_online', userId);
    });

    // Kept for compatibility — returns current online list on demand
    socket.on('get_online_users', () => {
        socket.emit('online_users_list', Array.from(userSockets.keys()));
    });

    socket.on('send_message', (data) => {
        const { sender_id, receiver_id, text, attachment_url, attachment_type } = data;
        
        // Save to DB
        db.run('INSERT INTO messages (sender_id, receiver_id, text, attachment_url, attachment_type) VALUES (?, ?, ?, ?, ?)',
            [sender_id, receiver_id, text, attachment_url, attachment_type],
            function(err) {
                if (err) return console.error(err);
                
                const message = {
                    id: this.lastID,
                    sender_id,
                    receiver_id,
                    text,
                    attachment_url,
                    attachment_type,
                    created_at: new Date().toISOString()
                };
                
                // Send back to sender for confirmation
                socket.emit('receive_message', message);
                
                // Send to receiver if online
                const receiverSocketId = userSockets.get(receiver_id);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receive_message', message);
                }
            }
        );
    });

    socket.on('edit_message', (data) => {
        const { message_id, new_text } = data;
        
        db.get('SELECT * FROM messages WHERE id = ?', [message_id], (err, msg) => {
            if (err || !msg) return;
            
            const timeDiff = Date.now() - new Date(msg.created_at).getTime();
            if (timeDiff > 5 * 60 * 1000) {
                return; // Silently fail if over 5 mins
            }
            
            db.run('UPDATE messages SET text = ?, is_edited = 1 WHERE id = ?', [new_text, message_id], function(err) {
                if (!err) {
                    const updateData = { id: message_id, text: new_text, is_edited: 1 };
                    const receiverSocketId = userSockets.get(msg.receiver_id);
                    const senderSocketId = userSockets.get(msg.sender_id);
                    if (receiverSocketId) io.to(receiverSocketId).emit('message_updated', updateData);
                    if (senderSocketId) io.to(senderSocketId).emit('message_updated', updateData);
                }
            });
        });
    });

    socket.on('delete_message', (data) => {
        const { message_id } = data;
        
        db.get('SELECT * FROM messages WHERE id = ?', [message_id], (err, msg) => {
            if (err || !msg) return;
            
            db.run('UPDATE messages SET is_deleted = 1, text = "This message was deleted" WHERE id = ?', [message_id], function(err) {
                if (!err) {
                    const updateData = { id: message_id, is_deleted: 1, text: "This message was deleted" };
                    const receiverSocketId = userSockets.get(msg.receiver_id);
                    const senderSocketId = userSockets.get(msg.sender_id);
                    if (receiverSocketId) io.to(receiverSocketId).emit('message_updated', updateData);
                    if (senderSocketId) io.to(senderSocketId).emit('message_updated', updateData);
                }
            });
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (let [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                socket.broadcast.emit('user_offline', userId);
                console.log(`User ${userId} went offline`);
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the other process or change PORT.`);
    process.exit(1);
  } else {
    console.error(err);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
