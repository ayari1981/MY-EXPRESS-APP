const express = require('express');
const router = express.Router();
const indexController = require('../controllers');

router.get('/', indexController.getIndex);

module.exports = router;