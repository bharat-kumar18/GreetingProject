const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on fieldname or some other logic
    // For now we assume this is just for templates
    cb(null, path.join(__dirname, '../../templates'));
  },
  filename: (req, file, cb) => {
    // generate a unique filename
    const uniqueSuffix = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/svg+xml' || path.extname(file.originalname).toLowerCase() === '.svg') {
    cb(null, true);
  } else {
    cb(new Error('Only SVG files are allowed'), false);
  }
};

const uploadTemplate = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  }
});

const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    const dest = path.join(__dirname, '../../../backend/storage/uploads');
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const uploadCsv = multer({
  storage: csvStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

module.exports = { uploadTemplate, uploadCsv };
