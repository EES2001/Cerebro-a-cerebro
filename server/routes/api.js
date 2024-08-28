const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('API está funcionando');
});

module.exports = router;
