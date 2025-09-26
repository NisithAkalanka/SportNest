const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");

// සාමාන්‍ය member සඳහා middleware එක import කිරීම
const protect = require("../middleware/authMiddleware"); 

// ★★★ Admin සඳහා නිවැරදි middleware එක import කිරීම ★★★
const protectAdmin = require("../middleware/adminMiddleware"); 


// --- Public Routes ---
router.get("/featured", reviewController.getFeaturedReviews);

// --- Member-only Routes ---
router
  .route("/my-review")
  .get(protect, reviewController.getMyReview)
  .post(protect, reviewController.createOrUpdateMyReview)
  .delete(protect, reviewController.deleteMyReview);

// --- Admin-only Routes (නිවැරදි කරන ලද) ---
// ★★★ මෙතන 'protect' වෙනුවට 'protectAdmin' යොදන්න ★★★
router.get("/admin/all", protectAdmin, reviewController.getAllReviewsForAdmin);

// ★★★ මෙතන 'protect' වෙනුවට 'protectAdmin' යොදන්න ★★★
router.patch(
  "/admin/feature/:id",
  protectAdmin, 
  reviewController.toggleFeaturedStatus
);

module.exports = router;