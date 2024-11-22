import express from 'express';
import Todo from '../models/todo.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.get('/', async (req, res) => {
    const { page = 1, limit = 10, title, complete, startdateDeadline, enddateDeadline, sortBy = 'deadline', sortMode = 'asc', executor } = req.query;
    const query = {};
    if (title) query.title = { $regex: title, $options: 'i' };
    if (complete !== undefined) query.complete = complete === 'true';
    if (startdateDeadline || enddateDeadline) {
        query.deadline = {};
        if (startdateDeadline && enddateDeadline) {
            // convert object date to iso string
            // covert iso string to object date
            query.deadline = { $gte: new Date(startdateDeadline).toISOString(), $lte: new Date(enddateDeadline).toISOString() };
            query.deadline = { $gte: new Date(startdateDeadline), $lte: new Date(enddateDeadline) };
        } else if (startdateDeadline) {
            query.deadline = { $gte: new Date(startdateDeadline).toISOString() };
            query.deadline = { $gte: new Date(startdateDeadline) };
        } else if (enddateDeadline) {
            query.deadline = { $lte: new Date(enddateDeadline).toISOString() };
            query.deadline = { $lte: new Date(enddateDeadline) };
        }
    }
    if (executor) query.executor = new ObjectId(executor);

    const sort = { [sortBy]: sortMode === 'desc' ? -1 : 1 };
    const offset = (page - 1) * limit;

    try {
        const todos = await Todo.find(query)
            .sort({ [sortBy]: sortMode === 'asc' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

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


// CREATE TODO
router.post('/', async (req, res) => {
    const { title, executor } = req.body;
    const defaultDeadline = new Date()
    try {
        const newTodo = new Todo({
            title,
            executor,
            complete: false,
            deadline: defaultDeadline
        });
        await newTodo.save();
        res.status(201).json(newTodo);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).send('Error creating todo');
    }
});

// UPDATE TODO
router.put('/:id', async (req, res) => {
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

// DELETE TODO
router.delete('/:id', async (req, res) => {
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


export default router;
