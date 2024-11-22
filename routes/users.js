import express from 'express';
import User from '../models/user.js'

const router = express.Router();

// Fetch users with pagination, search query, and sorting
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5; // Ambil limit dari query string, default ke 5
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || ''; // Ambil query pencarian jika ada
    const sortBy = req.query.sortBy || 'name'; // Default sort by 'name'
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1; // Default sort order is 'asc'

    // Jika limit adalah 0 (untuk "All"), set limit ke angka besar (misalnya 1000)
    const actualLimit = limit === 0 ? 1000 : limit;

    // Buat filter pencarian
    const searchFilter = {
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive search for name
        { phone: { $regex: searchQuery, $options: 'i' } } // Case-insensitive search for phone
      ]
    };

    // Cari pengguna berdasarkan filter, pagination, dan sorting
    const users = await User.find(searchFilter)
      .skip(skip)
      .limit(actualLimit)
      .sort({ [sortBy]: sortOrder });

    const totalUsers = await User.countDocuments(searchFilter); // Hitung jumlah total user yang sesuai filter

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / actualLimit),
      totalUsers,
    });
  } catch (err) {
    next(err); // Jika error, lanjutkan ke handler
  }
});

// Endpoint untuk menambah pengguna
router.post('/', async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const newUser = new User({ name, phone });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

// Mendapatkan pengguna berdasarkan ID
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// Mengupdate pengguna
router.put('/:id', async (req, res, next) => {
  const { id } = req.params;
  const { name, phone } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, { name, phone }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
});

// Menghapus pengguna
router.delete('/:id', async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully', deletedUser });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/todos', async function (req, res) {
  try{
  const userId = req.params.id
  console.log('userId:', userId)
  res.render('todos', { userId })
  } catch (error) {
    console.log('error')
  }
})

export default router;