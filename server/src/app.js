const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan')

const api = require('./routes/api');

const app = express();

app.use(cors({
  origin : 'http://localhost:3000'
}));
app.use(morgan('tiny'));

app.use(express.json());
app.use(express.static(path.join(__dirname,'..','public', 'build')))

app.use('/v1',api);

// app.get('/*', function (req, res) {
//   res.sendFile(path.join(__dirname, '..', 'public', 'build' , 'index.html'));
// });

module.exports = app; 