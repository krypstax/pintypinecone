
import React, { useRef, useEffect } from 'react';

interface InputLayerProps {
  images: string[];
  setImages: (images: string[]) => void;
  productDescription: string;
  setProductDescription: (text: string) => void;
}

const InputLayer: React.FC<InputLayerProps> = ({ images, setImages, productDescription, setProductDescription }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add global paste listener to handle images from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setImages(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [setImages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    // Explicitly typing as File[] to prevent 'unknown' inference error in readAsDataURL.
    const files = Array.from(fileList) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-sm">1</span>
          Product Assets
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Upload Area */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Visuals (Paste or Upload)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 transition-all hover:border-red-300 hover:bg-red-50/30 cursor-pointer flex flex-col items-center justify-center text-center space-y-2"
            >
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-sm font-medium text-gray-900">Click to upload or Paste image (Ctrl+V)</div>
              <p className="text-xs text-gray-500">Supports JPG, PNG (E-commerce screenshots welcome)</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                multiple 
                accept="image/*"
              />
            </div>
            
            {images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <div key={idx} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden group">
                    <img src={img} className="w-full h-full object-cover" alt="Product" />
                    <button 
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Text Input Area */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Product Context (Optional)</label>
            <textarea
              className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all text-sm outline-none resize-none"
              placeholder="Paste product descriptions, features, specifications, or marketing copy here..."
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputLayer;
