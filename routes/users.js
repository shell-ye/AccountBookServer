var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/register', (req, res) => {
	console.log( req.body )
	res.send({code: 200, data: 'ok'})
})

module.exports = router;
