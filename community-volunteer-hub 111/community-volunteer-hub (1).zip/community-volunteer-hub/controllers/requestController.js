const Request = require('../models/Request');
const Offer   = require('../models/Offer');
const Message = require('../models/Message');
const User    = require('../models/User');
const path    = require('path');
const fs      = require('fs');
const { asyncHandler, createError } = require('../middleware/errorMiddleware');

// ─────────────────────────────────────────────
// GET /requests
// Browse all open + in-progress requests (EJS)
// ─────────────────────────────────────────────
exports.getAllRequests = asyncHandler(async (req, res) => {
  const { category, status, search } = req.query;

  const filter = { status: { $in: ['Open', 'In Progress'] } };

  if (category) filter.category = category;
  if (status)   filter.status   = status;
  if (search)   filter.title    = { $regex: search, $options: 'i' };

  const requests = await Request.find(filter)
    .populate('postedBy', 'name')
    .sort({ createdAt: -1 });

  const user = req.session && req.session.userId
    ? { _id: req.session.userId, name: req.session.name }
    : null;

  res.render('requests', {
    requests,
    filters: { category: category || '', status: status || '', search: search || '' },
    user,
  });
});

// ─────────────────────────────────────────────
// GET /requests/api
// Browse requests — JSON for React
// ─────────────────────────────────────────────
exports.getAllRequestsApi = asyncHandler(async (req, res) => {
  const { category, status, search } = req.query;

  const filter = { status: { $in: ['Open', 'In Progress'] } };

  if (category) filter.category = category;
  if (status)   filter.status   = status;
  if (search)   filter.title    = { $regex: search, $options: 'i' };

  const requests = await Request.find(filter)
    .populate('postedBy', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, requests });
});

// ─────────────────────────────────────────────
// GET /requests/my
// Logged-in user's posted requests + offers (EJS)
// NOTE: Cancelled requests are excluded from display
// ─────────────────────────────────────────────
exports.getMyRequests = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.redirect('/login');
  }

  const userId = req.user._id;

  // Exclude cancelled — they are permanently gone from the user's view
  const postedRequests = await Request.find({
    postedBy: userId,
    status: { $ne: 'Cancelled' }
  })
    .populate('acceptedVolunteer', 'name')
    .sort({ createdAt: -1 });

  const requestsWithOffers = await Promise.all(
    postedRequests.map(async (r) => {
      const offers = await Offer.find({ request: r._id, status: 'Pending' })
        .populate('volunteer', 'name');
      return { ...r.toObject(), pendingOffers: offers };
    })
  );

  const myOffers = await Offer.find({ volunteer: userId })
    .populate({
      path: 'request',
      populate: { path: 'postedBy', select: 'name' },
    })
    .sort({ createdAt: -1 });

  res.render('my-requests', {
    postedRequests: requestsWithOffers,
    helpingRequests: myOffers,
    user: req.user,
  });
});

// ─────────────────────────────────────────────
// GET /requests/api/my
// My requests + offers — JSON for React
// Cancelled requests are excluded
// ─────────────────────────────────────────────
exports.getMyRequestsApi = asyncHandler(async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  const userId = req.session.userId;

  // Exclude cancelled — permanently hidden from user's view
  const postedRequests = await Request.find({
    postedBy: userId,
    status: { $ne: 'Cancelled' }
  })
    .populate('acceptedVolunteer', 'name')
    .sort({ createdAt: -1 });

  const requestsWithOffers = await Promise.all(
    postedRequests.map(async (r) => {
      const offers = await Offer.find({ request: r._id, status: 'Pending' })
        .populate('volunteer', 'name');
      return { ...r.toObject(), pendingOffers: offers };
    })
  );

  const myOffers = await Offer.find({ volunteer: userId })
    .populate({
      path: 'request',
      populate: { path: 'postedBy', select: 'name' },
    })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    postedRequests: requestsWithOffers,
    helpingRequests: myOffers,
  });
});

