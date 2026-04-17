"use client"

import { useCallback, useRef, useState, useEffect } from "react"
import { Download, Upload, Loader2, Move, CheckSquare, Square } from "lucide-react"

export default function ReleaseReadyPage() {
  const [appState, setAppState] = useState<"idle" | "validating" | "ready">("idle")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [masteredUrl, setMasteredUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [offset, setOffset] = useState({ x: 0.5, y: 0.5 })
  const [isDragging, setIsDragging] = useState(false)
  const [addSignature, setAddSignature] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const requestRef = useRef<number | null>(null)

  useEffect(() => {
    document.title = "deVee | Release Ready";
  }, []);

  const handleMastering = useCallback(async (sourceUrl: string) => {
    setIsProcessing(true);
    const canvas = document.createElement("canvas");
    canvas.width = 3000;
    canvas.height = 3000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = sourceUrl;
    });

    ctx.clearRect(0, 0, 3000, 3000);
    const scale = Math.max(3000 / img.width, 3000 / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = (3000 - dw) * offset.x;
    const dy = (3000 - dh) * offset.y;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, dx, dy, dw, dh);

    if (addSignature) {
      const signImg = new Image();
      signImg.src = "/deVee Sign Transperent.png";
      try {
        await new Promise((resolve, reject) => {
          signImg.onload = resolve;
          signImg.onerror = reject;
        });
        const signW = 320; 
        const signH = (signImg.height / signImg.width) * signW;
        ctx.save();
        ctx.globalAlpha = 0.8; 
        const posX = 3000 - signW - 90;
        const posY = 3000 - signH - 90;
        ctx.translate(posX + signW / 2, posY + signH / 2);
        ctx.rotate(-8 * Math.PI / 180);
        ctx.drawImage(signImg, -signW / 2, -signH / 2, signW, signH);
        ctx.restore();
      } catch (e) { console.error("Sign missing"); }
    }

    setMasteredUrl(canvas.toDataURL("image/jpeg", 0.95));
    setIsProcessing(false);
    setAppState("ready");
  }, [offset, addSignature])

  useEffect(() => {
    if (imageUrl && !isDragging) {
      handleMastering(imageUrl)
    }
  }, [imageUrl, isDragging, handleMastering, addSignature])

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !imageRef.current) return;
    
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    requestRef.current = requestAnimationFrame(() => {
      const rect = imageRef.current!.getBoundingClientRect();
      const x = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      const y = Math.min(Math.max((clientY - rect.top) / rect.height, 0), 1);
      setOffset({ x: 1 - x, y: 1 - y });
    });
  }, [isDragging]);

  return (
    <main className="relative h-screen bg-[#0a0a0a] text-white flex flex-col items-center px-4 py-8 font-sans overflow-hidden select-none touch-none">
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full h-[400px] bg-[#FFD700]/5 blur-[120px]" />
      </div>

      <header className="relative z-10 flex flex-col items-center gap-4 flex-none">
        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#FFD700]/30 shadow-[0_0_30px_rgba(255,215,0,0.15)]">
          <img src="/Release Ready iCon.png" alt="Icon" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 drop-shadow-md italic">
          RELEASE READY
        </h1>
      </header>

      <div className="relative z-10 w-full flex-1 flex items-center justify-center max-w-[450px]">
        <div className="w-full bg-[#121212] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md">
          
          {appState === "idle" ? (
            <div className="w-full aspect-square flex items-center justify-center">
              <button onClick={() => fileInputRef.current?.click()} className="group w-full h-full border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-5 hover:border-[#FFD700]/40 hover:bg-[#FFD700]/5 transition-all">
                <Upload className="w-8 h-8 text-[#FFD700]" />
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">Upload Artwork</p>
              </button>
              <input type="file" ref={fileInputRef} onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) { setAppState("validating"); setImageUrl(URL.createObjectURL(file)) }
              }} className="hidden" accept="image/*" />
            </div>
          ) : (
            <div className="space-y-6 flex flex-col items-center">
              <div 
                ref={imageRef}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                onTouchStart={() => setIsDragging(true)}
                onTouchEnd={() => setIsDragging(false)}
                onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
                className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black border border-white/5 cursor-move"
              >
                {/* שינוי קריטי: מציג את ה-masteredUrl (עם החתימה) כשהוא מוכן, ואת המקור רק בזמן גרירה */}
                <img 
                  src={(isDragging || isProcessing) ? imageUrl! : (masteredUrl || imageUrl!)} 
                  style={{
                    objectFit: 'cover',
                    objectPosition: isDragging ? `${offset.x * 100}% ${offset.y * 100}%` : 'center',
                    transition: isDragging ? 'none' : 'object-position 0.2s ease-out'
                  }}
                  className={`w-full h-full pointer-events-none ${appState === "validating" || isProcessing ? "opacity-40 blur-sm" : ""}`} 
                />
                
                {appState === "ready" && !isDragging && !isProcessing && (
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                    <Move className="w-3 h-3 text-[#FFD700]" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#FFD700]">Drag to Adjust</span>
                  </div>
                )}

                {(appState === "validating" || isProcessing) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-10 h-10 text-[#FFD700] animate-spin" />
                  </div>
                )}
              </div>

              {appState === "ready" && (
                <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <button 
                    onClick={() => setAddSignature(!addSignature)}
                    className="w-full flex items-center gap-4 bg-[#1a1a1a] p-5 rounded-2xl border border-white/5 hover:border-[#FFD700]/30 transition-all"
                  >
                    {addSignature ? 
                      <CheckSquare className="w-6 h-6 text-[#FFD700]" /> : 
                      <Square className="w-6 h-6 text-white/20" />
                    }
                    {/* כיתוב באותיות גדולות וקטנות */}
                    <span className="text-[11px] font-black tracking-widest text-white/70">
                      Add deVee Sign
                    </span>
                  </button>

                  <button onClick={() => {
                    if (!masteredUrl) return;
                    const link = document.createElement("a");
                    link.download = `deVee_Master_Ready.jpg`;
                    link.href = masteredUrl;
                    link.click();
                  }} className="w-full bg-[#FFD700] text-black font-black py-5 rounded-xl uppercase text-xs shadow-[0_0_25px_rgba(255,215,0,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" /> Download Master Artwork
                  </button>
                  <button onClick={() => {setImageUrl(null); setAppState("idle"); setOffset({x:0.5, y:0.5}); setAddSignature(false)}} className="w-full text-white/20 font-bold py-2 uppercase text-[9px]">Reset Calculator</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="relative z-10 flex-none flex flex-col items-center gap-4 py-4">
        <p className="text-[10px] font-medium tracking-[0.2em] text-white/30">Powered By deVee Boutique Label</p>
        <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shadow-lg">
          <img src="/label_logo.jpg" alt="Label" className="w-full h-full object-cover" />
        </div>
      </footer>
    </main>
  )
}