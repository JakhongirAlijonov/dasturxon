import { useState } from "react";
import imageCompression from "browser-image-compression";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function uploadImage(file, restaurantId) {
    setUploading(true);
    setProgress(0);

    try {
      // compress first
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        onProgress: (p) => setProgress(Math.round(p * 0.7)), // 0–70% for compression
      });

      setProgress(75);

      // upload to Firebase Storage
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(
        storage,
        `restaurants/${restaurantId}/dishes/${fileName}`,
      );
      await uploadBytes(storageRef, compressed);

      setProgress(95);

      const url = await getDownloadURL(storageRef);
      setProgress(100);

      return url;
    } finally {
      setUploading(false);
    }
  }

  return { uploadImage, uploading, progress };
}
