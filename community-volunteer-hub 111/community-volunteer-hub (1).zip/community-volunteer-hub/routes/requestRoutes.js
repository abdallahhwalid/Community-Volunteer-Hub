const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllRequests,
  getAllRequestsApi,
  getMyRequests,
  getMyRequestsApi,
  getPostRequestForm,
  createRequest,
  submitOffer,
  updateRequest,
  cancelRequest,
  markCompleted,
  acceptOffer,
  rejectOffer,
  withdrawOffer,
} = require('../controllers/requestController');
 
// ── EJS routes (keep for non-React fallback) ──────────────────────
router.get('/',    getAllRequests);
router.get('/my',  protect, getMyRequests);
router.get('/new', protect, getPostRequestForm);
 
// ── JSON API routes for React pages ──────────────────────────────
router.get('/api',    getAllRequestsApi);          // GET /requests/api
router.get('/api/my', protect, getMyRequestsApi); // GET /requests/api/my
 
// ── Shared routes (used by both EJS and React) ────────────────────
router.post('/',   protect, createRequest);
router.post('/:id/offer',    protect, submitOffer);
router.put('/:id',           protect, updateRequest);
router.delete('/:id',        protect, cancelRequest);
router.put('/:id/complete',  protect, markCompleted);
router.put('/offers/:id/accept',   protect, acceptOffer);
router.put('/offers/:id/reject',   protect, rejectOffer);
router.put('/offers/:id/withdraw', protect, withdrawOffer);
 
module.exports = router;