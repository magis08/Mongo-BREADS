// models/Todo.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const todoSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    complete: {
        type: Boolean,
        default: false,
    },
    deadline: {
        type: Date,
        required: true,
    },
    executor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;  // Pastikan menggunakan export default
