import { useRef } from "react";
import { useImageUpload } from "../../hooks/useImageUpload";
import { ImagePlus, X } from "lucide-react";

export default function ImageUploader({ value, onChange }) {
  const { uploadImage, uploading, progress } = useImageUpload();
  const inputRef = useRef();

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    // validate type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // validate size before compression (max 10MB raw)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image is too large. Please choose one under 10MB.");
      return;
    }

    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      console.error(err);
      alert(`Upload failed: ${err.message || "Please try again."}`);
    }
  }

  function clearImage() {
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Dish Image
      </label>

      {/* Preview */}
      {value ? (
        <div className="relative w-full h-48 rounded-xl overflow-hidden mb-2">
          <img
            src={value}
            alt="Dish preview"
            className="w-full h-full object-cover"
          />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition mb-2"
        >
          <ImagePlus size={32} className="text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Click to upload image</p>
          <p className="text-xs text-gray-400 mt-1">
            Auto-compressed to under 1MB
          </p>
        </div>
      )}

      {/* Progress bar */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {/* Change button when image exists */}
      {value && !uploading && (
        <button
          onClick={() => inputRef.current?.click()}
          className="text-sm text-blue-600 hover:underline"
        >
          Change image
        </button>
      )}

      {uploading && (
        <p className="text-sm text-blue-600">Uploading... {progress}%</p>
      )}
    </div>
  );
}
