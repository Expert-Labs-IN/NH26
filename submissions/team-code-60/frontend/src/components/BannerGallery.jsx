import { useState, useRef, useEffect, useCallback } from 'react';
import { Image, Download, Sparkles, X } from 'lucide-react';

function drawBanner(canvas, banner, productImage) {
  const ctx = canvas.getContext('2d');
  const W = 1024, H = 576;
  canvas.width = W;
  canvas.height = H;

  // Gradient background
  const colors = banner.gradient || ['#4F46E5', '#7C3AED', '#EC4899'];
  const grad = ctx.createLinearGradient(0, 0, W, H);
  colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Decorative circles
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(W * 0.8, H * 0.2, 200, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(W * 0.15, H * 0.75, 150, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(W * 0.5, H * 0.5, 300, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Decorative lines
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(0, H * 0.2 + i * 80);
    ctx.bezierCurveTo(W * 0.3, H * 0.1 + i * 80, W * 0.7, H * 0.4 + i * 60, W, H * 0.2 + i * 80);
    ctx.stroke();
  }

  // Content area
  const textX = productImage ? W * 0.08 : W * 0.5;
  const textAlign = productImage ? 'left' : 'center';
  const maxTextW = productImage ? W * 0.55 : W * 0.8;

  // Tagline
  ctx.textAlign = textAlign;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText((banner.tagline || '').toUpperCase(), textX, H * 0.3);

  // Product name
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const name = banner.productName || 'Product';
  // Word wrap
  const words = name.split(' ');
  let line = '';
  let y = H * 0.45;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxTextW && line) {
      ctx.fillText(line.trim(), textX, y);
      line = word + ' ';
      y += 58;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), textX, y);

  // Description
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const desc = banner.productDesc || '';
  if (desc) {
    const descWords = desc.split(' ');
    let dLine = '';
    let dY = y + 45;
    for (const w of descWords) {
      const test = dLine + w + ' ';
      if (ctx.measureText(test).width > maxTextW && dLine) {
        ctx.fillText(dLine.trim(), textX, dY);
        dLine = w + ' ';
        dY += 28;
        if (dY > H * 0.85) break;
      } else {
        dLine = test;
      }
    }
    ctx.fillText(dLine.trim(), textX, dY);
  }

  // Price badge
  const displayPrice = banner.price;
  if (displayPrice) {
    const px = productImage ? W * 0.08 : W * 0.5 - 50;
    const py = H * 0.82;
    ctx.fillStyle = '#EF4444';
    const priceW = Math.max(ctx.measureText(displayPrice).width + 40, 100);
    ctx.beginPath();
    ctx.roundRect(px, py - 20, priceW, 40, 12);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(displayPrice, px + priceW / 2, py + 7);
  }

  // Bottom label bar
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(0, H - 36, W, 36);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${banner.label} • AI Generated`, W / 2, H - 14);
}

function BannerCard({ banner, index, productImage, price }) {
  const canvasRef = useRef(null);
  const [dataUrl, setDataUrl] = useState(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const bannerData = { ...banner, price: banner.price || price };

    if (productImage) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        drawBanner(canvas, bannerData, true);
        const ctx = canvas.getContext('2d');
        const maxH = canvas.height * 0.6;
        const maxW = canvas.width * 0.3;
        const scale = Math.min(maxW / img.width, maxH / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = canvas.width * 0.72 - w / 2;
        const y = canvas.height * 0.45 - h / 2;
        // Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 10;
        ctx.drawImage(img, x, y, w, h);
        ctx.shadowColor = 'transparent';
        setDataUrl(canvas.toDataURL('image/png'));
      };
      img.onerror = () => {
        drawBanner(canvas, bannerData, false);
        setDataUrl(canvas.toDataURL('image/png'));
      };
      img.src = productImage;
    } else {
      drawBanner(canvas, bannerData, false);
      setDataUrl(canvas.toDataURL('image/png'));
    }
  }, [banner, productImage, price]);

  useEffect(() => { render(); }, [render]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${(banner.label || 'banner').replace(/\s/g, '-').toLowerCase()}-${index}.png`;
    a.click();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden group">
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-900">
        <canvas ref={canvasRef} className="hidden" />
        {dataUrl && (
          <img src={dataUrl} alt={banner.label} className="w-full h-full object-cover" />
        )}
        {dataUrl && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
        )}
      </div>
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{banner.label}</span>
        </div>
        {dataUrl && (
          <button onClick={handleDownload}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors border border-brand-100 dark:border-brand-800">
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        )}
      </div>
    </div>
  );
}

function BannerGallery({ banners, productImage, price }) {
  const [fullscreen, setFullscreen] = useState(null);

  if (!banners || banners.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Image className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">AI-Generated Ad Banners</h3>
          <p className="text-[11px] text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Dynamic banners {productImage && '• Product overlay active'}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {banners.map((banner, i) => (
          <div key={i} className="relative cursor-pointer" onClick={() => setFullscreen(i)}>
            <BannerCard banner={banner} index={i} productImage={productImage} price={price} />
          </div>
        ))}
      </div>

      {/* Fullscreen Modal */}
      {fullscreen !== null && banners[fullscreen] && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6" onClick={() => setFullscreen(null)}>
          <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors" onClick={() => setFullscreen(null)}>
            <X className="w-6 h-6 text-white" />
          </button>
          <BannerCard banner={banners[fullscreen]} index={fullscreen} productImage={productImage} price={price} />
        </div>
      )}
    </div>
  );
}

export default BannerGallery;
