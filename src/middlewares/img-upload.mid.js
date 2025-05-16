import fs from "fs";
import path from "path";
import busboy from "busboy";
import generateUUID from "../utils/generate-uuid.util.js";

const rootPath = process.cwd();

// path to store images
const IMAGE_DIR = path.join(rootPath, "public/images");

console.log(IMAGE_DIR);

// check if folder exists
if (!fs.existsSync(IMAGE_DIR)) {
  // create folder
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

// max file size
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
// allowed mime types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

function imageUploadMid(req, res, next) {
  // busboy instance
  const busboyInstance = busboy({
    headers: req.headers,
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
  });

  // file uploaded array
  req.uploadedFiles = [];
  let uploadError = null;
  // wait for all files to be uploaded
  const fileSavePromises = [];
  req.body = {}; // <-- Add this to collect text fields

  // Collect non-file fields like "bio"
  busboyInstance.on("field", (fieldname, val) => {
    req.body[fieldname] = val;
  });

  busboyInstance.on("file", (fieldname, file, info) => {
    const { filename, encoding, mimeType } = info;

    // check the filed name (only some requests have a field called: files)
    if (fieldname !== "files") {
      file.resume();
      return;
    }

    // check if mime type is allowed
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      uploadError = new Error("only jpeg, png and webp files are allowed");
      file.resume();
      return;
    }

    let ext = "";
    switch (mimeType) {
      case "image/jpeg":
        ext = ".jpg";
        break;
      case "image/png":
        ext = ".png";
        break;
      case "image/webp":
        ext = ".webp";
        break;
      default:
        ext = ".jpg";
        break;
    }

    // unique file name
    const uniqueFileName = generateUUID(10) + ext;

    // store path and file name
    const savePath = path.join(IMAGE_DIR, uniqueFileName);

    // file url to save in db
    const fileUrl = `/images/${uniqueFileName}`;

    // write file
    // const writeStream = fs.createWriteStream(savePath);
    // file.pipe(writeStream);

    // Wrap stream writing in a Promise
    const filePromise = new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(savePath);
      file.pipe(writeStream);

      writeStream.on("error", (err) => {
        uploadError = "File saving failed";
        file.resume();
        reject(err);
      });

      writeStream.on("finish", () => {
        const fileObj = {
          originalName: filename,
          savedName: uniqueFileName,
          url: fileUrl,
          mimeType,
        };
        req.uploadedFiles.push(fileObj);
        resolve();
      });
    });

    fileSavePromises.push(filePromise);
  });

  // on busboyInstance error
  busboyInstance.on("error", (err) => {
    console.error("busboyInstance error:", err);
    return res.status(500).json({
      message: "busboyInstance error",
      success: false,
      data: null,
      error: err,
    });
  });

  // on busboyInstance finish
  busboyInstance.on("finish", async () => {
    // we wait for all files to be uploaded =: before next()
    try {
      await Promise.all(fileSavePromises); // Wait for all file writes
    } catch (err) {
      console.error("File saving failed:", err);
      return res.status(500).json({
        message: "File saving failed",
        success: false,
        data: null,
        error: err,
      });
    }

    //  check for upload error
    if (uploadError) {
      console.error("File upload failed:", uploadError);
      return res.status(400).json({
        message: "File upload failed",
        success: false,
        data: null,
        error: uploadError,
      });
    }

    next();
  });

  // pipe the incoming request into the busboyInstance
  req.pipe(busboyInstance);
}

export default imageUploadMid;
