import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../helpers/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "college_admissions"; // sabhi uploads yaha jayenge
    return {
      folder,
      resource_type: "auto", // images + pdf dono chalega
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
