
import React from 'react';
import { AppSettings, SEOIntensity, VisualStyle, AudienceFocus } from '../types';

interface ControlsProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
}

const Controls: React.FC<ControlsProps> = ({ settings, setSettings }) => {
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-sm">2</span>
        Strategy Configuration
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Toggle Switches */}
        <div className="space-y-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <div className="text-sm font-semibold text-gray-900">Pinterest Web Research</div>
              <div className="text-xs text-gray-500">Analyze current trending pin layouts</div>
            </div>
            <button 
              onClick={() => updateSetting('webResearch', !settings.webResearch)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.webResearch ? 'bg-red-500' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.webResearch ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 flex justify-between">
              Vertical (9:16) Pins
              <span className="text-red-500">{settings.verticalImageCount}/3</span>
            </label>
            <input 
              type="range" min="0" max="3" step="1" 
              value={settings.verticalImageCount}
              onChange={(e) => updateSetting('verticalImageCount', parseInt(e.target.value))}
              className="w-full accent-red-500 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Dropdowns */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Visual Style</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(VisualStyle).map(style => (
                <button
                  key={style}
                  onClick={() => updateSetting('visualStyle', style)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${settings.visualStyle === style ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">SEO Intensity</label>
            <div className="flex gap-2">
              {Object.values(SEOIntensity).map(intensity => (
                <button
                  key={intensity}
                  onClick={() => updateSetting('seoIntensity', intensity)}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${settings.seoIntensity === intensity ? 'bg-gray-900 border-gray-900 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {intensity}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Audience Focus</label>
            <select
              value={settings.audienceFocus}
              onChange={(e) => updateSetting('audienceFocus', e.target.value as AudienceFocus)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-red-100 focus:border-red-400 outline-none"
            >
              {Object.values(AudienceFocus).map(focus => (
                <option key={focus} value={focus}>{focus}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
