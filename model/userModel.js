// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true }, // Will be hashed
//   profilePicture: { type: String }, // URL to the stored profile picture
//   preferences: {
//     defaultLanguage: { type: String, default: 'en' }, // e.g., 'en' for English
//     darkMode: { type: Boolean, default: false },
//     textSize: { type: String, default: 'medium' }, // Options: 'small', 'medium', 'large'
//   },
//   activityLog: [
//     {
//       action: { type: String }, // Action description, e.g., 'Updated profile'
//       timestamp: { type: Date, default: Date.now },
//     },
//   ],
//   twoFactorEnabled: { type: Boolean, default: false },
// }, { timestamps: true });

// // Hash password before saving
// // userSchema.pre('save', async function(next) {
// //   if (this.isModified('password')) {
// //     this.password = await bcrypt.hash(this.password, 10);
// //   }
// //   next();
// // });

// module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
  preferences: {
    defaultLanguage: { type: String, default: 'en' },
    darkMode: { type: Boolean, default: false },
    textSize: { type: String, default: 'medium' },
  },
  activityLog: [
    {
      action: { type: String }, // Description of the action
      timestamp: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

