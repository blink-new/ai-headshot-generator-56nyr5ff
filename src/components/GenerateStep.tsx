import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Download, RefreshCw, Sparkles, Image as ImageIcon, Check } from 'lucide-react';
import { GeneratedHeadshot, HeadshotStyle } from '../types';
import { generateDownloadFilename, downloadImage } from '../utils/imageUtils';
import toast from 'react-hot-toast';
import { createClient } from '@blinkdotnew/sdk';

interface GenerateStepProps {
  uploadedImage: File | null;
  selectedStyle: HeadshotStyle | null;
  customPrompt: string;
  quantity: number;
  generatedImages: GeneratedHeadshot[];
  isGenerating: boolean;
  onGenerate: () => void;
  onImagesGenerated: (images: GeneratedHeadshot[]) => void;
}

const GenerateStep: React.FC<GenerateStepProps> = ({
  uploadedImage,
  selectedStyle,
  customPrompt,
  quantity,
  generatedImages,
  isGenerating,
  onGenerate,
  onImagesGenerated,
}) => {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [downloadingAll, setDownloadingAll] = useState(false);

  const handleGenerate = async () => {
    if (!selectedStyle || !uploadedImage) return;

    onGenerate(); // Set loading state
    
    try {
      // Build the prompt
      const basePrompt = selectedStyle.prompt;
      const fullPrompt = customPrompt 
        ? `${basePrompt}, ${customPrompt}, professional headshot photography`
        : `${basePrompt}, professional headshot photography`;

      // Create Blink client with proper configuration
      const client = createClient({
        projectId: 'ai-headshot-generator-56nyr5ff'
      });
      
      // First, upload the image to get a URL
      const uploadResult = await client.storage.uploadFile({
        file: uploadedImage,
        path: `uploads/${Date.now()}-${uploadedImage.name}`
      });

      if (!uploadResult.success || !uploadResult.data?.url) {
        throw new Error('Failed to upload image');
      }

      const imageUrl = uploadResult.data.url;
      
      // Use modifyImage with the uploaded image URL
      const result = await client.ai.modifyImage({
        images: [imageUrl],
        prompt: fullPrompt,
        n: quantity,
        size: "1024x1024",
        response_format: "url"
      });

      if (result.success && result.data) {
        const newImages: GeneratedHeadshot[] = result.data.map((imageData, index) => ({
          id: `${Date.now()}-${index}`,
          url: imageData.url || '',
          prompt: fullPrompt,
          style: selectedStyle.name,
        }));

        onImagesGenerated(newImages);
        toast.success(`Generated ${quantity} headshots successfully!`);
      } else {
        throw new Error('Failed to generate images');
      }
    } catch (error) {
      console.error('Error generating images:', error);
      toast.error('Failed to generate headshots. Please try again.');
      onImagesGenerated([]); // Clear loading state
    }
  };

  const toggleImageSelection = (imageId: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const selectAllImages = () => {
    if (selectedImages.size === generatedImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(generatedImages.map(img => img.id)));
    }
  };

  const downloadSelectedImages = async () => {
    if (selectedImages.size === 0) {
      toast.error('Please select images to download');
      return;
    }

    setDownloadingAll(true);
    
    try {
      const imagesToDownload = generatedImages.filter(img => selectedImages.has(img.id));
      
      for (let i = 0; i < imagesToDownload.length; i++) {
        const image = imagesToDownload[i];
        const filename = generateDownloadFilename(i, image.style);
        await downloadImage(image.url, filename);
        
        // Small delay between downloads to prevent overwhelming the browser
        if (i < imagesToDownload.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      toast.success(`Downloaded ${selectedImages.size} images successfully!`);
    } catch (error) {
      console.error('Error downloading images:', error);
      toast.error('Failed to download some images');
    } finally {
      setDownloadingAll(false);
    }
  };

  const downloadAllImages = async () => {
    setDownloadingAll(true);
    
    try {
      for (let i = 0; i < generatedImages.length; i++) {
        const image = generatedImages[i];
        const filename = generateDownloadFilename(i, image.style);
        await downloadImage(image.url, filename);
        
        // Small delay between downloads
        if (i < generatedImages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      toast.success(`Downloaded all ${generatedImages.length} images successfully!`);
    } catch (error) {
      console.error('Error downloading images:', error);
      toast.error('Failed to download some images');
    } finally {
      setDownloadingAll(false);
    }
  };

  if (generatedImages.length > 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your AI Headshots</h2>
          <p className="text-gray-600">
            Select the images you want to download or regenerate with different settings
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            onClick={selectAllImages}
            variant="outline"
            className="flex items-center"
          >
            <Check className="w-4 h-4 mr-2" />
            {selectedImages.size === generatedImages.length ? 'Deselect All' : 'Select All'}
          </Button>
          
          <Button
            onClick={downloadSelectedImages}
            disabled={selectedImages.size === 0 || downloadingAll}
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Selected ({selectedImages.size})
          </Button>
          
          <Button
            onClick={downloadAllImages}
            disabled={downloadingAll}
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download All ({generatedImages.length})
          </Button>
          
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            variant="outline"
            className="flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {generatedImages.map((image) => (
            <Card
              key={image.id}
              className={`
                relative overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105
                ${selectedImages.has(image.id) 
                  ? 'ring-2 ring-primary shadow-lg' 
                  : 'hover:shadow-md'
                }
              `}
              onClick={() => toggleImageSelection(image.id)}
            >
              <div className="aspect-square relative">
                <img
                  src={image.url}
                  alt={`Generated headshot ${image.id}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Selection Overlay */}
                <div className={`
                  absolute inset-0 transition-all duration-200
                  ${selectedImages.has(image.id)
                    ? 'bg-primary/20'
                    : 'bg-black/0 hover:bg-black/10'
                  }
                `}>
                  {selectedImages.has(image.id) && (
                    <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-3">
                <p className="text-xs text-gray-500 truncate">
                  {image.style} Style
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Generation Info */}
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <ImageIcon className="w-4 h-4 mr-2" />
              {generatedImages.length} images generated
            </div>
            <div className="text-gray-500">
              Style: {selectedStyle?.name}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Your Headshots</h2>
        <p className="text-gray-600">
          Ready to create professional AI headshots with your selected style
        </p>
      </div>

      {/* Generation Summary */}
      <Card className="p-6 max-w-md mx-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">Ready to Generate</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Style:</strong> {selectedStyle?.name}</p>
              <p><strong>Quantity:</strong> {quantity} headshots</p>
              {customPrompt && (
                <p><strong>Custom details:</strong> {customPrompt}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !uploadedImage || !selectedStyle}
          size="lg"
          className="px-8 py-3 text-lg"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Headshots
            </>
          )}
        </Button>
      </div>

      {isGenerating && (
        <Card className="p-6 max-w-md mx-auto">
          <div className="text-center space-y-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-sm text-gray-600">
              This may take 30-60 seconds. Please don't close this page.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default GenerateStep;