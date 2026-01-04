
import React from 'react';
import { ProcessState } from '../types';

interface ProcessingLayerProps {
  state: ProcessState;
}

const ProcessingLayer: React.FC<ProcessingLayerProps> = ({ state }) => {
  const steps = [
    { id: 'locking_identity', label: 'Identity Lock', icon: '🔒' },
    { id: 'generating_prompts', label: 'Strategy', icon: '✨' },
    { id: 'creating_images', label: 'Synthesis', icon: '🎨' },
    { id: 'verifying_fidelity', label: 'Verification', icon: '🔍' },
    { id: 'generating_metadata', label: 'Optimization', icon: '📈' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === state.step);
  const activeStep = steps[currentStepIndex];

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 max-w-2xl mx-auto text-center space-y-10 animate-fadeIn">
      <div className="relative w-36 h-36 mx-auto">
        <div className="absolute inset-0 rounded-full border-[6px] border-red-50" />
        <div className="absolute inset-0 rounded-full border-t-[6px] border-red-500 animate-spin transition-all duration-700" />
        <div className="absolute inset-0 flex items-center justify-center text-5xl">
          {activeStep?.icon || '🚀'}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          Deliberate Content Creation
        </h2>
        <div className="flex flex-col items-center gap-1">
          <p className="text-gray-500 font-medium">Prioritizing Accuracy over Speed</p>
          <div className="px-3 py-1 bg-gray-900 text-white text-[10px] rounded-full uppercase font-bold tracking-widest mt-2">
            {state.subStatus || activeStep?.label || "Processing"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 max-w-lg mx-auto relative pt-4">
        {steps.map((step, idx) => {
          const isActive = idx <= currentStepIndex;
          return (
            <div key={step.id} className="space-y-3 group">
              <div className={`h-2.5 rounded-full transition-all duration-700 shadow-sm ${isActive ? 'bg-red-500' : 'bg-gray-100'}`} />
              <div className={`text-[9px] uppercase tracking-tighter font-extrabold transition-colors ${isActive ? 'text-red-500' : 'text-gray-300'}`}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 bg-gray-50 px-4 py-2 rounded-xl">
          <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          Verified Product Content Strategy (Est. 2-4 mins)
        </div>
      </div>
    </div>
  );
};

export default ProcessingLayer;
