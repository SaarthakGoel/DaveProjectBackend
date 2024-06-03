const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT)

router.route('/')
.get(noteController.getNotes)
.post(noteController.createNotes)
.patch(noteController.updateNotes)
.delete(noteController.deleteNotes)

module.exports = router;