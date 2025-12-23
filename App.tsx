
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Sparkles, Zap, Clapperboard, RefreshCw, Type,
  Play, Clock, Key, History, ExternalLink, Users, Globe, MapPin, Music, X, Timer, Pause, Info, Monitor,
  Image as ImageIcon, Layers, Languages
} from 'lucide-react';
import { FeatureCard } from './components/FeatureCard';
import { ResultTable } from './components/ResultTable';
import { HistorySidebar } from './components/HistorySidebar';
import { SlideshowPreview } from './components/SlideshowPreview';
import { FeatureMode, InputType, UploadedFileState, SceneSegment, DURATION_OPTIONS, HistoryItem, ImageQuality, VideoQuality, TransitionMode } from './types';
import { fileToBase64 } from './utils';
import { generateVideoPlan, generateSceneImage, generateSceneVideo } from './services/geminiService';

const translations = {
  en: {
    title: "VideoSceneFlow AI",
    subtitle: "Professional Top Model Storyboarding",
    history: "History",
    apiKey: "SELECT API KEY",
    step1: "Step 1: Input Source",
    step2: "Step 2: Storyboard Configuration",
    sourcePrompt: "PROMPT",
    sourceFile: "FILE",
    promptPlaceholder: "Enter your idea, story, or lyrics here...",
    uploadClick: "Click to Upload",
    visualLang: "Content Language",
    locationVibe: "Location & Vibe",
    locationPlaceholder: "e.g., Old Quarter at night, glowing lanterns, nostalgic and romantic vibe...",
    imgQuality: "Image",
    vidQuality: "Video",
    imgTooltip: "High quality (4K) consumes significantly more API quota.",
    vidTooltip: "1080p significantly increases generation time and cost.",
    transition: "Transition",
    duration: "Scene Duration",
    musicTitle: "Reference Audio",
    musicUpload: "Upload Reference Audio",
    charCount: "Characters",
    charPlaceholder: "Describe character (Gender, build, outfit, facial features)...",
    featureTitle: "AI Feature",
    analyzeBtn: "Generate Storyboard",
    analyzing: "Analyzing...",
    emptyPlaceholder: "Detailed storyboard will appear here after analysis",
    saveSuccess: "Saved to history!",
    copied: "Copied!",
    copyBtn: "Copy Text",
    saveBtn: "Save Result",
    genImgAll: "Gen All Images",
    genVidAll: "Gen All Videos",
    zipImg: "Zip Images",
    zipVid: "Zip Videos",
    addScene: "Add New Scene",
    visualTheme: "Visual Theme",
    time: "Time",
    script: "Script / Voiceover",
    visualDesc: "Visual Description (Editable)",
    output: "Output (Image/Video)"
  },
  vi: {
    title: "VideoSceneFlow AI",
    subtitle: "Storyboard Top Model chuyên nghiệp",
    history: "Lịch sử",
    apiKey: "CHỌN API KEY",
    step1: "Bước 1: Nhập Nguồn Nội Dung",
    step2: "Bước 2: Cấu hình Storyboard",
    sourcePrompt: "PROMPT",
    sourceFile: "FILE",
    promptPlaceholder: "Nhập ý tưởng, câu chuyện hoặc lời bài hát của bạn tại đây...",
    uploadClick: "Click để Upload",
    visualLang: "Ngôn ngữ Visual",
    locationVibe: "Bối cảnh & Vibe",
    locationPlaceholder: "Ví dụ: Phố cổ Hội An về đêm, lung linh lồng đèn, vibe cổ điển và lãng mạn...",
    imgQuality: "Ảnh",
    vidQuality: "Video",
    imgTooltip: "Chất lượng cao (4K) tiêu tốn nhiều quota và token hơn.",
    vidTooltip: "1080p tăng đáng kể thời gian tạo và chi phí token.",
    transition: "Chuyển cảnh",
    duration: "Thời lượng cảnh",
    musicTitle: "Nhạc nền tham khảo",
    musicUpload: "Tải lên Audio tham khảo",
    charCount: "Số nhân vật",
    charPlaceholder: "Mô tả nhân vật (Giới tính, dáng người, trang phục, gương mặt)...",
    featureTitle: "Tính năng AI",
    analyzeBtn: "Tạo Storyboard",
    analyzing: "Đang phân tích...",
    emptyPlaceholder: "Kịch bản chi tiết sẽ hiển thị tại đây sau khi phân tích",
    saveSuccess: "Đã lưu vào lịch sử!",
    copied: "Đã sao chép!",
    copyBtn: "Sao chép",
    saveBtn: "Lưu kết quả",
    genImgAll: "Tạo All Ảnh",
    genVidAll: "Tạo All Video",
    zipImg: "Tải Ảnh ZIP",
    zipVid: "Tải Video ZIP",
    addScene: "Thêm phân cảnh mới",
    visualTheme: "Chủ đề Visual",
    time: "Thời gian",
    script: "Kịch bản / Voiceover",
    visualDesc: "Mô tả Visual (Có thể sửa)",
    output: "Kết quả (Ảnh/Video)"
  }
};

