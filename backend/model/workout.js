const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  photos: [String], 
  music: [
    {
      type: mongoose.Schema.Types.ObjectId, // References the Music model
      ref: 'Music',
    },
  ],

}, { timestamps: true });

const Workout = mongoose.model('Workout', workoutSchema);
module.exports = Workout;
