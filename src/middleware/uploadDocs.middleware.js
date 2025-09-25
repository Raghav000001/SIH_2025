import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../helpers/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "college_admissions";

    // Check file type
    let resourceType = "auto"; // default for images
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype.includes("document") ||
      file.mimetype.includes("msword") ||
      file.mimetype.includes("officedocument")
    ) {
      resourceType = "raw"; // docs/pdf ke liye
    }

    return {
      folder,
      resource_type: resourceType,
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

const upload = multer({ storage });

export default upload.fields([
  { name: "tenthMarksheet", maxCount: 1 },
  { name: "twelfthMarksheet", maxCount: 1 },
  { name: "photo", maxCount: 1 },
  { name: "signature", maxCount: 1 },
  { name: "aadharCard", maxCount: 1 },
  { name: "casteCertificate", maxCount: 1 },
  { name: "ewsCertificate", maxCount: 1 },
  { name: "domicile", maxCount: 1 },
  { name: "sportsCertificate", maxCount: 1 },
]);
