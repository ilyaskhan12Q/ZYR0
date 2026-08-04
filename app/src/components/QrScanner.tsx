import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Loader2, X, CameraOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type ScanStatus = 'idle' | 'starting' | 'scanning' | 'denied' | 'error';

interface QrScannerProps {
  /** Called with the raw decoded text whenever a QR code is successfully scanned. */
  onScan: (decodedText: string) => void;
  disabled?: boolean;
}

export function QrScanner({ onScan, disabled }: QrScannerProps) {
  const readerId = useId();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const stop = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      scanner.clear();
    } catch (err) {
      console.error('[qr] error stopping scanner:', err);
    }
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const start = async () => {
    if (disabled) return;
    setActive(true);
    setStatus('starting');
    setErrorMsg('');
    try {
      const scanner = new Html5Qrcode(readerId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          stop();
          setActive(false);
          setStatus('idle');
          onScanRef.current(decodedText);
        },
        () => {
          /* per-frame decode misses are expected; keep scanning */
        }
      );
      setStatus('scanning');
    } catch (err: any) {
      console.error('[qr] could not start camera:', err);
      const denied = err?.name === 'NotAllowedError' || err?.name === 'NotFoundError';
      setStatus(denied ? 'denied' : 'error');
      setErrorMsg(
        denied
          ? 'Camera access was denied or no camera is available. Use the certificate ID field below instead.'
          : 'Could not start the camera on this device. Use the certificate ID field below instead.'
      );
      setActive(false);
    }
  };

  const cancel = async () => {
    await stop();
    setActive(false);
    setStatus('idle');
  };

  if (status === 'denied' || status === 'error') {
    return (
      <div className="w-full max-w-sm mx-auto bg-card border border-border rounded-xl p-4 text-center">
        <CameraOff className="w-6 h-6 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">{errorMsg}</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" /> Close
        </button>
      </div>
    );
  }

  if (!active) {
    return (
      <button
        type="button"
        onClick={start}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border bg-card hover:bg-muted transition-colors focus-visible-ring',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Camera className="w-4 h-4 text-accent" aria-hidden="true" />
        Scan QR Code
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className={cn('qr-reader-frame', status === 'starting' && 'opacity-60')} id={readerId} />
      {status === 'starting' && (
        <p className="mt-2 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Starting camera…
        </p>
      )}
      {status === 'scanning' && (
        <p className="mt-2 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Point the camera at a certificate QR code
        </p>
      )}
      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={cancel}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border bg-card hover:bg-muted transition-colors focus-visible-ring"
        >
          <X className="w-4 h-4" /> Stop Scanning
        </button>
      </div>
    </div>
  );
}