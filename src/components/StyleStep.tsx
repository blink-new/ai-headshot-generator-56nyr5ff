import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Minus, Plus, Sparkles } from 'lucide-react';
import { HeadshotStyle, HEADSHOT_STYLES } from '../types';

interface StyleStepProps {
  selectedStyle: HeadshotStyle | null;
  onStyleSelected: (style: HeadshotStyle) => void;
  customPrompt: string;
  onCustomPromptChange: (prompt: string) => void;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

const StyleStep: React.FC<StyleStepProps> = ({
  selectedStyle,
  onStyleSelected,
  customPrompt,
  onCustomPromptChange,
  quantity,
  onQuantityChange,
}) => {
  const decreaseQuantity = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < 12) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Style</h2>
        <p className="text-gray-600">
          Select a style that fits your needs and customize the details
        </p>
      </div>

      {/* Style Selection */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Select Style</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HEADSHOT_STYLES.map((style) => (
            <Card
              key={style.id}
              className={`
                p-6 cursor-pointer transition-all duration-200 hover:scale-105
                ${selectedStyle?.id === style.id
                  ? 'ring-2 ring-primary bg-primary/5 border-primary'
                  : 'hover:shadow-lg hover:border-primary/50'
                }
              `}
              onClick={() => onStyleSelected(style)}
            >
              <div className="text-center space-y-3">
                <div className="text-4xl mb-2">{style.preview}</div>
                <h3 className="font-semibold text-lg">{style.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {style.description}
                </p>
                {selectedStyle?.id === style.id && (
                  <div className="flex items-center justify-center text-primary text-sm font-medium">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Selected
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Prompt */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="custom-prompt" className="text-lg font-semibold">
            Custom Prompt (Optional)
          </Label>
          <span className="text-sm text-gray-500">
            Add specific details or preferences
          </span>
        </div>
        <Textarea
          id="custom-prompt"
          placeholder="e.g., wearing glasses, outdoor background, warm lighting..."
          value={customPrompt}
          onChange={(e) => onCustomPromptChange(e.target.value)}
          className="min-h-[100px] resize-none"
        />
        <p className="text-xs text-gray-500">
          This will be combined with your selected style to create unique headshots
        </p>
      </div>

      {/* Quantity Selection */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Number of Headshots</Label>
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
            className="h-12 w-12"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <div className="text-center min-w-[80px]">
            <div className="text-3xl font-bold text-primary">{quantity}</div>
            <div className="text-sm text-gray-500">
              {quantity === 1 ? 'headshot' : 'headshots'}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={increaseQuantity}
            disabled={quantity >= 12}
            className="h-12 w-12"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-center text-sm text-gray-500">
          Generate between 1-12 headshots in one batch
        </p>
      </div>

      {/* Preview Settings */}
      {selectedStyle && (
        <Card className="p-6 bg-gray-50">
          <h3 className="font-semibold mb-3 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-primary" />
            Generation Preview
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Style:</span>
              <span className="font-medium">{selectedStyle.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-medium">{quantity} headshots</span>
            </div>
            {customPrompt && (
              <div className="pt-2">
                <span className="text-gray-600">Custom details:</span>
                <p className="mt-1 text-gray-800 italic">&quot;{customPrompt}&quot;</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default StyleStep;