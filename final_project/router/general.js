const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (users.some(user => user.username === username)) {
        return res.status(409).json({ message: "Username already exists" });
    }
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        return res.status(200).send(JSON.stringify(books, null, 2));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching book list" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const { isbn } = req.params;
        const book = books[isbn];
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        return res.status(200).send(JSON.stringify(book, null, 2));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching book details" });
    }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author.toLowerCase();
        const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase().includes(author));
        if (booksByAuthor.length === 0) {
            return res.status(404).json({ message: "No books found by this author" });
        }
        return res.status(200).send(JSON.stringify(booksByAuthor, null, 2));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books by author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title.toLowerCase();
        const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase().includes(title));
        if (booksByTitle.length === 0) {
            return res.status(404).json({ message: "No books found with this title" });
        }
        return res.status(200).send(JSON.stringify(booksByTitle, null, 2));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books by title" });
    }
});

// Get book review
public_users.get('/review/:isbn', async (req, res) => {
    try {
        const { isbn } = req.params;
        const book = books[isbn];
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        return res.status(200).send(JSON.stringify(book.reviews, null, 2));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching book reviews" });
    }
});

module.exports.general = public_users;

