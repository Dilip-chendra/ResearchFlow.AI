import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

interface AudioSection {
  title: string;
  text: string;
}

interface AudioBriefingData {
  jobId: string;
  businessName: string;
  sections: AudioSection[];
  fullScript: string;
  estimatedDurationSeconds: number;
}

export const AudioBriefingPlayer: React.FC<{ jobId: string }> = ({ jobId }) => {
  const [data, setData] = useState<AudioBriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [progress, setProgress] = useState<number>(0); // 0 to 100

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    const loadBriefing = async () => {
      try {
        setLoading(true);
        const res = await api.getAudioBriefing(jobId);
        setData(res);
      } catch (err) {
        console.error('Failed to load audio briefing:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBriefing();

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [jobId]);

  const handlePlayPause = () => {
    if (!synthRef.current || !data) return;

    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      if (synthRef.current.paused) {
        synthRef.current.resume();
        setIsPlaying(true);
      } else {
        synthRef.current.cancel();
        playFromSection(activeSectionIndex);
      }
    }
  };

  const playFromSection = (index: number) => {
    if (!synthRef.current || !data) return;

    synthRef.current.cancel();
    if (intervalRef.current) clearInterval(intervalRef.current);

    setActiveSectionIndex(index);
    const targetSection = data.sections[index];
    if (!targetSection) {
      setIsPlaying(false);
      setProgress(100);
      return;
    }

    const textToSpeak = `${targetSection.title}. ${targetSection.text}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = playbackRate;
    utteranceRef.current = utterance;

    // Pick best available English voice
    const voices = synthRef.current.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Alex'))) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      if (index + 1 < data.sections.length) {
        playFromSection(index + 1);
      } else {
        setIsPlaying(false);
        setProgress(100);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    synthRef.current.speak(utterance);
    setIsPlaying(true);

    // Track simulated progress
    const totalSec = data.estimatedDurationSeconds || 60;
    const step = 100 / (totalSec / playbackRate);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          return 100;
        }
        return prev + step * 0.5;
      });
    }, 500);
  };

  const handleRestart = () => {
    if (!synthRef.current || !data) return;
    synthRef.current.cancel();
    setProgress(0);
    playFromSection(0);
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (isPlaying) {
      playFromSection(activeSectionIndex);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl animate-pulse text-xs text-zinc-500">
        Loading audio executive briefing...
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-zinc-950 text-white rounded-2xl border border-indigo-900/60 p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide uppercase">AI Voice Executive Briefing</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-500/30 text-indigo-300 rounded-full border border-indigo-500/40">
                Interactive Speech
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span>~{data.estimatedDurationSeconds}s listening time &bull; {data.sections.length} chapters</span>
            </p>
          </div>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 text-[11px] font-semibold">
          {[1.0, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => handleRateChange(rate)}
              className={`px-2 py-0.5 rounded transition-colors ${
                playbackRate === rate
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Controls & Waveform */}
      <div className="bg-zinc-900/60 rounded-xl border border-zinc-800/80 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayPause}
            className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95 shrink-0"
            title={isPlaying ? 'Pause Briefing' : 'Play Audio Briefing'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={handleRestart}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            title="Restart from beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Equalizer animation when playing */}
          <div className="flex-1 flex items-center gap-1 h-6 px-2 overflow-hidden">
            {[40, 70, 30, 90, 50, 80, 60, 100, 45, 75, 35, 85, 65, 95, 55, 70, 40].map((h, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-indigo-500 transition-all duration-300"
                style={{
                  height: isPlaying ? `${Math.max(15, (h * (Math.sin(Date.now() / 200 + i) + 1.2)) % 100)}%` : '20%',
                  opacity: isPlaying ? 0.9 : 0.3,
                }}
              />
            ))}
          </div>

          <span className="text-[11px] font-mono text-zinc-400">
            Chapter {activeSectionIndex + 1}/{data.sections.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Chapters / Karaoke Transcript */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        {data.sections.map((section, idx) => {
          const isCurrent = activeSectionIndex === idx;
          const isDone = activeSectionIndex > idx;

          return (
            <button
              key={idx}
              onClick={() => playFromSection(idx)}
              className={`p-3 rounded-xl text-left border transition-all ${
                isCurrent
                  ? 'bg-indigo-900/40 border-indigo-500 text-white shadow-xs'
                  : isDone
                  ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  : 'bg-zinc-900/20 border-zinc-800/60 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className={isCurrent ? 'text-indigo-300' : 'text-zinc-300'}>{section.title}</span>
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isCurrent && isPlaying ? (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                ) : null}
              </div>
              <p className="text-[11px] line-clamp-2 leading-relaxed text-zinc-400">
                {section.text}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
