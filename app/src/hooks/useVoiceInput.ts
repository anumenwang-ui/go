import { useState, useCallback, useRef } from "react";

interface VoiceState {
  listening: boolean;
  supported: boolean;
  result: string;
  error: string | null;
}

export function useVoiceInput() {
  const [state, setState] = useState<VoiceState>({
    listening: false,
    supported: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    result: "",
    error: null,
  });
  const recognitionRef = useRef<InstanceType<typeof SpeechRecognition> | null>(null);

  const start = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setState((s) => ({ ...s, error: "当前浏览器不支持语音输入", supported: false }));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setState((s) => ({ ...s, listening: true, error: null, result: "" }));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setState((s) => ({ ...s, result: s.result ? s.result + transcript : transcript }));
    };

    recognition.onerror = (event: Event) => {
      const err = event as SpeechRecognitionErrorEvent;
      setState((s) => ({ ...s, listening: false, error: err.error === "not-allowed" ? "麦克风权限被拒绝" : "语音识别出错，请手动输入" }));
    };

    recognition.onend = () => {
      setState((s) => ({ ...s, listening: false }));
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setState((s) => ({ ...s, listening: false }));
  }, []);

  const clear = useCallback(() => {
    setState((s) => ({ ...s, result: "", error: null }));
  }, []);

  return { ...state, start, stop, clear };
}