const App: React.FC = () => {
  const [uiLang, setUiLang] = useState<'en' | 'vi'>('en');
  const t = translations[uiLang];

  const [inputType, setInputType] = useState<InputType>(InputType.TEXT);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileState>({ file: null, previewUrl: null, type: null });
  const [uploadedMusic, setUploadedMusic] = useState<{file: File, url: string} | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [promptText, setPromptText] = useState<string>("");
  const [visualLang, setVisualLang] = useState<'en' | 'vi'>('en');
  const [characterCount, setCharacterCount] = useState<number>(1);
  const [characterDescriptions, setCharacterDescriptions] = useState<string[]>([""]);
  const [settingPrompt, setSettingPrompt] = useState<string>("");
  const [slideshowDelay, setSlideshowDelay] = useState<number>(3);
  const [imageQuality, setImageQuality] = useState<ImageQuality>('1K');
  const [videoQuality, setVideoQuality] = useState<VideoQuality>('720p');
  const [transitionMode, setTransitionMode] = useState<TransitionMode>('KenBurns');
  
  const [selectedFeature, setSelectedFeature] = useState<FeatureMode>(FeatureMode.DEEP_ANALYSIS);
  const [selectedDuration, setSelectedDuration] = useState<string>(DURATION_OPTIONS[2].value);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [resultData, setResultData] = useState<SceneSegment[]>([]);
  const [styleGuide, setStyleGuide] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
  const [videoGeneratingIndex, setVideoGeneratingIndex] = useState<number | null>(null);
  
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);

  // Fix: Add missing 'features' list for the feature selection UI
  const features = [
    { 
      title: FeatureMode.SCRIPT_EXTRACT, 
      desc: uiLang === 'en' ? "Extract structure from media" : "Trích xuất kịch bản từ file", 
      icon: Clapperboard 
    },
    { 
      title: FeatureMode.DEEP_ANALYSIS, 
      desc: uiLang === 'en' ? "Detailed analysis & planning" : "Phân tích và lên kế hoạch sâu", 
      icon: Sparkles 
    },
    { 
      title: FeatureMode.REMAKE_SCRIPT, 
      desc: uiLang === 'en' ? "Creative script recreation" : "Sáng tạo kịch bản remake mới", 
      icon: RefreshCw 
    },
    { 
      title: FeatureMode.TIKTOK_SCRIPT, 
      desc: uiLang === 'en' ? "Viral-optimized short form" : "Tối ưu cho short-form video", 
      icon: Zap 
    }
  ];

  useEffect(() => {
    const checkKey = async () => {
        if ((window as any).aistudio) {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            setHasApiKey(hasKey);
        }
    };
    checkKey();
    const saved = localStorage.getItem('videoSceneFlow_history');
    if (saved) setHistoryItems(JSON.parse(saved));
  }, []);

  const handleCharacterCountChange = (count: number) => {
    setCharacterCount(count);
    const newDescs = [...characterDescriptions];
    while (newDescs.length < count) newDescs.push("");
    setCharacterDescriptions(newDescs.slice(0, count));
  };

  const handleUpdateScene = (index: number, field: keyof SceneSegment, value: string) => {
    setResultData(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddScene = () => {
    setResultData(prev => [
      ...prev,
      { time: "New", script: "New content...", visual: "New visual description..." }
    ]);
  };

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedMusic({ file, url });
  };

  const toggleMusicPreview = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const handleAnalyze = async () => {
    setError(null);
    setIsAnalyzing(true);
    setResultData([]); 
    setStyleGuide("");
    try {
      if (!hasApiKey) throw new Error("Please select an API Key.");
      let inputData = "";
      let type: 'text' | 'image' | 'video' = 'text';
      let mimeType: string | undefined = undefined;

      if (inputType === InputType.TEXT) {
        if (!promptText.trim()) throw new Error("Please enter your prompt idea.");
        inputData = promptText;
      } else {
        if (!uploadedFile.file) throw new Error("Please upload a file.");
        inputData = await fileToBase64(uploadedFile.file);
        type = uploadedFile.type as 'image' | 'video';
        mimeType = uploadedFile.file.type;
      }
      const response = await generateVideoPlan(inputData, type, selectedFeature, selectedDuration, characterDescriptions, settingPrompt, visualLang, mimeType);
      setResultData(response.scenes);
      setStyleGuide(response.styleGuide);
    } catch (err: any) {
      setError(err.message || "An error occurred during processing.");
    } finally { setIsAnalyzing(false); }
  };

  const handleGenerateReferenceImage = async (index: number, visualPrompt: string): Promise<string> => {
    try {
       let refImg = undefined;
       let refMime = undefined;
       if (inputType === InputType.FILE && uploadedFile.type === 'image' && uploadedFile.file) {
            refImg = await fileToBase64(uploadedFile.file);
            refMime = uploadedFile.file.type;
       } else {
           const prevImg = index > 0 ? resultData[0]?.generatedImageUrl : null;
           if (prevImg) {
                const matches = prevImg.match(/^data:(.+);base64,(.+)$/);
                if (matches && matches.length === 3) { refMime = matches[1]; refImg = matches[2]; }
           }
       }
       const imageUrl = await generateSceneImage(visualPrompt, styleGuide, imageQuality, refImg, refMime);
       handleUpdateScene(index, 'generatedImageUrl', imageUrl);
       return imageUrl;
    } catch (err: any) { throw err; }
  };

  const handleGenerateVideo = async (index: number): Promise<string> => {
    try {
      setVideoGeneratingIndex(index);
      const scene = resultData[index];
      const videoUrl = await generateSceneVideo(scene.visual, scene.generatedImageUrl, videoQuality);
      handleUpdateScene(index, 'generatedVideoUrl', videoUrl);
      return videoUrl;
    } catch (err: any) {
      setError(err.message || "Video generation error.");
      throw err;
    } finally {
      setVideoGeneratingIndex(null);
    }
  };

  const handleGenerateAllImages = async () => {
      let anchor = resultData[0]?.generatedImageUrl || null;
      for (let i = 0; i < resultData.length; i++) {
          if (resultData[i].generatedImageUrl) { if (i === 0) anchor = resultData[i].generatedImageUrl!; continue; }
          setGeneratingIndex(i); 
          try {
              const res = await handleGenerateReferenceImage(i, resultData[i].visual);
              if (i === 0) anchor = res;
          } catch (e) { break; }
      }
      setGeneratingIndex(null);
  };

  const handleGenerateAllVideos = async () => {
      for (let i = 0; i < resultData.length; i++) {
          if (resultData[i].generatedVideoUrl || !resultData[i].generatedImageUrl) continue;
          try {
              await handleGenerateVideo(i);
          } catch (e) {
              console.error(`Failed to generate video for scene ${i}`, e);
              break; 
          }
      }
  };

  const handleSaveToHistory = () => {
      const newItem: HistoryItem = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          promptText: inputType === InputType.TEXT ? promptText : '',
          characters: characterDescriptions,
          settingPrompt,
          musicFileName: uploadedMusic?.file.name,
          inputType,
          selectedFeature,
          styleGuide,
          scenes: resultData
      };
      const newItems = [newItem, ...historyItems];
      localStorage.setItem('videoSceneFlow_history', JSON.stringify(newItems));
      setHistoryItems(newItems);
      alert(t.saveSuccess);
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
    setInputType(item.inputType);
    setPromptText(item.promptText || "");
    if (item.characters) {
      setCharacterCount(item.characters.length);
      setCharacterDescriptions(item.characters);
    }
    setSettingPrompt(item.settingPrompt || "");
    setUploadedMusic(null);
    setSelectedFeature(item.selectedFeature);
    setStyleGuide(item.styleGuide);
    setResultData(item.scenes);
    setUploadedFile({ file: null, previewUrl: null, type: null });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 font-sans">
      <header className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/20"><Sparkles size={24} /></div>
            <div>
            <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
               <p className="text-slate-400 text-xs font-medium">{t.subtitle}</p>
               <span className="text-slate-700">•</span>
               <a href="https://fcalgobot.com" target="_blank" className="text-blue-400 text-xs hover:underline">fcalgobot.com</a>
               <span className="text-slate-700">•</span>
               <a href="https://8a5.com" target="_blank" className="text-blue-400 text-xs hover:underline">8a5.com</a>
               <span className="text-slate-700">•</span>
               <a href="https://github.com/tienqnguyen" target="_blank" className="text-blue-400 text-xs hover:underline">Github</a>
            </div>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 mr-2">
              <button onClick={() => setUiLang('en')} className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${uiLang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>EN</button>
              <button onClick={() => setUiLang('vi')} className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${uiLang === 'vi' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>VI</button>
            </div>
            <button onClick={() => setIsHistoryOpen(true)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium shrink-0 flex items-center gap-2 hover:bg-slate-700 transition-colors"><History size={16}/> {t.history}</button>
            {!hasApiKey && <button onClick={async () => { if ((window as any).aistudio) { await (window as any).aistudio.openSelectKey(); setHasApiKey(true); } }} className="px-4 py-2 bg-red-600 rounded-lg text-xs font-bold shrink-0 flex items-center gap-2 hover:bg-red-500 transition-all shadow-lg shadow-red-900/20"><Key size={14}/> {t.apiKey}</button>}
        </div>
      </header>

      <HistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} items={historyItems} onLoad={handleLoadHistoryItem} onDelete={(id) => {
        const next = historyItems.filter(it => it.id !== id);
        setHistoryItems(next);
        localStorage.setItem('videoSceneFlow_history', JSON.stringify(next));
      }} />

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto">
        <div className="lg:col-span-4 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.step1}</h2>
              <div className="flex bg-slate-800 p-1 rounded-md">
                <button onClick={() => setInputType(InputType.FILE)} className={`px-3 py-1 text-[10px] font-bold rounded ${inputType === InputType.FILE ? 'bg-slate-600' : 'text-slate-500'}`}>{t.sourceFile}</button>
                <button onClick={() => setInputType(InputType.TEXT)} className={`px-3 py-1 text-[10px] font-bold rounded ${inputType === InputType.TEXT ? 'bg-slate-600' : 'text-slate-500'}`}>{t.sourcePrompt}</button>
              </div>
            </div>
            <div className="bg-slate-900 border border-dashed border-slate-700 rounded-xl p-1">
              {inputType === InputType.FILE ? (
                <div className="h-40 flex flex-col items-center justify-center rounded-lg bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer overflow-hidden" onClick={() => !uploadedFile.file && fileInputRef.current?.click()}>
                  <input type="file" ref={fileInputRef} className="hidden" accept="video/*,image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) setUploadedFile({file:f, previewUrl:URL.createObjectURL(f), type: f.type.startsWith('video') ? 'video':'image'}); }} />
                  {uploadedFile.file ? <img src={uploadedFile.previewUrl!} className="w-full h-full object-cover" /> : <div className="text-center text-xs text-slate-500"><Upload className="mx-auto mb-2" size={20}/> {t.uploadClick}</div>}
                </div>
              ) : <textarea className="w-full h-40 bg-slate-800/30 rounded-lg p-4 text-xs border-none focus:ring-0 text-slate-200" placeholder={t.promptPlaceholder} value={promptText} onChange={e => setPromptText(e.target.value)} />}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.step2}</h2>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 space-y-4">
               <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter"><Globe size={12}/> {t.visualLang}</label>
                  <div className="flex bg-slate-800 p-1 rounded-lg">
                    {['vi', 'en'].map(l => (
                      <button key={l} onClick={() => setVisualLang(l as any)} className={`w-8 h-8 rounded-md text-[10px] font-bold uppercase transition-all ${visualLang === l ? 'bg-blue-600' : 'text-slate-500'}`}>{l}</button>
                    ))}
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter"><MapPin size={12} className="text-blue-400" /> {t.locationVibe}</label>
                  <textarea 
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 outline-none transition-all"
                    placeholder={t.locationPlaceholder}
                    rows={2}
                    value={settingPrompt}
                    onChange={e => setSettingPrompt(e.target.value)}
                  />
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter"><ImageIcon size={12} className="text-blue-400" /> {t.imgQuality}</label>
                      <div className="group relative">
                        <Info size={12} className="text-slate-500 cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-[10px] text-slate-300 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          {t.imgTooltip}
                        </div>
                      </div>
                    </div>
                    <select 
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                      value={imageQuality}
                      onChange={(e) => setImageQuality(e.target.value as ImageQuality)}
                    >
                      <option value="1K">1K Standard</option>
                      <option value="2K">2K High Def</option>
                      <option value="4K">4K Ultra HD</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter"><Monitor size={12} className="text-indigo-400" /> {t.vidQuality}</label>
                      <div className="group relative">
                        <Info size={12} className="text-slate-500 cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-[10px] text-slate-300 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          {t.vidTooltip}
                        </div>
                      </div>
                    </div>
                    <select 
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      value={videoQuality}
                      onChange={(e) => setVideoQuality(e.target.value as VideoQuality)}
                    >
                      <option value="720p">720p Fast</option>
                      <option value="1080p">1080p Quality</option>
                    </select>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter"><Layers size={12} className="text-yellow-400" /> {t.transition}</label>
                    <select 
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-yellow-500"
                      value={transitionMode}
                      onChange={(e) => setTransitionMode(e.target.value as TransitionMode)}
                    >
                      <option value="Smooth">Dissolve</option>
                      <option value="KenBurns">Ken Burns</option>
                      <option value="Dynamic">Dynamic Slide</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter"><Timer size={12} className="text-emerald-400" /> {t.duration}</label>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">{slideshowDelay}s</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" step="1" 
                      className="w-full h-1.5 mt-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                      value={slideshowDelay} 
                      onChange={e => setSlideshowDelay(parseInt(e.target.value))} 
                    />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter"><Music size={12} className="text-pink-400" /> {t.musicTitle}</label>
                  <div className="relative">
                    <input 
                        type="file" 
                        ref={musicInputRef} 
                        className="hidden" 
                        accept="audio/*" 
                        onChange={handleMusicUpload} 
                    />
                    {uploadedMusic ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between bg-pink-900/20 border border-pink-900/50 rounded-lg p-2 animate-in fade-in duration-300">
                              <div className="flex items-center gap-2 overflow-hidden">
                                  <Music size={14} className="text-pink-400 shrink-0" />
                                  <span className="text-[10px] text-pink-200 font-bold truncate max-w-[150px]">{uploadedMusic.file.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button onClick={toggleMusicPreview} className="p-1 hover:bg-pink-900/40 rounded text-pink-400">
                                    {isMusicPlaying ? <Pause size={14} /> : <Play size={14} />}
                                </button>
                                <button onClick={() => setUploadedMusic(null)} className="p-1 hover:bg-pink-900/40 rounded text-pink-400">
                                    <X size={14} />
                                </button>
                              </div>
                          </div>
                          <audio 
                            ref={audioRef} 
                            src={uploadedMusic.url} 
                            onEnded={() => setIsMusicPlaying(false)} 
                            onPlay={() => setIsMusicPlaying(true)}
                            onPause={() => setIsMusicPlaying(false)}
                            className="hidden"
                          />
                        </div>
                    ) : (
                        <button 
                            onClick={() => musicInputRef.current?.click()} 
                            className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all hover:bg-slate-700 hover:border-slate-600"
                        >
                            <Upload size={14} /> {t.musicUpload}
                        </button>
                    )}
                  </div>
               </div>

               <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter"><Users size={12}/> {t.charCount}</label>
                  <div className="flex bg-slate-800 p-1 rounded-lg">
                    {[1, 2, 3].map(n => (
                      <button key={n} onClick={() => handleCharacterCountChange(n)} className={`w-8 h-8 rounded-md text-[10px] font-bold ${characterCount === n ? 'bg-blue-600' : 'text-slate-500'}`}>{n}</button>
                    ))}
                  </div>
               </div>
               {characterDescriptions.map((desc, idx) => (
                 <textarea key={idx} className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:border-blue-500 transition-all outline-none" placeholder={t.charPlaceholder} rows={2} value={desc} onChange={e => { const nd = [...characterDescriptions]; nd[idx] = e.target.value; setCharacterDescriptions(nd); }} />
               ))}
               <div className="grid grid-cols-2 gap-2">
                 {DURATION_OPTIONS.map(o => <button key={o.value} onClick={() => setSelectedDuration(o.value)} className={`py-2 px-3 rounded-lg text-[10px] font-bold border transition-all ${selectedDuration === o.value ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'}`}>{o.label}</button>)}
               </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {features.map(f => <FeatureCard key={f.title} title={f.title} description={f.desc} icon={f.icon} isActive={selectedFeature === f.title} onClick={() => setSelectedFeature(f.title as FeatureMode)} />)}
            </div>
          </section>

          <button onClick={handleAnalyze} disabled={isAnalyzing || !hasApiKey} className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${isAnalyzing || !hasApiKey ? 'bg-slate-700 opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'}`}>
            {isAnalyzing ? <RefreshCw className="animate-spin" size={20}/> : <Sparkles size={20}/>} {isAnalyzing ? t.analyzing : t.analyzeBtn}
          </button>
          {error && <p className="text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-900/50">{error}</p>}
        </div>

        <div className="lg:col-span-8 flex flex-col">
           <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-1 flex flex-col min-h-[600px]">
              <div className="aspect-video bg-black rounded-xl overflow-hidden relative group shadow-2xl">
                 <SlideshowPreview 
                    scenes={resultData} 
                    sourcePreviewUrl={uploadedFile.previewUrl} 
                    sourceType={uploadedFile.type}
                    slideshowDelay={slideshowDelay}
                    musicUrl={uploadedMusic?.url}
                    transitionMode={transitionMode}
                    lang={uiLang}
                 />
              </div>
              
              {resultData.length > 0 ? (
                <ResultTable 
                  data={resultData} 
                  styleGuide={styleGuide} 
                  generatingIndex={generatingIndex} 
                  videoGeneratingIndex={videoGeneratingIndex}
                  onGenerateImage={handleGenerateReferenceImage} 
                  onGenerateVideo={handleGenerateVideo}
                  onGenerateAllImages={handleGenerateAllImages} 
                  onGenerateAllVideos={handleGenerateAllVideos}
                  onSave={handleSaveToHistory} 
                  onUpdateScene={handleUpdateScene}
                  onAddScene={handleAddScene}
                  lang={uiLang}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-700 uppercase text-[10px] font-bold opacity-30">
                  <Type size={48} className="mb-4"/> 
                  {t.emptyPlaceholder}
                </div>
              )}
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;
