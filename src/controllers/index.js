const path = require('path');

exports.getIndex = (req, res) => {
  res.sendFile('index.html', { root: './views' });
};

exports.getAbout = (req, res) => {
    res.send('This is the about page.');
};