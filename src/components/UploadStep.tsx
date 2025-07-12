import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X, CheckCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ProcessedImage, processUploadedImage, validateImageFile } from '../utils/imageUtils';
import toast from 'react-hot-toast';

interface UploadStepProps {
  onImageUploaded: (file: File) => void;
  uploadedImage: File | null;
}

const UploadStep: React.FC<UploadStepProps> = ({ onImageUploaded, uploadedImage }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (uploadedImage) {
      const url = URL.createObjectURL(uploadedImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [uploadedImage]);

  const handleFiles = useCallback(async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsProcessing(true);
    
    try {
      const processedImage: ProcessedImage = await processUploadedImage(file);
      
      if (processedImage.isConverted) {
        toast.success('HEIC image converted successfully!');
      }
      
      onImageUploaded(processedImage.file);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [onImageUploaded]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeImage = useCallback(() => {
    if (onImageUploaded) {
      // Reset by calling with null (this is expected by parent component)
      onImageUploaded(null!);
    }
    setPreviewUrl('');
    toast.success('Image removed');
  }, [onImageUploaded]);

  if (uploadedImage && previewUrl) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Photo Uploaded Successfully!</h2>
          <p className="text-gray-600">Your image is ready for AI headshot generation</p>
        </div>

        <Card className="p-6 max-w-md mx-auto">
          <div className="relative group">
            <img
              src={previewUrl}
              alt="Uploaded"
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={removeImage}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {uploadedImage.name}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {(uploadedImage.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Photo</h2>
        <p className="text-gray-600">
          Choose a clear photo of yourself. We support JPEG, PNG, WebP, and HEIC formats.
        </p>
      </div>

      <Card 
        className={`
          p-8 border-2 border-dashed transition-all duration-200 cursor-pointer
          ${dragActive 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-gray-300 hover:border-primary hover:bg-primary/5'
          }
          ${isProcessing ? 'pointer-events-none opacity-75' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className="text-center space-y-4">
          <div className={`
            mx-auto w-16 h-16 rounded-full flex items-center justify-center
            ${dragActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}
            transition-colors duration-200
          `}>
            {isProcessing ? (
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-primary"></div>
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isProcessing ? 'Processing image...' : 'Drop your photo here'}
            </p>
            <p className="text-gray-500 mt-1">
              or click to browse your files
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
            <span className="flex items-center">
              <ImageIcon className="w-4 h-4 mr-1" />
              JPEG, PNG, WebP, HEIC
            </span>
            <span>•</span>
            <span>Max 10MB</span>
          </div>
        </div>
        
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept="image/*,.heic,.heif"
          onChange={handleFileInput}
          disabled={isProcessing}
        />
      </Card>

      {dragActive && (
        <div className="fixed inset-0 bg-primary/10 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white p-8 rounded-xl shadow-xl border-2 border-primary">
            <Upload className="w-12 h-12 mx-auto text-primary mb-4" />
            <p className="text-xl font-semibold text-primary">Drop to upload</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadStep;