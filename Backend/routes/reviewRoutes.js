const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");

// normal member sdha middleware ek import kirima
const protect = require("../middleware/authMiddleware"); 

// ★★★ Admin sdha hari middleware ek import kirima
const protectAdmin = require("../middleware/adminMiddleware"); 


const { getFeaturedReviews } = require('../controllers/reviewController');
// --- Public Routes ---
router.get("/featured", reviewController.getFeaturedReviews);

// --- Member-only Routes ---
router
  .route("/my-review")
  .get(protect, reviewController.getMyReview)
  .post(protect, reviewController.createOrUpdateMyReview)
  .delete(protect, reviewController.deleteMyReview);

// --- Admin-only Routes---
router.get("/admin/all", protectAdmin, reviewController.getAllReviewsForAdmin);


router.patch(
  "/admin/feature/:id",
  protectAdmin, 
  reviewController.toggleFeaturedStatus
);

module.exports = router;