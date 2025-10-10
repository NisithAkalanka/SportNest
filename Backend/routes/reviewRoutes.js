// ===============================================
// File: backend/routes/reviewRoutes.js
// ===============================================

const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");

// --------------------------------------------------
// --- Middleware Imports (All Preserved)
// --------------------------------------------------

// Member and Admin middleware hariyta import kirima
const { protectAny, adminOnly, protectCoach } = require('../middleware/authMiddleware'); 
// (your protect middleware eka protectAny nam, eka hari. Admin sdha adminOnly wiya yuthui)

// Normal member sdha wenma middleware ekk use karanne nam, meya valid
const protect = require("../middleware/authMiddleware"); 

// Admin sdha wenm middleware ekk tibenam, meny valid.
const protectAdmin = require("../middleware/adminMiddleware"); 

// --------------------------------------------------
// --- Public Routes ---
// --------------------------------------------------

router.get("/featured", reviewController.getFeaturedReviews);

// --------------------------------------------------
// --- Member-only Routes ---
// --------------------------------------------------


router
  .route("/my-review")
  .get(protectAny || protect, reviewController.getMyReview)
  .post(protectAny || protect, reviewController.createOrUpdateMyReview)
  .delete(protectAny || protect, reviewController.deleteMyReview);

// --------------------------------------------------
// --- Admin-only Routes ---
// --------------------------------------------------

// Both admin middleware variations supported
router.get(
  "/admin/all",
  protectAny || protectAdmin,
  adminOnly || ((req, res, next) => next()),
  reviewController.getAllReviewsForAdmin
);

router.patch(
  "/admin/feature/:id",
  protectAny || protectAdmin,
  adminOnly || ((req, res, next) => next()),
  reviewController.toggleFeaturedStatus
);

// <<< NEW: Admin t review ekk delete kirimta route ek >>>
router.delete(
  "/admin/delete/:id",
  protectAny || protectAdmin,
  adminOnly || ((req, res, next) => next()),
  reviewController.deleteReviewByAdmin
);

// --------------------------------------------------
// --- Module Export ---
// --------------------------------------------------

module.exports = router;
