import express from 'express';
import User from '../models/user.js';  // Pastikan menambahkan .js untuk file lokal
import { ObjectId } from 'mongodb';

const router = express.Router();

// Menampilkan semua pengguna dengan pagination (API GET /users)
router.get('/', async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;  // Mengambil nilai halaman, default ke 1 jika tidak ada
  const limit = 5;  // Menentukan berapa banyak data yang ditampilkan per halaman
  const skip = (page - 1) * limit;  // Menghitung data yang perlu dilewati berdasarkan halaman

  try {
    // Mengambil data pengguna dengan skip dan limit
    const users = await User.find().skip(skip).limit(limit);
    const totalUsers = await User.countDocuments();  // Menghitung total pengguna
    const totalPages = Math.ceil(totalUsers / limit);  // Menghitung total halaman

    // Mengembalikan data pengguna beserta informasi pagination
    res.status(200).json({ 
      users,
      totalPages
    });
  } catch (err) {
    next(err); // Jika terjadi error, lanjutkan ke error handler
  }
});

// Menambahkan pengguna baru (API POST /users)
router.post('/', async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const newUser = new User({
      name,
      phone
    });

    await newUser.save();  // Menyimpan pengguna baru ke MongoDB
    res.status(201).json(newUser); // Mengembalikan pengguna yang baru dibuat dalam format JSON
  } catch (err) {
    next(err);
  }
});

// Mengambil pengguna berdasarkan ID (API GET /users/:id)
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);  // Mengembalikan data pengguna dalam format JSON
  } catch (err) {
    next(err);
  }
});

// Mengupdate pengguna (API PUT /users/:id)
router.put('/:id', async (req, res, next) => {
  const { id } = req.params;
  const { name, phone } = req.body;

  try {
    const result = await User.findByIdAndUpdate(id, { name, phone }, { new: true });
    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(result);  // Mengembalikan data pengguna yang sudah diperbarui
  } catch (err) {
    next(err);
  }
});

// Menghapus pengguna (API DELETE /users/:id)
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully', user }); // Mengembalikan pesan sukses
  } catch (err) {
    next(err);
  }
});

export default router;
