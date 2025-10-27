import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin'
  }

  
}, {
  timestamps: true
});

// This prevents OverwriteModelError
export default mongoose.models.Admin || mongoose.model('Admin', adminSchema);