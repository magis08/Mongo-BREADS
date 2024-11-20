import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import mongoose from 'mongoose';

// Import routes
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import todosRouter from './routes/todos.js';

const app = express();
const __dirname = new URL('.', import.meta.url).pathname;

// MongoDB connection
mongoose.connect('mongodb://localhost/todos')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Setup view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Setup routes
app.use('/', indexRouter);  // Homepage route
app.use('/users', usersRouter);  // Users route
app.use('/todos', todosRouter);  // Add this line to make the /todos route work

// Error handling
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

export default app;

