import express from 'express';
import Todo from '../models/todo.js'; // Sesuaikan path jika model berada di lokasi yang berbeda
import moment from 'moment'; // Untuk format tanggal

const router = express.Router();

// API untuk mengambil todos berdasarkan userId dan query params
router.get('/api/todos/user/:userId', async (req, res) => {
    const { page = 1, limit = 10, title = '', complete, startdateDeadline, enddateDeadline, sortBy = '_id', sortMode = 'desc' } = req.query;
    const userId = req.params.userId;

    try {
        const query = { executor: userId };

        if (title) query.title = { $regex: title, $options: 'i' };
        if (complete !== undefined) query.complete = complete === 'true';
        if (startdateDeadline) query.deadline = { $gte: moment(startdateDeadline).toISOString() };
        if (enddateDeadline) query.deadline = { $lte: moment(enddateDeadline).toISOString() };

        const todos = await Todo.find(query)
            .sort({ [sortBy]: sortMode === 'asc' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const totalCount = await Todo.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            data: todos,
            totalPages,
            currentPage: Number(page),
            totalCount
        });
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).send('Error fetching todos');
    }
});

// API untuk menambah todo baru
router.post('/api/todos', async (req, res) => {
    const { title, executor } = req.body;

    try {
        const newTodo = new Todo({
            title,
            executor,
            complete: false,
            deadline: null
        });
        await newTodo.save();
        res.status(201).json(newTodo);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).send('Error creating todo');
    }
});

// API untuk mengedit todo
router.put('/api/todos/:id', async (req, res) => {
    const { title, deadline, complete } = req.body;
    const todoId = req.params.id;

    try {
        const updatedTodo = await Todo.findByIdAndUpdate(todoId, { title, deadline, complete }, { new: true });
        if (!updatedTodo) {
            return res.status(404).send('Todo not found');
        }
        res.json(updatedTodo);
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).send('Error updating todo');
    }
});

// API untuk menghapus todo
router.delete('/api/todos/:id', async (req, res) => {
    const todoId = req.params.id;

    try {
        const deletedTodo = await Todo.findByIdAndDelete(todoId);
        if (!deletedTodo) {
            return res.status(404).send('Todo not found');
        }
        res.json(deletedTodo);
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).send('Error deleting todo');
    }
});

// View rendering: Menampilkan todos berdasarkan userId
router.get('/todos/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const todos = await Todo.find({ executor: userId });
        res.render('todos', { userId, todos });
    } catch (err) {
        console.error('Error fetching todos:', err);
        res.status(500).send('Error fetching todos');
    }
});

export default router;
