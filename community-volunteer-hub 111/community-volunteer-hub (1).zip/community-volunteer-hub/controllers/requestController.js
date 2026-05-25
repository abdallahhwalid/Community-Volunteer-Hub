const Request = require('../models/Request');
const Offer   = require('../models/Offer');
 
// ─────────────────────────────────────────────
// GET /requests
// Browse all open + in-progress requests
// ─────────────────────────────────────────────
exports.getAllRequests = async (req, res) => {
  try {
    const { category, status, search } = req.query;
 
    const filter = { status: { $in: ['Open', 'In Progress'] } };
 
    if (category) filter.category = category;
    if (status)   filter.status   = status;
    if (search)   filter.title    = { $regex: search, $options: 'i' };
 
    const requests = await Request.find(filter)
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 });
 
    res.render('requests', {
      requests,
      filters: { category: category || '', status: status || '', search: search || '' },
      user: req.user || null,
    });
  } catch (err) {
    console.error('getAllRequests error:', err);
    res.status(500).send('Server error');
  }
};
 
// ─────────────────────────────────────────────
// GET /requests/my
// Logged-in user's posted requests + offers they made
// ─────────────────────────────────────────────
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user._id;
 
    // Requests this user posted, with pending offers populated
    const postedRequests = await Request.find({ postedBy: userId })
      .populate('acceptedVolunteer', 'name')
      .sort({ createdAt: -1 });
 
    // Attach pending offers to each posted request
    const requestsWithOffers = await Promise.all(
      postedRequests.map(async (r) => {
        const offers = await Offer.find({ request: r._id, status: 'Pending' })
          .populate('volunteer', 'name');
        return { ...r.toObject(), pendingOffers: offers };
      })
    );
 
    // Requests this user offered to help with
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
  } catch (err) {
    console.error('getMyRequests error:', err);
    res.status(500).send('Server error');
  }
};
 
// ─────────────────────────────────────────────
// GET /requests/new
// Show the post-a-request form
// ─────────────────────────────────────────────
exports.getPostRequestForm = (req, res) => {
  res.render('post-request', { user: req.user, errors: [], old: {} });
};
 
// ─────────────────────────────────────────────
// POST /requests
// Create a new request
// ─────────────────────────────────────────────
exports.createRequest = async (req, res) => {
  try {
    const { title, category, description, location, desiredDate, desiredTime, flexible } = req.body;
 
    // Basic server-side validation
    const errors = [];
    if (!title)       errors.push('Title is required');
    if (!category)    errors.push('Category is required');
    if (!description) errors.push('Description is required');
    if (!location)    errors.push('Location is required');
 
    if (errors.length > 0) {
      return res.render('post-request', { user: req.user, errors, old: req.body });
    }
 
    await Request.create({
      title,
      category,
      description,
      location,
      desiredDate:  desiredDate  || null,
      desiredTime:  desiredTime  || null,
      flexible:     flexible === 'on',
      postedBy:     req.user._id,
    });
 
    res.redirect('/requests');
  } catch (err) {
    console.error('createRequest error:', err);
    res.status(500).send('Server error');
  }
};
 
// ─────────────────────────────────────────────
// POST /requests/:id/offer
// Volunteer submits an offer to help
// ─────────────────────────────────────────────
exports.submitOffer = async (req, res) => {
  try {
    const { suggestedTime } = req.body;
    const requestId = req.params.id;
    const volunteerId = req.user._id;
 
    const request = await Request.findById(requestId);
    if (!request || request.status === 'Completed' || request.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Request is not available' });
    }
 
    // Prevent the poster from offering on their own request
    if (request.postedBy.toString() === volunteerId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot offer help on your own request' });
    }
 
    // Upsert: update if already offered, create if not
    await Offer.findOneAndUpdate(
      { request: requestId, volunteer: volunteerId },
      { suggestedTime: suggestedTime || null, status: 'Pending' },
      { upsert: true, new: true }
    );
 
    res.json({ success: true, message: 'Your offer has been sent!' });
  } catch (err) {
    console.error('submitOffer error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
 
// ─────────────────────────────────────────────
// PUT /requests/:id
// Edit a request (only by owner, only if Open)
// ─────────────────────────────────────────────
exports.updateRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
 
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
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
  } catch (err) {
    console.error('updateRequest error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
 
// ─────────────────────────────────────────────
// DELETE /requests/:id
// Cancel a request (only by owner, only if Open)
// ─────────────────────────────────────────────
exports.cancelRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
 
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
 
    request.status = 'Cancelled';
    await request.save();
 
    res.json({ success: true, message: 'Request cancelled' });
  } catch (err) {
    console.error('cancelRequest error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
 
// ─────────────────────────────────────────────
// PUT /requests/:id/complete
// Mark a request as completed (only by owner)
// ─────────────────────────────────────────────
exports.markCompleted = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
 
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
 
    request.status = 'Completed';
    await request.save();
 
    res.json({ success: true, message: 'Marked as completed' });
  } catch (err) {
    console.error('markCompleted error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
 
// ─────────────────────────────────────────────
// PUT /offers/:id/accept
// Request owner accepts a volunteer's offer
// ─────────────────────────────────────────────
exports.acceptOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('request');
 
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    if (offer.request.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
 
    // Accept this offer
    offer.status = 'Accepted';
    await offer.save();
 
    // Reject all other pending offers for the same request
    await Offer.updateMany(
      { request: offer.request._id, _id: { $ne: offer._id }, status: 'Pending' },
      { status: 'Rejected' }
    );
 
    // Update request status and record the accepted volunteer
    await Request.findByIdAndUpdate(offer.request._id, {
      status: 'In Progress',
      acceptedVolunteer: offer.volunteer,
    });
 
    res.json({ success: true, message: 'Offer accepted' });
  } catch (err) {
    console.error('acceptOffer error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
 
// ─────────────────────────────────────────────
// PUT /offers/:id/reject
// Request owner rejects a volunteer's offer
// ─────────────────────────────────────────────
exports.rejectOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('request');
 
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    if (offer.request.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
 
    offer.status = 'Rejected';
    await offer.save();
 
    res.json({ success: true, message: 'Offer rejected' });
  } catch (err) {
    console.error('rejectOffer error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
 
// ─────────────────────────────────────────────
// PUT /offers/:id/withdraw
// Volunteer withdraws their own offer
// ─────────────────────────────────────────────
exports.withdrawOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
 
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    if (offer.volunteer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
 
    await offer.deleteOne();
    res.json({ success: true, message: 'Offer withdrawn' });
  } catch (err) {
    console.error('withdrawOffer error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};