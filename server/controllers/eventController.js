const Event = require('../models/Event');

// @desc  Create event
// @route POST /api/events
const createEvent = async (req, res) => {
  try {
    const { title, description, startTime, endTime, roomType, maxAttendees, tags } = req.body;
    if (!title || !startTime || !endTime)
      return res.status(400).json({ message: 'Title, start time, and end time are required' });

    const event = await Event.create({
      title,
      description,
      host: req.user._id,
      startTime,
      endTime,
      roomType: roomType || 'classroom',
      maxAttendees: maxAttendees || 20,
      tags: tags || [],
    });

    await event.populate('host', 'name avatar email');
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all upcoming events
// @route GET /api/events
const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const events = await Event.find({ isActive: true })
      .populate('host', 'name avatar email')
      .populate('attendees', 'name avatar')
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments({ isActive: true });
    res.json({ events, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single event by ID or join code
// @route GET /api/events/:id
const getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    let event;
    if (id.length === 8) {
      event = await Event.findOne({ joinCode: id.toUpperCase() });
    } else {
      event = await Event.findById(id);
    }
    if (!event) return res.status(404).json({ message: 'Event not found' });
    await event.populate('host', 'name avatar email');
    await event.populate('attendees', 'name avatar');
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Join an event
// @route POST /api/events/:id/join
const joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!event.isActive) return res.status(400).json({ message: 'Event is not active' });
    if (event.attendees.length >= event.maxAttendees)
      return res.status(400).json({ message: 'Event is full' });

    if (!event.attendees.includes(req.user._id)) {
      event.attendees.push(req.user._id);
      await event.save();
    }
    await event.populate('host', 'name avatar email');
    await event.populate('attendees', 'name avatar');
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Join by code
// @route POST /api/events/join-code
const joinByCode = async (req, res) => {
  try {
    const { code } = req.body;
    const event = await Event.findOne({ joinCode: code.toUpperCase() });
    if (!event) return res.status(404).json({ message: 'No event found with that code' });
    if (!event.isActive) return res.status(400).json({ message: 'Event is not active' });

    if (!event.attendees.includes(req.user._id)) {
      event.attendees.push(req.user._id);
      await event.save();
    }
    await event.populate('host', 'name avatar email');
    await event.populate('attendees', 'name avatar');
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete event (host only)
// @route DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.host.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the host can delete this event' });

    event.isActive = false;
    await event.save();
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createEvent, getEvents, getEvent, joinEvent, joinByCode, deleteEvent };
