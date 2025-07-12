import React from 'react';
import { Check, Upload, Palette, Sparkles } from 'lucide-react';
import { WIZARD_STEPS } from '../types';

interface WizardStepperProps {
  currentStep: number;
  completedSteps: Set<number>;
}

const WizardStepper: React.FC<WizardStepperProps> = ({ currentStep, completedSteps }) => {
  const getStepIcon = (stepId: number) => {
    switch (stepId) {
      case 1:
        return Upload;
      case 2:
        return Palette;
      case 3:
        return Sparkles;
      default:
        return Upload;
    }
  };

  const getStepStatus = (stepId: number) => {
    if (completedSteps.has(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    if (stepId < currentStep) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {WIZARD_STEPS.map((step, index) => {
          const status = getStepStatus(step.id);
          const Icon = getStepIcon(step.id);
          const isLast = index === WIZARD_STEPS.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${status === 'completed'
                      ? 'bg-primary border-primary text-white'
                      : status === 'current'
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                    }
                  `}
                >
                  {status === 'completed' ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                
                {/* Step Info */}
                <div className="mt-3 text-center max-w-[120px]">
                  <p
                    className={`
                      text-sm font-medium transition-colors duration-200
                      ${status === 'current' || status === 'completed'
                        ? 'text-gray-900'
                        : 'text-gray-500'
                      }
                    `}
                  >
                    {step.title}
                  </p>
                  <p
                    className={`
                      text-xs mt-1 transition-colors duration-200
                      ${status === 'current'
                        ? 'text-primary'
                        : 'text-gray-400'
                      }
                    `}
                  >
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`
                    flex-1 h-0.5 mx-4 transition-colors duration-300
                    ${status === 'completed' || (index + 1 < currentStep)
                      ? 'bg-primary'
                      : 'bg-gray-300'
                    }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WizardStepper;