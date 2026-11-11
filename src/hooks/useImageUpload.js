import { useState } from "react";
import imageCompression from "browser-image-compression";

const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryUploadPreset);

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
    );
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 20));
      }
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve(result.secure_url);
        } catch {
          reject(new Error("Cloudinary returned an invalid upload response."));
        }
      } else {
        let message = "Image upload failed.";
        try {
          message = JSON.parse(xhr.responseText)?.error?.message || message;
        } catch {
          // Keep the generic message when the server response is not JSON.
        }
        reject(new Error(message));
      }
    });
    xhr.addEventListener("error", () => reject(new Error("Network error during image upload.")));
    xhr.addEventListener("abort", () => reject(new Error("Image upload was cancelled.")));
    xhr.send(formData);
  });
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function uploadImage(file) {
    setUploading(true);
    setProgress(0);

    try {
      if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
        throw new Error(
          "Image uploads are not configured. Set the Cloudinary cloud name and upload preset.",
        );
      }

      // compress first
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        onProgress: (p) => setProgress(Math.round(p * 0.7)), // 0–70% for compression
      });

      setProgress(80);

      // Cloudinary's unsigned preset is public, so keep it restricted to images.
      const url = await uploadToCloudinary(compressed, (uploadProgress) => {
        setProgress(80 + uploadProgress);
      });
      setProgress(100);

      return url;
    } finally {
      setUploading(false);
    }
  }

  return { uploadImage, uploading, progress };
}
