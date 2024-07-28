const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    { id: 1, username: 'username', password: 'password' },
    { id: 2, username: 'username2', password: 'password2' }
];

const isValid = (username) => {
    // Check if the username is valid (not empty and not already taken)
    return username && !users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    // Check if the username and password match the records
    return users.some(user => user.username === username && user.password === password);
};

// Register a new user
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (!isValid(username)) {
        return res.status(400).json({ message: "Username is already taken or invalid" });
    }
    const newUser = { id: users.length + 1, username, password };
    users.push(newUser);
    return res.status(200).json({ message: "User registered successfully", user: newUser });
});

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }
    // Generate JWT token
    const token = jwt.sign({ username }, 'your_jwt_secret_key', { expiresIn: '1h' });
    return res.status(200).json({ message: "Login successful", token });
});

// Middleware to check JWT token
regd_users.use("/auth/*", (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ message: "A token is required for authentication" });
    }
    try {
        const decoded = jwt.verify(token.split(' ')[1], 'your_jwt_secret_key');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid Token" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const book = Object.values(books).find(book => book.isbn === isbn);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }
    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }
    const username = req.user.username;
    if (!book.reviews) {
        book.reviews = {};
    }
    if (!book.reviews[username]) {
        book.reviews[username] = [];
    }
    book.reviews[username].push(review);
    return res.status(200).json({ message: "Review added successfully", reviews: book.reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const book = Object.values(books).find(book => book.isbn === isbn);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }
    const username = req.user.username;
    if (!book.reviews || !book.reviews[username]) {
        return res.status(403).json({ message: "You have not posted any reviews for this book" });
    }
    delete book.reviews[username];
    return res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

