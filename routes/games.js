const express = require('express');
const router = express.Router();
const Game = require('../models/game');
const Leaderboard = require('../models/leaderboard');
const riddlesPool = require('../riddles');

// Fetch leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await Leaderboard.find().sort({ score: -1 });
        res.json(leaderboard);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Get riddles
router.get('/riddles', async (req, res) => {
    try {
        const selectedRiddles = riddlesPool.sort(() => 0.5 - Math.random()).slice(0, 10);
        res.json(selectedRiddles);
    } catch (err) {
        res.status(500).json('Error: ' + err);
    }
});

// Create a new game
router.post('/new', async (req, res) => {
    const playerName = req.body.playerName;
    const newGame = new Game({ playerName });

    try {
        const savedGame = await newGame.save();
        res.status(201).json(savedGame);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});



router.get('/players', async (req, res) => {
    try {
        const players = await Game.find().select('playerName');
        res.json(players);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});


// Get a game by ID
router.get('/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json('Game not found');
        }
        res.json(game);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Answer a riddle
router.post('/:id/answer', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json('Game not found');
        }

        const { answer } = req.body;
        const currentRiddle = riddlesPool[game.currentRiddleIndex];
        const currentTime = new Date();

        if (answer.toLowerCase() === currentRiddle.answer.toLowerCase()) {
            game.currentRiddleIndex += 1;
            game.score += 100; // Base points for a correct answer

            // Calculate time taken to answer the question
            const questionStartTime = game.questionTimes[game.currentRiddleIndex - 1] || game.startTime;
            const timeTaken = (currentTime - questionStartTime) / 1000; // Time taken in seconds

            // Award extra points based on time taken
            if (timeTaken <= 10) {
                game.score += 50; // Extra points for answering within 10 seconds
            } else if (timeTaken <= 30) {
                game.score += 30; // Extra points for answering within 30 seconds
            } else if (timeTaken <= 60) {
                game.score += 10; // Extra points for answering within 60 seconds
            }

            // Record the start time for the next question
            if (game.currentRiddleIndex < riddlesPool.length) {
                game.questionTimes.push(currentTime);
            } else {
                game.status = 'completed';
            }
        }

        await game.save();

        if (game.status === 'completed') {
            const newEntry = new Leaderboard({ name: game.playerName, score: game.score });
            await newEntry.save();
        }

        res.json(game);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

module.exports = router;