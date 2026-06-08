const express = require('express');
const router = express.Router();

router.post('/wise', (req, res) => {
  console.log('Webhook received:', req.body);
  res.sendStatus(200);
});

module.exports = router;