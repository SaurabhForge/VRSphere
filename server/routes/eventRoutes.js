const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEvent,
  joinEvent,
  joinByCode,
  deleteEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getEvents).post(protect, createEvent);
router.post('/join-code', protect, joinByCode);
router.route('/:id').get(protect, getEvent).delete(protect, deleteEvent);
router.post('/:id/join', protect, joinEvent);

module.exports = router;
