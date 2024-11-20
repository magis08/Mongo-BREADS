import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import mongoose from 'mongoose';

// Import routes
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import todosRouter from './routes/todos.js'; // Route untuk halaman todos (EJS)
import usersApiRouter from './routes/api/users.js';
import todosApiRouter from './routes/api/todos.js'; // API route untuk todos

const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost/todos')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Get __dirname using import.meta.url
const __dirname = new URL('.', import.meta.url).pathname;

// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware setup
app.use(logger('dev'));
app.use(express.json());  // Untuk parse JSON requests
app.use(express.urlencoded({ extended: false }));  // Untuk parse URL encoded requests
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));  // Untuk file static seperti Bootstrap, FontAwesome, dsb

// Setup routes
app.use('/', indexRouter);  // Menggunakan indexRouter untuk rendering halaman EJS
app.use('/users', usersRouter);  // Route untuk manajemen pengguna (web)
app.use('/api/users', usersApiRouter);  // Gunakan API route untuk operasi CRUD pengguna
app.use('/api/todos', todosApiRouter);  // API route untuk operasi CRUD todos
app.use('/todos', todosRouter);  // Route untuk tampilan todos di halaman EJS

// Error handling
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};  // Menampilkan error hanya di development
  res.status(err.status || 500);
  res.render('error');  // Render error page jika terjadi kesalahan
});

export default app;
