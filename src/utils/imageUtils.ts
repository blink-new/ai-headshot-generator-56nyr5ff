import heic2any from 'heic2any';

export interface ProcessedImage {
  file: File;
  url: string;
  isConverted: boolean;
}

/**
 * Converts HEIC/HEIF images to PNG format
 */
export const convertHeicToPng = async (file: File): Promise<File> => {
  try {
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/png',
      quality: 0.9,
    });

    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    const convertedFile = new File(
      [blob],
      file.name.replace(/\.(heic|heif)$/i, '.png'),
      { type: 'image/png' }
    );

    return convertedFile;
  } catch (error) {
    console.error('Error converting HEIC to PNG:', error);
    throw new Error('Failed to convert HEIC image');
  }
};

/**
 * Processes uploaded images, converting HEIC to PNG if needed
 */
export const processUploadedImage = async (file: File): Promise<ProcessedImage> => {
  const isHeic = /\.(heic|heif)$/i.test(file.name);
  
  let processedFile = file;
  let isConverted = false;

  if (isHeic) {
    processedFile = await convertHeicToPng(file);
    isConverted = true;
  }

  // Create object URL for preview
  const url = URL.createObjectURL(processedFile);

  return {
    file: processedFile,
    url,
    isConverted,
  };
};

/**
 * Validates file type and size
 */
export const validateImageFile = (file: File): string | null => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ];

  // Check file size
  if (file.size > maxSize) {
    return 'File size must be less than 10MB';
  }

  // Check file type
  const isValidType = allowedTypes.includes(file.type) || 
    /\.(heic|heif)$/i.test(file.name);

  if (!isValidType) {
    return 'Please upload a valid image file (JPEG, PNG, WebP, HEIC)';
  }

  return null;
};

/**
 * Generates a download filename for generated images
 */
export const generateDownloadFilename = (index: number, style: string): string => {
  const timestamp = new Date().toISOString().slice(0, 10);
  const sanitizedStyle = style.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `headshot-${sanitizedStyle}-${index + 1}-${timestamp}.png`;
};

/**
 * Downloads a single image from URL
 */
export const downloadImage = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw new Error('Failed to download image');
  }
};