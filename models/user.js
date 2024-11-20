import mongoose from 'mongoose';
const { Schema } = mongoose;

// Definisikan schema untuk pengguna
const userSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true }
});

// Membuat model berdasarkan schema
const User = mongoose.model('User', userSchema);

export default User;
