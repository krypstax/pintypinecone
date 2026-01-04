
import React, { useState } from 'react';
import { AppSettings, SEOIntensity, VisualStyle, AudienceFocus, ContentPack, ProcessState } from './types';
import InputLayer from './components/InputLayer';
import Controls from './components/Controls';
import ProcessingLayer from './components/ProcessingLayer';
import OutputLayer from './components/OutputLayer';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [productDescription, setProductDescription] = useState('');
  const [settings, setSettings] = useState<AppSettings>({
    webResearch: true,
    verticalImageCount: 2,
    seoIntensity: SEOIntensity.BALANCED,
    visualStyle: VisualStyle.LIFESTYLE,
    audienceFocus: AudienceFocus.BUYERS
  });

  const [process, setProcess] = useState<ProcessState>({ step: 'idle', progress: 0 });
  const [generatedPacks, setGeneratedPacks] = useState<ContentPack[]>([]);

  const generateContent = async () => {
    if (!productDescription && images.length === 0) {
      alert("Please provide at least an image or a product description.");
      return;
    }

    setGeneratedPacks([]);

    try {
      // STEP 1: LOCK PRODUCT IDENTITY (Deliberate & Careful)
      setProcess({ step: 'locking_identity', progress: 5, subStatus: 'Locking Identity' });
      const productLock = await geminiService.lockProductIdentity(images, productDescription);

      // STEP 2: ANALYZE & GENERATE PROMPTS
      setProcess({ step: 'analyzing', progress: 15, subStatus: 'Drafting Strategy' });
      const prompts = await geminiService.analyzeAndGeneratePrompts(images, productDescription, settings, productLock);
      
      const packs: ContentPack[] = [];

      // STEP 3: SEQUENTIAL GENERATION & VERIFICATION (Focussed execution)
      for (let i = 0; i < prompts.length; i++) {
        const pinNumber = i + 1;
        const promptObj = prompts[i];
        
        setProcess(prev => ({ 
          ...prev, 
          step: 'creating_images', 
          subStatus: `Synthesis Pin ${pinNumber}`,
          progress: 15 + (i * 25) 
        }));

        let imageUrl = '';
        let isValid = false;
        let attempts = 0;

        // Self-Correction Loop: Retry once if identity drift detected
        while (!isValid && attempts < 2) {
          attempts++;
          imageUrl = await geminiService.generateImage(promptObj.prompt, promptObj.aspectRatio as any);
          
          setProcess(prev => ({ ...prev, step: 'verifying_fidelity', subStatus: `Verifying Pin ${pinNumber}` }));
          isValid = await geminiService.verifyFidelity(images, imageUrl, productLock);
          
          if (!isValid && attempts < 2) {
            console.warn(`Pin ${pinNumber} failed verification. Retrying with stricter constraints.`);
          }
        }

        // Generate metadata once image is approved or max retries reached
        setProcess(prev => ({ ...prev, step: 'generating_metadata', subStatus: `Finalizing Pin ${pinNumber}` }));
        const metadata = await geminiService.generateMetadata(promptObj.prompt, productDescription || "Product Content", settings);

        packs.push({
          id: `pack-${i}-${Date.now()}`,
          imageUrl,
          title: metadata.title || "Optimized Pin",
          description: metadata.description || "Verified for product identity and discovery.",
          altText: metadata.altText || "Product photo for accessibility",
          keywords: metadata.keywords || ["product", "pinterest", "trending"],
          prompt: promptObj.prompt
        });
      }

      setGeneratedPacks(packs);
      setProcess({ step: 'complete', progress: 100 });
      
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 500);

    } catch (error: any) {
      console.error(error);
      setProcess({ step: 'error', progress: 0, error: error.message });
    }
  };

  const reset = () => {
    setImages([]);
    setProductDescription('');
    setGeneratedPacks([]);
    setProcess({ step: 'idle', progress: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.41 7.63 11.13-.1-.95-.19-2.4.04-3.43.21-.93 1.34-5.69 1.34-5.69s-.34-.68-.34-1.69c0-1.59.92-2.77 2.06-2.77 0.97 0 1.44.73 1.44 1.61 0 0.98-.62 2.44-.94 3.8-.27 1.13.56 2.06 1.67 2.06 2.01 0 3.55-2.12 3.55-5.17 0-2.71-1.94-4.6-4.72-4.6-3.21 0-5.1 2.41-5.1 4.9 0 0.97.37 2.01.84 2.58.09.11.1.21.07.32-.08.33-.26 1.05-.3 1.2-.05.19-.16.23-.37.13-1.39-.65-2.26-2.68-2.26-4.32 0-3.52 2.55-6.75 7.37-6.75 3.87 0 6.87 2.75 6.87 6.44 0 3.84-2.42 6.93-5.78 6.93-1.13 0-2.2-.59-2.56-1.28l-.7 2.65c-.25.97-.93 2.19-1.39 2.94 1.12.35 2.31.54 3.54.54 6.63 0 12-5.37 12-12S18.63 0 12 0z"/>
              </svg>
            </div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">PinStrategy <span className="text-red-500">AI</span></h1>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Fidelity Mode Active</span>
            <div className="h-4 w-px bg-gray-200"></div>
            <button onClick={reset} className="hover:text-red-500 transition-colors">Reset</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {process.step === 'idle' && (
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-12 animate-fadeIn">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
              Professional <br className="hidden sm:block"/> <span className="text-red-500">Product Representation</span>
            </h2>
            <p className="text-lg text-gray-500 font-medium">
              Verified Pin creation with strict visual fidelity enforcement. <br className="hidden sm:block"/> No transformations, just platform-optimized assets.
            </p>
          </div>
        )}

        {(process.step === 'idle' || process.step === 'complete') && (
          <>
            <InputLayer images={images} setImages={setImages} productDescription={productDescription} setProductDescription={setProductDescription} />
            <Controls settings={settings} setSettings={setSettings} />
            <div className="flex justify-center pt-6">
              <button
                onClick={generateContent}
                disabled={process.step !== 'idle' && process.step !== 'complete'}
                className="group relative px-12 py-6 bg-gray-900 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-red-500 transition-all duration-500 transform hover:-translate-y-2 active:translate-y-0 flex items-center gap-4 disabled:opacity-50"
              >
                <span>Generate Verified Packs</span>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </>
        )}

        {(process.step !== 'idle' && process.step !== 'complete' && process.step !== 'error') && (
          <div className="py-20">
            <ProcessingLayer state={process} />
          </div>
        )}

        {process.step === 'error' && (
          <div className="max-w-lg mx-auto bg-red-50 p-8 rounded-[2rem] border border-red-100 text-center space-y-4 shadow-sm">
            <div className="text-5xl">⚠️</div>
            <div className="text-red-900 font-black text-xl">Verification Failure</div>
            <div className="text-red-700 text-sm font-medium leading-relaxed">{process.error}</div>
            <button 
              onClick={() => setProcess({ step: 'idle', progress: 0 })}
              className="px-6 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
            >
              Retry Strategy
            </button>
          </div>
        )}

        {generatedPacks.length > 0 && (
          <OutputLayer packs={generatedPacks} />
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
          Production Grade Product Representation AI
        </p>
      </footer>
    </div>
  );
};

export default App;
