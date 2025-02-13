const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    currentRiddleIndex: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    status: { type: String, default: 'playing' }, // 'playing', 'completed', 'failed'
    playerName: { type: String, required: true },
    startTime: { type: Date, default: Date.now },
    questionTimes: { type: [Date], default: [] }
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;