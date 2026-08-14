const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Setup
const db = new sqlite3.Database(':memory:'); // SQLite In-Memory Database

db.serialize(() => {
  // Users Table
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    bio TEXT
  )`);

  // Posts Table
  db.run(`CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Comments Table
  db.run(`CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    user_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES posts(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Likes Table
  db.run(`CREATE TABLE likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    user_id INTEGER,
    UNIQUE(post_id, user_id)
  )`);

  // Follows Table
  db.run(`CREATE TABLE follows (
    follower_id INTEGER,
    followed_id INTEGER,
    PRIMARY KEY (follower_id, followed_id)
  )`);

  // Seed Initial Users
  db.run(`INSERT INTO users (username, bio) VALUES ('alex', 'Full-stack developer & tech enthusiast')`);
  db.run(`INSERT INTO users (username, bio) VALUES ('sam', 'Digital designer and coffee lover')`);
});

// --- API ROUTES ---

// Get Users
app.get('/api/users', (req, res) => {
  db.all(`SELECT * FROM users`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get User Profile
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });
    
    db.all(`SELECT follower_id FROM follows WHERE followed_id = ?`, [userId], (err, followers) => {
      db.all(`SELECT followed_id FROM follows WHERE follower_id = ?`, [userId], (err, following) => {
        res.json({
          ...user,
          followersCount: followers.length,
          followingCount: following.length
        });
      });
    });
  });
});

// Get Feed (Posts + Like Counts + Author Names)
app.get('/api/posts', (req, res) => {
  const query = `
    SELECT posts.*, users.username,
      (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) as likesCount
    FROM posts 
    JOIN users ON posts.user_id = users.id 
    ORDER BY created_at DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create Post
app.post('/api/posts', (req, res) => {
  const { user_id, content } = req.body;
  db.run(`INSERT INTO posts (user_id, content) VALUES (?, ?)`, [user_id, content], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, user_id, content });
  });
});

// Like / Unlike Post
app.post('/api/posts/:id/like', (req, res) => {
  const postId = req.params.id;
  const { user_id } = req.body;

  db.get(`SELECT * FROM likes WHERE post_id = ? AND user_id = ?`, [postId, user_id], (err, row) => {
    if (row) {
      db.run(`DELETE FROM likes WHERE post_id = ? AND user_id = ?`, [postId, user_id], () => res.json({ liked: false }));
    } else {
      db.run(`INSERT INTO likes (post_id, user_id) VALUES (?, ?)`, [postId, user_id], () => res.json({ liked: true }));
    }
  });
});

// Add Comment
app.post('/api/posts/:id/comments', (req, res) => {
  const postId = req.params.id;
  const { user_id, content } = req.body;
  db.run(`INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)`, [postId, user_id, content], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, postId, user_id, content });
  });
});

// Get Comments for a Post
app.get('/api/posts/:id/comments', (req, res) => {
  const query = `
    SELECT comments.*, users.username 
    FROM comments 
    JOIN users ON comments.user_id = users.id 
    WHERE post_id = ?
    ORDER BY created_at ASC
  `;
  db.all(query, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Follow / Unfollow User
app.post('/api/users/:id/follow', (req, res) => {
  const targetId = req.params.id;
  const { current_user_id } = req.body;

  if (targetId == current_user_id) return res.status(400).json({ error: "Can't follow yourself" });

  db.get(`SELECT * FROM follows WHERE follower_id = ? AND followed_id = ?`, [current_user_id, targetId], (err, row) => {
    if (row) {
      db.run(`DELETE FROM follows WHERE follower_id = ? AND followed_id = ?`, [current_user_id, targetId], () => res.json({ following: false }));
    } else {
      db.run(`INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)`, [current_user_id, targetId], () => res.json({ following: true }));
    }
  });
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));