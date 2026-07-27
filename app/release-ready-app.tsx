"use client"

import { useCallback, useRef, useState, useEffect } from "react"
import { Download, Upload, Loader2, Move, CheckSquare, Square } from "lucide-react"
import { heicTo } from "heic-to"

export default function ReleaseReadyApp() {
 const [appState, setAppState] = useState<"idle" | "validating" | "ready">("idle")
 const [imageUrl, setImageUrl] = useState<string | null>(null)
 const [imageSize, setImageSize] = useState<{width: number, height: number} | null>(null)
 const [masteredUrl, setMasteredUrl] = useState<string | null>(null)
 const [isProcessing, setIsProcessing] = useState(false)

 const [zoom, setZoom] = useState(1)
 const [offset, setOffset] = useState({ x: 0.5, y: 0.5 })
 const [isDragging, setIsDragging] = useState(false)
 const [addSignature, setAddSignature] = useState(false)

 const fileInputRef = useRef<HTMLInputElement>(null)
 const imageRef = useRef<HTMLImageElement>(null)

 const startPos = useRef({ x: 0, y: 0 })
 const startOffset = useRef({ x: 0.5, y: 0.5 })

 useEffect(() => {
 document.title = "Release Ready";
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
 
 // Fill with black in case zoom is less than 1
 ctx.fillStyle = "black";
 ctx.fillRect(0, 0, 3000, 3000);

 const pctW = Math.max(1, img.width / img.height) * zoom * 100;
 const pctH = Math.max(1, img.height / img.width) * zoom * 100;
 const pctX = (100 - pctW) * offset.x;
 const pctY = (100 - pctH) * offset.y;

 const dw = 3000 * (pctW / 100);
 const dh = 3000 * (pctH / 100);
 const dx = 3000 * (pctX / 100);
 const dy = 3000 * (pctY / 100);

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
 }, [offset, addSignature, zoom])

 useEffect(() => {
 if (imageUrl && !isDragging) {
 handleMastering(imageUrl)
 }
 }, [imageUrl, isDragging, handleMastering, addSignature])

 const startDrag = (clientX: number, clientY: number) => {
 setIsDragging(true)
 startPos.current = { x: clientX, y: clientY }
 startOffset.current = { ...offset }
 }

 const onDrag = (clientX: number, clientY: number) => {
 if (!isDragging || !imageRef.current) return;
 const rect = imageRef.current.getBoundingClientRect()
 const deltaX = (clientX - startPos.current.x) / rect.width
 const deltaY = (clientY - startPos.current.y) / rect.height
 setOffset({
 x: Math.min(Math.max(startOffset.current.x - deltaX, 0), 1),
 y: Math.min(Math.max(startOffset.current.y - deltaY, 0), 1)
 })
 }

 return (
 <main className="relative min-h-[100dvh] text-white flex flex-col items-center px-4 pb-6 gap-10 md:gap-0 md:pb-8 overflow-y-auto select-none">

 <div className="fixed inset-0 pointer-events-none">
 <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#FFD700]/20 rounded-full blur-[120px]" />
 </div>

 <header className="w-full relative z-20 flex flex-col items-center shrink-0 mt-8 mb-6">
 <img src="/Release Ready iCon.png?v=2" alt="Release Ready" className="w-[100px] h-[100px] mb-2 object-contain" />
 <h1 className="text-[10px] font-bold tracking-[0.5em] uppercase text-white/60">Release Ready</h1>
 </header>

 <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center max-w-[450px]">
 <div className="w-full bg-[#121212] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md">

 <div className="flex flex-col items-center gap-1.5 mb-6">
 <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#FFD700]/50">
 3000×3000 CUTTER
 </p>
 <p className="text-[9px] text-white/25 tracking-wide text-center">
 The Required Format For Spotify & Apple Music
 </p>
 </div>
 {appState === "idle" ? (
 <div className="w-full aspect-square flex items-center justify-center">
 <button onClick={() => fileInputRef.current?.click()} className="group w-full h-full border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-5 hover:border-[#FFD700]/40 hover:bg-[#FFD700]/5 transition-all">
 <Upload className="w-8 h-8 text-[#FFD700]" />
 <p className="text-xs font-bold uppercase tracking-widest text-white/40">Upload Artwork</p>
 </button>
 <input type="file" ref={fileInputRef} onChange={async (e) => {
 const file = e.target.files?.[0]
 if (file) { 
 setAppState("validating"); 
 let finalUrl = "";
 if (file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif") || file.type === "image/heic") {
 try {
 const converted = await heicTo({ blob: file, type: "image/jpeg", quality: 0.9 });
 finalUrl = URL.createObjectURL(Array.isArray(converted) ? converted[0] : converted);
 } catch (err: any) {
 console.error("HEIC conversion failed", err);
 alert("HEIC Conversion Error: " + (err.message || JSON.stringify(err)));
 setAppState("idle");
 return;
 }
 } else {
 finalUrl = URL.createObjectURL(file);
 }
 
 const img = new Image();
 img.onload = () => {
 setImageSize({ width: img.width, height: img.height });
 setImageUrl(finalUrl);
 };
 img.src = finalUrl;
 }
 }} className="hidden" accept="image/*,.heic,.heif" />
 </div>
 ) : (
 <div className="space-y-6 flex flex-col items-center">
 <div
 ref={imageRef}
 onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
 onMouseMove={(e) => onDrag(e.clientX, e.clientY)}
 onMouseUp={() => setIsDragging(false)}
 onMouseLeave={() => setIsDragging(false)}
 onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
 onTouchMove={(e) => { e.stopPropagation(); onDrag(e.touches[0].clientX, e.touches[0].clientY) }}
 onTouchEnd={() => setIsDragging(false)}
 className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black border border-white/5 cursor-move"
 >
 {imageSize && (
 <img
 src={imageUrl!}
 style={{
 position: 'absolute',
 width: `${Math.max(1, imageSize.width / imageSize.height) * zoom * 100}%`,
 height: `${Math.max(1, imageSize.height / imageSize.width) * zoom * 100}%`,
 left: `${(100 - (Math.max(1, imageSize.width / imageSize.height) * zoom * 100)) * offset.x}%`,
 top: `${(100 - (Math.max(1, imageSize.height / imageSize.width) * zoom * 100)) * offset.y}%`,
 transition: isDragging ? 'none' : 'all 0.2s ease-out'
 }}
 className={`max-w-none pointer-events-none ${appState === "validating" || isProcessing ? "opacity-40 blur-sm" : ""}`}
 />
 )}

 {addSignature && appState === "ready" && !isDragging && (
 <img
 src="/deVee Sign Transperent.png"
 className="absolute bottom-[4%] right-[4%] w-[12%] opacity-80 pointer-events-none"
 style={{ transform: 'rotate(-8deg)' }}
 />
 )}

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
 <div className="w-full space-y-4">
 <div className="flex flex-col items-center gap-2 bg-[#1a1a1a] p-5 rounded-2xl border border-white/5">
 <span className="text-[11px] font-black tracking-widest text-white/70 uppercase">Zoom: {Math.round(zoom * 100)}%</span>
 <input 
 type="range" 
 min="0.1" 
 max="3" 
 step="0.01" 
 value={zoom} 
 onChange={(e) => setZoom(parseFloat(e.target.value))}
 className="w-full accent-[#FFD700] cursor-pointer"
 />
 </div>

 <button
 onClick={() => setAddSignature(!addSignature)}
 className="w-full flex items-center gap-4 bg-[#1a1a1a] p-5 rounded-2xl border border-white/5 hover:border-[#FFD700]/30 transition-all"
 >
 {addSignature ?
 <CheckSquare className="w-6 h-6 text-[#FFD700]" /> :
 <Square className="w-6 h-6 text-white/20" />
 }
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
 <button onClick={() => {setImageUrl(null); setImageSize(null); setZoom(1); setAppState("idle"); setOffset({x:0.5, y:0.5}); setAddSignature(false)}} className="w-full text-white/20 font-bold py-2 uppercase text-[9px]">Reset Calculator</button>
 </div>
 )}
 </div>
 )}
 </div>
 </div>


 </main>
 )
}
