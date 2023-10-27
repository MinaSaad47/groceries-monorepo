import fs from "fs/promises";
import multer from "multer";
import path from "path";

export const uploadProfilePicture = multer({
  storage: multer.diskStorage({
    destination: async function (req, file, cb) {
      const user = req.user!;
      const directory = `public/profiles/${user.id}`;
      try {
        await fs.mkdir(directory, { recursive: true });
        cb(null, directory);
      } catch (error: any) {
        cb(error, directory);
      }
    },
    filename: function (req, file, cb) {
      const user = req.user!;
      cb(null, "picture" + path.extname(file.originalname));
    },
  }),
}).single("picture");

export const uploadCategoryImage = multer({
  storage: multer.diskStorage({
    destination: async function (req, file, cb) {
      const user = req.user!;
      const directory = `public/categories/${req.params.categoryId}`;
      try {
        await fs.mkdir(directory, { recursive: true });
        cb(null, directory);
      } catch (error: any) {
        cb(error, directory);
      }
    },
    filename: function (req, file, cb) {
      const user = req.user!;
      cb(null, "image" + path.extname(file.originalname));
    },
  }),
}).single("image");

export const uploadItemImage = multer({
  storage: multer.diskStorage({
    destination: async function (req, file, cb) {
      const user = req.user!;
      const directory = `public/items/${req.params.itemId}`;
      try {
        await fs.mkdir(directory, { recursive: true });
        cb(null, directory);
      } catch (error: any) {
        cb(error, directory);
      }
    },
    filename: function (req, file, cb) {
      const user = req.user!;
      cb(null, crypto.randomUUID() + path.extname(file.originalname));
    },
  }),
}).single("image");

export const uploadItemThumbnail = multer({
  storage: multer.diskStorage({
    destination: async function (req, file, cb) {
      const user = req.user!;
      const directory = `public/items/${req.params.itemId}`;
      try {
        await fs.mkdir(directory, { recursive: true });
        cb(null, directory);
      } catch (error: any) {
        cb(error, directory);
      }
    },
    filename: function (req, file, cb) {
      const user = req.user!;
      cb(null, "thumbnail" + path.extname(file.originalname));
    },
  }),
}).single("thumbnail");
