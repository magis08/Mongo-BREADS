// routes/api/todos.js
import express from 'express';
import Todo from '../../models/todo.js';
import User from '../../models/user.js';

const router = express.Router();

router.post('/todos', async (req, res) => {
    try {
        const { title, deadline, executor } = req.body;

        const user = await User.findById(executor);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newTodo = new Todo({
            title,
            deadline,
            executor,
        });

        await newTodo.save();
        res.status(201).json(newTodo); // Mengembalikan Todo yang baru dibuat
    } catch (err) {
        res.status(500).json({ message: 'Error creating todo', error: err });
    }
});

// Mengambil semua Todo (GET)
router.get('/todos', async (req, res) => {
    try {
        const todos = await Todo.find(); // Mengambil semua todos tanpa filter
        res.status(200).json(todos);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching todos', error: err });
    }
});


// Mengambil Todo berdasarkan ID (GET)
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const todo = await Todo.findById(id).populate('executor', 'name phone');
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.status(200).json(todo);  // Mengembalikan Todo berdasarkan ID
    } catch (err) {
        res.status(500).json({ message: 'Error fetching todo', error: err });
    }
});

// Mengupdate Todo (PUT)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, deadline, complete, executor } = req.body;

    try {
        const todo = await Todo.findById(id);

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        // Validasi apakah executor valid
        if (executor) {
            const user = await User.findById(executor);
            if (!user) {
                return res.status(404).json({ error: 'Executor user not found' });
            }
        }

        // Update data todo
        todo.title = title || todo.title;
        todo.deadline = deadline || todo.deadline;
        todo.complete = complete !== undefined ? complete : todo.complete;
        todo.executor = executor || todo.executor;

        await todo.save();
        res.status(200).json(todo);  // Mengembalikan Todo yang telah diupdate
    } catch (err) {
        res.status(500).json({ message: 'Error updating todo', error: err });
    }
});

// Menghapus Todo (DELETE)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTodo = await Todo.findByIdAndDelete(id);
        if (!deletedTodo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.status(200).json({ message: 'Todo deleted', todo: deletedTodo });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting todo', error: err });
    }
});

export default router;