// ─────────────────────────────────────────────
// GET /requests/new
// Show the post-a-request form
// ─────────────────────────────────────────────
exports.getPostRequestForm = (req, res) => {
  res.render('post-request', { user: req.user || null, errors: [], old: {} });
};

// ─────────────────────────────────────────────
// POST /requests
// Create a new request (with optional image upload)
// ─────────────────────────────────────────────
exports.createRequest = asyncHandler(async (req, res) => {
  if (!req.user && !req.session?.userId) {
    return res.redirect('/login');
  }

  const userId = req.user?._id || req.session.userId;

  const { title, category, description, location, desiredDate, desiredTime, flexible } = req.body;

  const errors = [];
  if (!title || title.trim().length < 5)       errors.push('Title must be at least 5 characters');
  if (!category)                                errors.push('Category is required');
  if (!description || description.trim().length < 20) errors.push('Description must be at least 20 characters');

  // Online categories don't need a real location
  const onlineCategories = ['IT Repair', 'Tutoring'];
  if (!onlineCategories.includes(category) && !location) {
    errors.push('Location is required');
  }

  if (errors.length > 0) {
    return res.render('post-request', { user: req.user, errors, old: req.body });
  }

  let imagePath = null;
  if (req.files && req.files.image) {
    const file = req.files.image;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.render('post-request', {
        user: req.user,
        errors: ['Only image files are allowed (JPG, PNG, GIF, WEBP)'],
        old: req.body,
      });
    }

    if (file.size > 5 * 1024 * 1024) {
      return res.render('post-request', {
        user: req.user,
        errors: ['Image must be smaller than 5MB'],
        old: req.body,
      });
    }

    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    const uploadPath = path.join(uploadsDir, fileName);
    await file.mv(uploadPath);
    imagePath = `/uploads/${fileName}`;
  }

  await Request.create({
    title,
    category,
    description,
    location:    location || 'Online',
    desiredDate: desiredDate  || null,
    desiredTime: desiredTime  || null,
    flexible:    flexible === 'on',
    image:       imagePath,
    postedBy:    userId,
  });

  res.redirect('/requests');
});

