/**
 * Utility to compress and resize image files client-side before upload or data URL persistence.
 * Prevents payload size errors and guarantees crisp quality with fast uploads on both mobile and desktop.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.82
): Promise<{ file: File; dataUrl: string }> {
  // If not an image (e.g. PDF), return original
  if (!file.type.startsWith("image/")) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ file, dataUrl: reader.result as string });
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scaling
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve({ file, dataUrl: reader.result as string });
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(mimeType, quality);

        // Also convert to Blob / File
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: mimeType,
                lastModified: Date.now(),
              });
              resolve({ file: compressedFile, dataUrl });
            } else {
              resolve({ file, dataUrl });
            }
          },
          mimeType,
          quality
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
