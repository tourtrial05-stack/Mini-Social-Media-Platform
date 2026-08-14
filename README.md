# 🌐 Mini Social Media Platform

A lightweight full-stack social networking web application built with **Node.js**, **Express.js**, **SQLite**, **HTML5**, **CSS3**, and **Vanilla JavaScript**.

This project implements core social media functionalities, including user management, post creation, commenting, liking, and user-to-user following systems with persistent relational database storage.

---

## 🚀 Features

- **👤 User Profiles & Switcher**: Toggle between active user profiles to test multi-user interactive scenarios easily.
- **📝 Posts Feed**: Create and view posts displayed dynamically in real-time with author details and timestamps.
- **💬 Comments System**: Add and view nested comment streams under individual posts.
- **❤️ Like System**: Interactive like/unlike toggle mechanism with live count updates.
- **👥 Follow System**: Follow or unfollow other users on the platform with updated follower/following counters.
- **💾 Relational Database**: In-memory relational schema powered by SQLite ensuring transactional integrity across primary & foreign keys.

---

## 🛠️ Tech Stack & Architecture

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3 (`:memory:` database mode)
- **Middleware**: CORS, Body-Parser

### **Frontend**
- **Structure**: Semantic HTML5
- **Styling**: CSS3 (Responsive Grid/Flexbox Layout, Card UI Design)
- **Logic**: Vanilla JavaScript (ES6+ Async/Await Fetch API)

---

## 📁 Project Directory Structure

```text
mini-social-app/
├── package.json          # Node dependencies and execution scripts
├── server.js            # Express backend API server & SQLite database setup
└── public/              # Static frontend assets served by Express
    ├── index.html       # Single Page Application structure
    ├── styles.css       # Responsive styling & layout design
    └── app.js           # Client-side state handling & API requests
