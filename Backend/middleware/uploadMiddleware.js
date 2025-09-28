const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Common image validation ---
const fileFilter = (req, file, cb) => {
  // accept common image types
  const allowed = /jpeg|jpg|png|gif|webp|svg\+xml/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const isImageMime = (file.mimetype || '').startsWith('image/');
  if (extname && isImageMime) {
    cb(null, true);
  } else {
    cb(new Error('Images only!'));
  }
};

// Decide storage: Cloudinary if fully configured, else local disk
const useCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

let storage;

if (useCloudinary) {
  // Lazy-require so app still runs if these packages aren't installed when not used
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  const cloudinary = require('cloudinary').v2;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: process.env.CLOUDINARY_FOLDER || 'sportnest-profile',
      allowed_formats: ['jpeg', 'png', 'jpg', 'gif', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }],
    },
  });
} else {
  // Local disk fallback (matches previous implementation)
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();
      const base = path.basename(file.originalname, ext).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '');
      cb(null, `${base}-${Date.now()}${ext}`);
    },
  });
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

module.exports = upload;
