import mongoose from 'mongoose';

const { Schema } = mongoose;

// Schema untuk Todo
const todoSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    complete: {
        type: Boolean,
        default: false, // Default status adalah belum selesai
    },
    deadline: {
        type: Date,
        required: true,
    },
    executor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Mengacu pada model User
        required: true,
    },
}, { timestamps: true });

// Model Todo
const Todo = mongoose.model('Todo', todoSchema);

export default Todo;
