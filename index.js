const express = require('express');
const app = express();
const cors = require('cors');
const env = require('dotenv').config();



app.use(cors({optionsSuccessStatus: 200}));