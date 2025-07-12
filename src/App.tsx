import React, { useState, useCallback } from 'react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import WizardStepper from './components/WizardStepper';
import UploadStep from './components/UploadStep';
import StyleStep from './components/StyleStep';
import GenerateStep from './components/GenerateStep';
import { GenerationConfig, HeadshotStyle, GeneratedHeadshot } from './types';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  const [config, setConfig] = useState<GenerationConfig>({
    uploadedImage: null,
    selectedStyle: null,
    customPrompt: '',
    quantity: 4,
    isGenerating: false,
    generatedImages: [],
  });

  // Step 1: Upload handlers
  const handleImageUploaded = useCallback((file: File | null) => {
    setConfig(prev => ({ ...prev, uploadedImage: file }));
    if (file) {
      setCompletedSteps(prev => new Set(prev).add(1));
    } else {
      setCompletedSteps(prev => {
        const newSet = new Set(prev);
        newSet.delete(1);
        return newSet;
      });
    }
  }, []);

  // Step 2: Style handlers
  const handleStyleSelected = useCallback((style: HeadshotStyle) => {
    setConfig(prev => ({ ...prev, selectedStyle: style }));
    setCompletedSteps(prev => new Set(prev).add(2));
  }, []);

  const handleCustomPromptChange = useCallback((prompt: string) => {
    setConfig(prev => ({ ...prev, customPrompt: prompt }));
  }, []);

  const handleQuantityChange = useCallback((quantity: number) => {
    setConfig(prev => ({ ...prev, quantity }));
  }, []);

  // Step 3: Generation handlers
  const handleGenerate = useCallback(() => {
    setConfig(prev => ({ ...prev, isGenerating: true, generatedImages: [] }));
  }, []);

  const handleImagesGenerated = useCallback((images: GeneratedHeadshot[]) => {
    setConfig(prev => ({ ...prev, isGenerating: false, generatedImages: images }));
    if (images.length > 0) {
      setCompletedSteps(prev => new Set(prev).add(3));
    }
  }, []);

  // Navigation
  const canGoToNext = () => {
    switch (currentStep) {
      case 1:
        return config.uploadedImage !== null;
      case 2:
        return config.selectedStyle !== null;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const canGoToPrevious = () => {
    return currentStep > 1;
  };

  const handleNext = () => {
    if (canGoToNext() && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (canGoToPrevious()) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    // Only allow clicking on completed steps or the next step
    if (completedSteps.has(stepId) || stepId === currentStep || stepId === currentStep + 1) {
      setCurrentStep(stepId);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <UploadStep
            onImageUploaded={handleImageUploaded}
            uploadedImage={config.uploadedImage}
          />
        );
      case 2:
        return (
          <StyleStep
            selectedStyle={config.selectedStyle}
            onStyleSelected={handleStyleSelected}
            customPrompt={config.customPrompt}
            onCustomPromptChange={handleCustomPromptChange}
            quantity={config.quantity}
            onQuantityChange={handleQuantityChange}
          />
        );
      case 3:
        return (
          <GenerateStep
            uploadedImage={config.uploadedImage}
            selectedStyle={config.selectedStyle}
            customPrompt={config.customPrompt}
            quantity={config.quantity}
            generatedImages={config.generatedImages}
            isGenerating={config.isGenerating}
            onGenerate={handleGenerate}
            onImagesGenerated={handleImagesGenerated}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-orange-500 bg-clip-text text-transparent">
                  AI Headshot Generator
                </h1>
                <p className="text-sm text-gray-600">
                  Create professional headshots with AI
                </p>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
              <span>Step {currentStep} of 3</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Stepper */}
        <WizardStepper 
          currentStep={currentStep} 
          completedSteps={completedSteps}
        />

        {/* Step Content */}
        <Card className="mt-8 p-8 bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
          <div className="max-w-4xl mx-auto">
            {renderCurrentStep()}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={!canGoToPrevious()}
            className="flex items-center px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            {[1, 2, 3].map(step => (
              <button
                key={step}
                onClick={() => handleStepClick(step)}
                className={`
                  w-3 h-3 rounded-full transition-all duration-200
                  ${step === currentStep
                    ? 'bg-primary scale-125'
                    : completedSteps.has(step)
                    ? 'bg-primary/60 hover:bg-primary/80'
                    : 'bg-gray-300 hover:bg-gray-400'
                  }
                `}
                disabled={!completedSteps.has(step) && step !== currentStep && step !== currentStep + 1}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={!canGoToNext() || currentStep >= 3}
            className="flex items-center px-6"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Helper Text */}
        <div className="text-center mt-6 text-sm text-gray-500">
          {currentStep === 1 && !config.uploadedImage && (
            <p>Upload a clear photo of yourself to get started</p>
          )}
          {currentStep === 2 && !config.selectedStyle && (
            <p>Choose a style that fits your professional needs</p>
          )}
          {currentStep === 3 && config.generatedImages.length === 0 && !config.isGenerating && (
            <p>Generate your professional AI headshots</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Powered by advanced AI technology for professional headshot generation
            </p>
            <p className="text-xs mt-2 text-gray-400">
              Your privacy is protected. Images are processed securely and not stored.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;