const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'chat.db');
const db = new sqlite3.Database(dbPath);

const action = process.argv[2];
const target = process.argv[3];

if (action === '--remove-all') {
    // Delete all messages first due to foreign key constraints, then delete users
    db.serialize(() => {
        db.run('DELETE FROM messages', (err) => {
            if (err) console.error(err);
            else console.log('All messages deleted.');
        });
        db.run('DELETE FROM otps', (err) => {
            if (err) console.error(err);
            else console.log('All OTPs deleted.');
        });
        db.run('DELETE FROM users', (err) => {
            if (err) console.error(err);
            else console.log('All users deleted successfully.');
            db.close();
        });
    });
} else if (action === '--remove-user' && target) {
    // Find the user first
    db.get('SELECT id FROM users WHERE phone_number = ?', [target], (err, user) => {
        if (err) {
            console.error(err);
            return db.close();
        }
        if (!user) {
            console.log(`User with phone number "${target}" not found.`);
            return db.close();
        }
        
        // Delete their messages, then delete the user
        db.serialize(() => {
            db.run('DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?', [user.id, user.id], (err) => {
                if (err) console.error(err);
                else console.log(`Deleted all messages for user ${target}.`);
            });
            db.run('DELETE FROM otps WHERE phone_number = ?', [target], (err) => {
                if (err) console.error(err);
            });
            db.run('DELETE FROM users WHERE id = ?', [user.id], (err) => {
                if (err) console.error(err);
                else console.log(`User ${target} deleted successfully.`);
                db.close();
            });
        });
    });
} else {
    console.log('--- User Management Script ---');
    console.log('Usage:');
    console.log('  To remove ALL users:');
    console.log('      node manage_users.js --remove-all');
    console.log('');
    console.log('  To remove a SPECIFIC user:');
    console.log('      node manage_users.js --remove-user "+91 9999999999"');
    console.log('------------------------------');
    db.close();
}
