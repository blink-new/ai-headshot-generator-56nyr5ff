export interface HeadshotStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
  preview: string;
}

export interface GeneratedHeadshot {
  id: string;
  url: string;
  prompt: string;
  style: string;
}

export interface WizardStep {
  id: number;
  title: string;
  description: string;
  component: string;
}

export interface GenerationConfig {
  uploadedImage: File | null;
  selectedStyle: HeadshotStyle | null;
  customPrompt: string;
  quantity: number;
  isGenerating: boolean;
  generatedImages: GeneratedHeadshot[];
}

export const HEADSHOT_STYLES: HeadshotStyle[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Corporate headshot with business attire and clean background',
    prompt: 'professional corporate headshot, business attire, clean studio background, professional lighting, high quality',
    preview: '👔'
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Relaxed and approachable with natural lighting',
    prompt: 'casual professional headshot, natural lighting, friendly smile, modern background',
    preview: '😊'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Artistic and unique with creative elements',
    prompt: 'creative professional headshot, artistic lighting, interesting background, modern aesthetic',
    preview: '🎨'
  }
];

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    title: 'Upload Photo',
    description: 'Upload your photo to get started',
    component: 'upload'
  },
  {
    id: 2,
    title: 'Choose Style',
    description: 'Select your preferred style and customize',
    component: 'style'
  },
  {
    id: 3,
    title: 'Generate & Download',
    description: 'Generate your AI headshots',
    component: 'generate'
  }
];