import imageCompression from 'browser-image-compression';

export interface CompressResult {
  file: File | Blob;
  dataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
}

export async function compressImageForUpload(file: File): Promise<CompressResult> {
  const originalSizeKb = Math.round(file.size / 1024);

  const options = {
    maxSizeMB: 0.3, // Limit to ~300KB
    maxWidthOrHeight: 1280,
    useWebWorker: true,
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    const compressedSizeKb = Math.round(compressedBlob.size / 1024);

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          file: compressedBlob,
          dataUrl: reader.result as string,
          originalSizeKb,
          compressedSizeKb,
        });
      };
      reader.readAsDataURL(compressedBlob);
    });
  } catch (error) {
    console.warn('Image compression fallback:', error);
    // Fallback if compression fails
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          file,
          dataUrl: reader.result as string,
          originalSizeKb,
          compressedSizeKb: originalSizeKb,
        });
      };
      reader.readAsDataURL(file);
    });
  }
}
