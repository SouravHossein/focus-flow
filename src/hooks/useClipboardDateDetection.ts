import { useState, useCallback, useEffect, useRef } from 'react';
import { detectDatesInText, type DetectedDate } from '@/lib/nlp/detectDatesInText';

export function useClipboardDateDetection() {
  const [detectedDate, setDetectedDate] = useState<DetectedDate | null>(null);
  const [visible, setVisible] = useState(false);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const text = e.clipboardData?.getData('text');
    if (!text) return;
    const dates = detectDatesInText(text);
    if (dates.length > 0) {
      setDetectedDate(dates[0]);
      setVisible(true);
    }
  }, []);

  const accept = useCallback(() => {
    setVisible(false);
    return detectedDate;
  }, [detectedDate]);

  const dismiss = useCallback(() => {
    setVisible(false);
    setDetectedDate(null);
  }, []);

  const attachTo = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    element.addEventListener('paste', handlePaste as any);
    return () => element.removeEventListener('paste', handlePaste as any);
  }, [handlePaste]);

  return { detectedDate, visible, accept, dismiss, attachTo };
}
