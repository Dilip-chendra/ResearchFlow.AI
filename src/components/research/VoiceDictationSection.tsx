import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Sparkles,
  Check,
  RotateCcw,
  Copy,
  Volume2,
  AlertCircle,
  HelpCircle,
  ArrowDownRight,
  Send
} from 'lucide-react';

interface VoiceDictationSectionProps {
  onInsertText: (text: string, targetField: 'businessDescription' | 'campaignObjective' | 'targetAudience' | 'notes') => void;
  activeFieldFocus?: 'businessDescription' | 'campaignObjective' | 'targetAudience' | 'notes';
}

// Browser SpeechRecognition declaration
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const VoiceDictationSection: React.FC<VoiceDictationSectionProps> = ({
  onInsertText,
  activeFieldFocus = 'businessDescription',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<'businessDescription' | 'campaignObjective' | 'targetAudience' | 'notes'>(activeFieldFocus);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState<number[]>(new Array(16).fill(10));
  const [micSupported, setMicSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setMicSupported(false);
    }
    return () => {
      stopRecording();
    };
  }, []);

  useEffect(() => {
    if (activeFieldFocus) {
      setSelectedTarget(activeFieldFocus);
    }
  }, [activeFieldFocus]);

  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateBars = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Take a slice of 16 bars and normalize
        const bars: number[] = [];
        for (let i = 0; i < 16; i++) {
          const val = dataArray[i] || 0;
          // Scale between 8px and 36px
          const scaled = Math.max(8, Math.min(36, Math.round((val / 255) * 36)));
          bars.push(scaled);
        }
        setAudioLevel(bars);
        animationFrameRef.current = requestAnimationFrame(updateBars);
      };

      updateBars();
    } catch (err: any) {
      console.warn('Microphone stream access error:', err);
      // Fallback pseudo-animation
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setAudioLevel(prev => prev.map((_, i) => Math.sin(step * 0.2 + i) * 12 + 18));
      }, 100);
      (window as any)._audioVisInterval = interval;
    }
  };

  const stopAudioVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if ((window as any)._audioVisInterval) {
      clearInterval((window as any)._audioVisInterval);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(new Array(16).fill(8));
  };

  const startRecording = async () => {
    setErrorMessage(null);
    setInterimText('');
    setRecordDuration(0);

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setErrorMessage('Speech recognition is not natively supported in this browser. You can type notes or use Chrome/Edge/Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        startAudioVisualizer();
        timerRef.current = setInterval(() => {
          setRecordDuration(d => d + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += trans;
          } else {
            currentInterim += trans;
          }
        }

        if (currentFinal) {
          setTranscript(prev => (prev ? prev + ' ' + currentFinal.trim() : currentFinal.trim()));
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser.');
        } else if (event.error === 'no-speech') {
          // Keep listening
        } else {
          setErrorMessage(`Dictation event: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // If still marked as recording (browser timed out pause), restart or stop
        setIsRecording(false);
        stopAudioVisualizer();
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setErrorMessage(err.message || 'Unable to access microphone.');
      setIsRecording(false);
      stopAudioVisualizer();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
    stopAudioVisualizer();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClear = () => {
    setTranscript('');
    setInterimText('');
  };

  const handleCopy = () => {
    const fullText = (transcript + (interimText ? ' ' + interimText : '')).trim();
    if (!fullText) return;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = (mode: 'append' | 'replace' = 'append') => {
    const fullText = (transcript + (interimText ? ' ' + interimText : '')).trim();
    if (!fullText) return;
    onInsertText(fullText, selectedTarget);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const fullCurrentText = (transcript + (interimText ? ' ' + interimText : '')).trim();

  return (
    <div className="bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-slate-50 border border-indigo-100 rounded-xl p-3.5 sm:p-4 space-y-3">
      {/* Header & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-red-600 text-white animate-pulse shadow-xs shadow-red-200'
              : 'bg-indigo-600 text-white shadow-2xs'
          }`}>
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-zinc-900">Voice Dictation & Research Notes</h4>
              {isRecording && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  REC {formatTime(recordDuration)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500">
              Speak your product overview, target persona, or competitive hypotheses to auto-fill.
            </p>
          </div>
        </div>

        {/* Start / Stop Toggle */}
        <div className="flex items-center gap-1.5">
          {!isRecording ? (
            <button
              type="button"
              id="btn-start-dictation"
              onClick={startRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Start Dictating</span>
            </button>
          ) : (
            <button
              type="button"
              id="btn-stop-dictation"
              onClick={stopRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Dictating</span>
            </button>
          )}
        </div>
      </div>

      {/* Audio Waveform Visualizer */}
      {isRecording && (
        <div className="py-2 px-3 bg-zinc-900 rounded-lg flex items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="text-[11px] font-mono text-zinc-300">Listening to microphone...</span>
          </div>
          {/* Animated 16-bar spectrum */}
          <div className="flex items-center gap-1 h-8">
            {audioLevel.map((height, idx) => (
              <div
                key={idx}
                className="w-1 bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-full transition-all duration-75"
                style={{ height: `${height}px` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error alert if any */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-[11px] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Live Transcript Box */}
      <div className="relative bg-white border border-indigo-200/80 rounded-xl p-3 shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500/20">
        <div className="flex items-center justify-between mb-1.5 text-[11px]">
          <span className="font-semibold text-zinc-600">
            {isRecording ? 'Live Transcription Preview:' : fullCurrentText ? 'Dictated Content:' : 'Dictation Preview:'}
          </span>
          <div className="flex items-center gap-1.5">
            {fullCurrentText && (
              <>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-zinc-500 hover:text-zinc-800 flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded hover:bg-zinc-100 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-zinc-400 hover:text-zinc-700 flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded hover:bg-zinc-100 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="min-h-[48px] max-h-28 overflow-y-auto text-xs text-zinc-900 leading-relaxed font-normal">
          {transcript ? (
            <span>{transcript}</span>
          ) : null}
          {interimText ? (
            <span className="text-indigo-600 italic"> {interimText}</span>
          ) : null}
          {!transcript && !interimText && (
            <span className="text-zinc-400 italic">
              {isRecording
                ? 'Speak clearly into your microphone...'
                : 'Click "Start Dictating" or press the microphone icon on any input field to dictate notes.'}
            </span>
          )}
        </div>
      </div>

      {/* Target Field Insertion Controls */}
      {fullCurrentText && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 border-t border-indigo-100/80">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-semibold text-zinc-600 shrink-0">Insert into:</span>
            <select
              value={selectedTarget}
              onChange={e => setSelectedTarget(e.target.value as any)}
              className="bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-800 font-medium focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="businessDescription">Value Proposition / Offering</option>
              <option value="campaignObjective">Campaign Objective</option>
              <option value="targetAudience">Target Audience</option>
              <option value="notes">Directives & Field Notes</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleInsert('append')}
              className="flex-1 sm:flex-initial px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Send className="w-3 h-3" />
              <span>Apply to Field</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
