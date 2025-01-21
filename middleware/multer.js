import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileFilter = (req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error("file type not allowed. Only JPEG, PNG, and JPG files are allowed."));
    }
};

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        if (file.fieldname === "profilePicture") {
            callback(null, path.join(__dirname, "../uploads/profile-pictures"));
        } else if (file.fieldname === "image") {
            callback(null, path.join(__dirname, "../uploads/image"));
        }
        // callback(null, folder);
    },
    filename: function (req, file, callback) {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        callback(null, `${name}-${timestamp}${ext}`);
    },
});

const upload = multer({
    storage,
    fileFilter,
    limits: {fileSize: 5 * 1024 * 1024}, // Maksimum ukuran file 5mb
});

export default upload;