// ─────────────────────────────────────────────
// POST /requests/:id/offer
// Volunteer submits an offer to help
// ─────────────────────────────────────────────
exports.submitOffer = asyncHandler(async (req, res) => {
  const { suggestedTime } = req.body;
  const requestId   = req.params.id;
  const volunteerId = req.user?._id || req.session?.userId;

  if (!volunteerId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const request = await Request.findById(requestId);
  if (!request || request.status === 'Completed' || request.status === 'Cancelled') {
    return res.status(400).json({ success: false, message: 'Request is not available' });
  }

  if (request.postedBy.toString() === volunteerId.toString()) {
    return res.status(400).json({ success: false, message: 'You cannot offer help on your own request' });
  }

 await Offer.findOneAndUpdate(
    { request: requestId, volunteer: volunteerId },
    { suggestedTime: suggestedTime || null, status: 'Pending' },
    { upsert: true, new: true }
  );

  // Send a message to the request owner
  const volunteer = await User.findById(volunteerId).select('name');
  const timeStr = suggestedTime
    ? new Date(suggestedTime).toLocaleString()
    : 'flexible';

  await Message.create({
    sender:   volunteerId,
    receiver: request.postedBy,
    content:  `Hi! I'd like to help with your request "${request.title}" (${request.category} — ${request.location}). I'm available on ${timeStr}. Looking forward to hearing from you!`,
    request:  requestId
  });

  res.json({ success: true, message: 'Your offer has been sent!' });
});

// ─────────────────────────────────────────────
// PUT /requests/:id
// Edit a request (only by owner, only if Open)
// ─────────────────────────────────────────────
exports.updateRequest = asyncHandler(async (req, res) => {
  const userId  = req.user?._id || req.session?.userId;
  const request = await Request.findById(req.params.id);

  if (!request) throw createError(404, 'Request not found');
  if (request.postedBy.toString() !== userId.toString()) {
    throw createError(403, 'Not authorized');
  }
  if (request.status !== 'Open') {
    return res.status(400).json({ success: false, message: 'Only open requests can be edited' });
  }

  const { title, category, description, location, desiredDate, desiredTime, flexible } = req.body;

  request.title       = title       || request.title;
  request.category    = category    || request.category;
  request.description = description || request.description;
  request.location    = location    || request.location;
  request.desiredDate = desiredDate || request.desiredDate;
  request.desiredTime = desiredTime || request.desiredTime;
  request.flexible    = flexible === 'on';

  await request.save();
  res.json({ success: true, message: 'Request updated' });
});

// ─────────────────────────────────────────────
// DELETE /requests/:id
// Cancel a request — status set to Cancelled
// It will never appear in the user's view again
// ─────────────────────────────────────────────
exports.cancelRequest = asyncHandler(async (req, res) => {
  const userId  = req.user?._id || req.session?.userId;
  const request = await Request.findById(req.params.id);

  if (!request) throw createError(404, 'Request not found');
  if (request.postedBy.toString() !== userId.toString()) {
    throw createError(403, 'Not authorized');
  }

  request.status = 'Cancelled';
  await request.save();

  res.json({ success: true, message: 'Request cancelled' });
});

// ─────────────────────────────────────────────
// PUT /requests/:id/complete
// Mark a request as completed (only by owner)
// ─────────────────────────────────────────────
exports.markCompleted = asyncHandler(async (req, res) => {
  const userId  = req.user?._id || req.session?.userId;
  const request = await Request.findById(req.params.id);

  if (!request) throw createError(404, 'Request not found');
  if (request.postedBy.toString() !== userId.toString()) {
    throw createError(403, 'Not authorized');
  }

  request.status = 'Completed';
  await request.save();

  res.json({ success: true, message: 'Marked as completed' });
});

// ─────────────────────────────────────────────
// PUT /offers/:id/accept
// Request owner accepts a volunteer's offer
// ─────────────────────────────────────────────
exports.acceptOffer = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.session?.userId;
  const offer  = await Offer.findById(req.params.id).populate('request');

  if (!offer) throw createError(404, 'Offer not found');
  if (offer.request.postedBy.toString() !== userId.toString()) {
    throw createError(403, 'Not authorized');
  }

  offer.status = 'Accepted';
  await offer.save();

  await Offer.updateMany(
    { request: offer.request._id, _id: { $ne: offer._id }, status: 'Pending' },
    { status: 'Rejected' }
  );

  await Request.findByIdAndUpdate(offer.request._id, {
    status: 'In Progress',
    acceptedVolunteer: offer.volunteer,
  });

  res.json({ success: true, message: 'Offer accepted' });
});

// ─────────────────────────────────────────────
// PUT /offers/:id/reject
// Request owner rejects a volunteer's offer
// ─────────────────────────────────────────────
exports.rejectOffer = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.session?.userId;
  const offer  = await Offer.findById(req.params.id).populate('request');

  if (!offer) throw createError(404, 'Offer not found');
  if (offer.request.postedBy.toString() !== userId.toString()) {
    throw createError(403, 'Not authorized');
  }

  offer.status = 'Rejected';
  await offer.save();

  res.json({ success: true, message: 'Offer rejected' });
});

// ─────────────────────────────────────────────
// PUT /offers/:id/withdraw
// Volunteer withdraws their own offer
// ─────────────────────────────────────────────
exports.withdrawOffer = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.session?.userId;
  const offer  = await Offer.findById(req.params.id);

  if (!offer) throw createError(404, 'Offer not found');
  if (offer.volunteer.toString() !== userId.toString()) {
    throw createError(403, 'Not authorized');
  }

  await offer.deleteOne();
  res.json({ success: true, message: 'Offer withdrawn' });
});