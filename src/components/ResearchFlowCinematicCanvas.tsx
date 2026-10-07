import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface TransformationStage {
  progress: number;
  stage: string;
  description: string;
}

export interface CinematicManifest {
  totalFrames: number;
  width: number;
  height: number;
  aspectRatio: string;
  fps: number;
  durationSeconds: number;
  framePattern: string;
  padLength: number;
  sourceVideo: string;
  transformationStages?: TransformationStage[];
}

export interface ResearchFlowCinematicCanvasProps {
  /** Optional custom manifest path. Defaults to /cinematic/manifest.json */
  manifestUrl?: string;
  /**
   * Optional externally controlled scroll progress (0.0 to 1.0).
   * If omitted, the canvas automatically synchronizes to full-page document scroll.
   */
  progress?: number;
  /** Focal point for cover math (0.0 to 1.0). Default is center {x: 0.5, y: 0.5} */
  focalPoint?: { x: number; y: number };
  /** Opacity of the cinematic background overlay gradient. Defaults to 0.4 */
  overlayOpacity?: number;
  /** Additional CSS class names */
  className?: string;
  /** Callback fired whenever the active frame index changes */
  onFrameChange?: (frameIndex: number, progress: number, currentStage?: TransformationStage) => void;
  /** Callback fired when the manifest is successfully loaded */
  onManifestLoaded?: (manifest: CinematicManifest) => void;
  /** Render fixed full-viewport background or relative container */
  isFixed?: boolean;
}

const DEFAULT_MANIFEST: CinematicManifest = {
  totalFrames: 192,
  width: 1280,
  height: 720,
  aspectRatio: '16:9',
  fps: 24,
  durationSeconds: 8.0,
  framePattern: '/cinematic/frames/frame-{index}.jpg',
  padLength: 4,
  sourceVideo: '/cinematic/market-intelligence.mp4',
  transformationStages: [
    { progress: 0.0, stage: 'MARKET_CHAOS', description: 'Midnight research chaos, fragmented tabs and ungrounded claims' },
    { progress: 0.2, stage: 'DISCOVERY', description: 'Structured extraction and source normalization' },
    { progress: 0.4, stage: 'EVIDENCE', description: 'Verified claims and cross-source conflict detection' },
    { progress: 0.6, stage: 'INTELLIGENCE', description: 'Market landscape mapping and positioning insights' },
    { progress: 0.8, stage: 'STRATEGY', description: 'Strategic campaign angles and message architecture' },
    { progress: 1.0, stage: 'ACTION', description: 'Execution workflows and decisive GTM action at market dawn' },
  ],
};

