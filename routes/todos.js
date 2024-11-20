import express from 'express';
import Todo from '../models/todo.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Halaman untuk menampilkan todos
router.get('/', async (req, res) => {
    try {
        // Misalnya kita mengambil semua todos
        const todos = await Todo.find().populate('executor', 'name phone');

        // Kirim data todos ke EJS
        res.render('todos');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading todos');
    }
});

export default router;
