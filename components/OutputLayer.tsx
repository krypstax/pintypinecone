
import React, { useState } from 'react';
import { ContentPack } from '../types';

interface OutputLayerProps {
  packs: ContentPack[];
}

const KeywordItem: React.FC<{ keyword: string }> = ({ keyword }) => {
  const [copied, setCopied] = useState(false);

  const copyKeyword = () => {
    navigator.clipboard.writeText(keyword);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={copyKeyword}
      className={`relative px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-2 group ${
        copied 
          ? 'bg-green-50 border-green-200 text-green-600' 
          : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100 hover:border-blue-200'
      }`}
    >
      <span>{keyword}</span>
      <svg 
        className={`w-3 h-3 transition-opacity ${copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
      </svg>
      {copied && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-2 py-0.5 rounded animate-bounce">
          Copied!
        </span>
      )}
    </button>
  );
};

const OutputCard: React.FC<{ pack: ContentPack }> = ({ pack }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col md:flex-row group transition-all hover:shadow-2xl">
      {/* Image Section */}
      <div className={`relative flex-shrink-0 bg-gray-50 ${pack.prompt.toLowerCase().includes('9:16') ? 'w-full md:w-1/3' : 'w-full md:w-2/5'}`}>
        <img src={pack.imageUrl} alt={pack.altText} className="w-full h-full object-cover" />
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={() => downloadImage(pack.imageUrl, `pin-${pack.id}.png`)}
            className="bg-white/90 backdrop-blur p-2 rounded-xl shadow-sm text-gray-700 hover:bg-white hover:text-red-500 transition-all"
            title="Download Image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
            Validated Pack
          </span>
        </div>
      </div>

      {/* Details Section */}
      <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        {/* Title Section */}
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex-1 pr-4">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest">Pin Title</h4>
            <div className="text-2xl font-bold text-gray-900 leading-tight">{pack.title}</div>
          </div>
          <button 
            onClick={() => copyToClipboard(pack.title, 'title')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${copied === 'title' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            {copied === 'title' ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Description Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter">SEO Description</label>
            <button 
              onClick={() => copyToClipboard(pack.description, 'desc')} 
              className={`text-xs font-semibold flex items-center gap-1 transition-colors ${copied === 'desc' ? 'text-green-600' : 'text-red-500 hover:text-red-600'}`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              {copied === 'desc' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            {pack.description}
          </p>
        </div>

        {/* Bottom Metadata Grid */}
        <div className="grid grid-cols-1 space-y-6">
          {/* Alt Text Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-400 uppercase">Accessibility Alt Text</label>
              <button 
                onClick={() => copyToClipboard(pack.altText, 'alt')} 
                className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${copied === 'alt' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {copied === 'alt' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="text-xs text-gray-500 bg-gray-50/50 p-3 rounded-lg border border-gray-100 italic">
              {pack.altText}
            </div>
          </div>

          {/* Pinterest Keywords Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">Pinterest Search Trends</label>
              <span className="text-[10px] text-gray-400 italic">Click to copy individual phrase</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {pack.keywords.map((kw, i) => (
                <KeywordItem key={i} keyword={kw} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OutputLayer: React.FC<OutputLayerProps> = ({ packs }) => {
  return (
    <div className="space-y-12 animate-fadeIn pb-20">
      <div className="text-center space-y-2 mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900">Pinterest-Ready Content Packs</h2>
        <p className="text-gray-500">Accurate product visuals paired with Pinterest-native search metadata.</p>
      </div>
      
      <div className="space-y-12">
        {packs.map((pack) => (
          <OutputCard key={pack.id} pack={pack} />
        ))}
      </div>
    </div>
  );
};

export default OutputLayer;