export const ResearchFlowCinematicCanvas: React.FC<ResearchFlowCinematicCanvasProps> = ({
  manifestUrl = '/cinematic/manifest.json',
  progress: externalProgress,
  focalPoint = { x: 0.5, y: 0.5 },
  overlayOpacity = 0.4,
  className = '',
  onFrameChange,
  onManifestLoaded,
  isFixed = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Cached state
  const [manifest, setManifest] = useState<CinematicManifest>(DEFAULT_MANIFEST);
  const [isReady, setIsReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // In-memory image cache
  const imageCacheRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const loadingSetRef = useRef<Set<number>>(new Set());
  const currentRenderedFrameRef = useRef<number>(-1);
  const lastRequestedFrameRef = useRef<number>(1);
  const rafIdRef = useRef<number | null>(null);

  // Helper to format frame URL programmatically
  const getFrameUrl = useCallback(
    (index: number, m: CinematicManifest = manifest): string => {
      const clamped = Math.max(1, Math.min(m.totalFrames, Math.round(index)));
      const padded = String(clamped).padStart(m.padLength || 4, '0');
      return m.framePattern.replace('{index}', padded);
    },
    [manifest]
  );

  // Preload a single frame with priority caching
  const preloadFrame = useCallback(
    (index: number, m: CinematicManifest = manifest): Promise<HTMLImageElement> => {
      const clamped = Math.max(1, Math.min(m.totalFrames, Math.round(index)));
      const cached = imageCacheRef.current.get(clamped);
      if (cached && cached.complete && cached.naturalWidth > 0) {
        return Promise.resolve(cached);
      }

      if (loadingSetRef.current.has(clamped)) {
        return new Promise((resolve) => {
          const check = () => {
            const img = imageCacheRef.current.get(clamped);
            if (img && img.complete && img.naturalWidth > 0) {
              resolve(img);
            } else {
              setTimeout(check, 16);
            }
          };
          check();
        });
      }

      loadingSetRef.current.add(clamped);
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = getFrameUrl(clamped, m);
        img.decoding = 'async';
        img.onload = () => {
          loadingSetRef.current.delete(clamped);
          imageCacheRef.current.set(clamped, img);
          resolve(img);
        };
        img.onerror = () => {
          loadingSetRef.current.delete(clamped);
          console.warn(`[CinematicCanvas] Failed to load frame ${clamped}`);
          reject(new Error(`Failed to load frame ${clamped}`));
        };
      });
    },
    [manifest, getFrameUrl]
  );

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener?.('change', listener);
    return () => mediaQuery.removeEventListener?.('change', listener);
  }, []);

  // Fetch manifest on mount
  useEffect(() => {
    let isCancelled = false;
    fetch(manifestUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Manifest fetch failed with status ${res.status}`);
        return res.json();
      })
      .then((data: CinematicManifest) => {
        if (!isCancelled) {
          setManifest(data);
          onManifestLoaded?.(data);
        }
      })
      .catch((err) => {
        console.warn('[CinematicCanvas] Using fallback manifest:', err.message);
      });

    return () => {
      isCancelled = true;
    };
  }, [manifestUrl, onManifestLoaded]);

  // Priority initial preloading (Frame 1 + key stages)
  useEffect(() => {
    let cancelled = false;

    // Load Frame 1 immediately
    preloadFrame(1, manifest)
      .then(() => {
        if (!cancelled) {
          setIsReady(true);
          renderFrame(1);
        }
      })
      .catch((err) => console.error('[CinematicCanvas] Error loading initial frame:', err));

    // Preload key milestone frames (0%, 25%, 50%, 75%, 100%)
    const keyframes = [
      1,
      Math.round(manifest.totalFrames * 0.25),
      Math.round(manifest.totalFrames * 0.5),
      Math.round(manifest.totalFrames * 0.75),
      manifest.totalFrames,
    ];

    keyframes.forEach((f) => preloadFrame(f, manifest));

    // Progressive background loader using requestIdleCallback
    const idlePreloadQueue: number[] = [];
    for (let i = 2; i <= manifest.totalFrames; i++) {
      if (!keyframes.includes(i)) idlePreloadQueue.push(i);
    }

    let idleId: number | null = null;
    const loadNextIdle = () => {
      if (cancelled || idlePreloadQueue.length === 0) return;
      const batch = idlePreloadQueue.splice(0, 3);
      batch.forEach((idx) => preloadFrame(idx, manifest));

      if (idlePreloadQueue.length > 0) {
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          idleId = (window as any).requestIdleCallback(loadNextIdle, { timeout: 1000 });
        } else {
          idleId = window.setTimeout(loadNextIdle, 60) as any;
        }
      }
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = (window as any).requestIdleCallback(loadNextIdle, { timeout: 1000 });
    } else {
      idleId = window.setTimeout(loadNextIdle, 60) as any;
    }

    return () => {
      cancelled = true;
      if (idleId !== null) {
        if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
          (window as any).cancelIdleCallback(idleId);
        } else {
          clearTimeout(idleId);
        }
      }
    };
  }, [manifest, preloadFrame]);

  // Pure Canvas draw method with high-DPI and object-fit: cover math
  const renderFrame = useCallback(
    (targetFrameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const clampedIndex = Math.max(1, Math.min(manifest.totalFrames, Math.round(targetFrameIndex)));
      lastRequestedFrameRef.current = clampedIndex;

      let img = imageCacheRef.current.get(clampedIndex);

      // If target image is not loaded yet, find nearest cached frame as instant fallback to avoid blank flashes
      if (!img || !img.complete || img.naturalWidth === 0) {
        preloadFrame(clampedIndex, manifest).then(() => {
          if (lastRequestedFrameRef.current === clampedIndex) {
            renderFrame(clampedIndex);
          }
        });

        // Find closest cached frame
        let closestIndex = -1;
        let minDiff = Infinity;
        for (const idx of imageCacheRef.current.keys()) {
          const testImg = imageCacheRef.current.get(idx);
          if (testImg && testImg.complete && testImg.naturalWidth > 0) {
            const diff = Math.abs(idx - clampedIndex);
            if (diff < minDiff) {
              minDiff = diff;
              closestIndex = idx;
            }
          }
        }

        if (closestIndex > 0) {
          img = imageCacheRef.current.get(closestIndex);
        } else {
          return; // No frame ready yet
        }
      }

      if (!img || !img.complete || img.naturalWidth === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for memory efficiency
      const container = containerRef.current || canvas.parentElement || document.body;
      const rect = isFixed
        ? { width: window.innerWidth, height: window.innerHeight }
        : container.getBoundingClientRect();

      const displayW = Math.max(320, rect.width);
      const displayH = Math.max(240, rect.height);

      const targetBufferW = Math.round(displayW * dpr);
      const targetBufferH = Math.round(displayH * dpr);

      // Resize canvas buffer if dimensions changed
      if (canvas.width !== targetBufferW || canvas.height !== targetBufferH) {
        canvas.width = targetBufferW;
        canvas.height = targetBufferH;
        canvas.style.width = `${displayW}px`;
        canvas.style.height = `${displayH}px`;
      }

      // High-DPI reset transform
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Calculate object-fit: cover mathematics
      const srcW = img.naturalWidth || manifest.width || 1280;
      const srcH = img.naturalHeight || manifest.height || 720;
      const srcAspect = srcW / srcH;
      const canvasAspect = targetBufferW / targetBufferH;

      let drawW = targetBufferW;
      let drawH = targetBufferH;
      let offsetX = 0;
      let offsetY = 0;

      // Dynamic focal point: on portrait mobile viewports, shift focalX toward the founder & laptop
      const isPortrait = displayH > displayW;
      const effectiveFocalX = isPortrait ? 0.43 : focalPoint.x;
      const effectiveFocalY = isPortrait ? 0.42 : focalPoint.y;

      if (canvasAspect > srcAspect) {
        // Canvas is wider than source video
        drawW = targetBufferW;
        drawH = Math.round(targetBufferW / srcAspect);
        offsetY = Math.round((targetBufferH - drawH) * effectiveFocalY);
      } else {
        // Canvas is taller than source video (e.g. mobile portrait view)
        drawH = targetBufferH;
        drawW = Math.round(targetBufferH * srcAspect);
        offsetX = Math.round((targetBufferW - drawW) * effectiveFocalX);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Clear & Draw master frame
      ctx.clearRect(0, 0, targetBufferW, targetBufferH);
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

      currentRenderedFrameRef.current = clampedIndex;

      // Nearby-frame proactive prefetch ahead
      const prefetchAhead = 8;
      const prefetchBehind = 4;
      for (let i = 1; i <= prefetchAhead; i++) {
        preloadFrame(clampedIndex + i, manifest);
      }
      for (let i = 1; i <= prefetchBehind; i++) {
        preloadFrame(clampedIndex - i, manifest);
      }

      // Notify external subscriber if stage changed
      if (onFrameChange) {
        const currentProgress = (clampedIndex - 1) / (manifest.totalFrames - 1);
        const stage = manifest.transformationStages?.find((s, idx, arr) => {
          const next = arr[idx + 1];
          return currentProgress >= s.progress && (!next || currentProgress < next.progress);
        });
        onFrameChange(clampedIndex, currentProgress, stage);
      }
    },
    [manifest, focalPoint, isFixed, preloadFrame, onFrameChange]
  );

  // Full-Page Document-Level Scroll Synchronization
  useEffect(() => {
    if (reducedMotion) {
      // If prefers-reduced-motion is enabled, lock onto a representative hero frame (e.g. Intelligence stage)
      renderFrame(Math.round(manifest.totalFrames * 0.5));
      return;
    }

    const computeAndSchedule = () => {
      let normProgress = 0;

      if (typeof externalProgress === 'number') {
        normProgress = Math.max(0, Math.min(1, externalProgress));
      } else {
        // Document-level calculation
        const docElem = document.documentElement;
        const totalScrollable = Math.max(1, docElem.scrollHeight - window.innerHeight);
        const currentScroll = window.scrollY || window.pageYOffset || 0;
        normProgress = Math.max(0, Math.min(1, currentScroll / totalScrollable));
      }

      // Map progress [0.0 ... 1.0] to frame [1 ... totalFrames]
      const targetFrame = 1 + Math.round(normProgress * (manifest.totalFrames - 1));

      if (targetFrame !== currentRenderedFrameRef.current) {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = requestAnimationFrame(() => {
          renderFrame(targetFrame);
        });
      }
    };

    // Initial sync
    computeAndSchedule();

    // Event listeners
    const handleScroll = () => computeAndSchedule();
    const handleResize = () => {
      // Force redraw
      renderFrame(currentRenderedFrameRef.current || 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [externalProgress, manifest, reducedMotion, renderFrame]);

  return (
    <div
      ref={containerRef}
      className={`cinematic-canvas-container pointer-events-none select-none overflow-hidden ${
        isFixed ? 'fixed inset-0 z-0' : 'relative w-full h-full'
      } ${className}`}
      aria-hidden="true"
    >
      {/* High-Performance 2D Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        style={{
          opacity: isReady ? 1 : 0.4,
          filter: 'contrast(1.04) brightness(0.96)',
        }}
      />

      {/* Cinematic Vignette & Ambient Darkness Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          backgroundColor: `rgba(9, 10, 15, ${overlayOpacity})`,
          backgroundImage:
            'radial-gradient(circle at 50% 40%, rgba(9, 10, 15, 0.25) 0%, rgba(9, 10, 15, 0.75) 85%, rgba(9, 10, 15, 0.95) 100%)',
        }}
      />

      {/* Ambient Lighting Edge Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#090A0F]/80 via-transparent to-[#090A0F]/95" />
    </div>
  );
};

export default ResearchFlowCinematicCanvas;
