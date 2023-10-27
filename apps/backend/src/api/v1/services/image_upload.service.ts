import cloudinary from "cloudinary";

cloudinary.v2.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  shorten: true,
  cdn_subdomain: true,
  cname: "groceries-backend",
});

export abstract class ImageUploadService {
  static async uploadImage(
    folder: string,
    imagePath: string,
    fileName?: string
  ): Promise<string> {
    const { secure_url, public_id } = await cloudinary.v2.uploader.upload(
      imagePath,
      {
        transformation: { width: 500, height: 500, format: "jpeg" },
        folder: fileName ? undefined : folder,
        public_id: fileName && `${folder}/${fileName}`,
        filename_override: fileName,
      }
    );
    console.log(public_id);
    return secure_url;
  }
}
