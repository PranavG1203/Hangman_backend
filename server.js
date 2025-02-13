const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const gamesRoute = require('./routes/games');
const cors = require('cors');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/games', gamesRoute);

const mongoURI = 'mongodb+srv://Alex:alex4321@cluster0.p7shb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));