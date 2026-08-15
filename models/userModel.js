const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    trim: true
  },

  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
  type: String,
  required: [true, 'Please confirm your password'],
  validate: {
    validator: function(el) {
      return el === this.password;
    },
    message: 'Passwords are not the same'
  }
},
  role: {
    type: String,
    enum: ['student', 'organizer', 'admin'],
    default: 'student'
  },
  passwordChangedAt: Date
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return ;

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

});
userSchema.pre('save', function() {
  if (!this.isModified('password') || this.isNew) return;

  this.passwordChangedAt = Date.now() - 1000;
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};
const User = mongoose.model('User', userSchema);

module.exports = User;