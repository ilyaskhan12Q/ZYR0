import { useEffect, useMemo, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Loader2, X, CameraOff, ShieldAlert, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

type ScanStatus = 'idle' | 'starting' | 'scanning' | 'denied' | 'error';

interface QrScannerProps {
  /** Called with the raw decoded text whenever a QR code is successfully scanned. */
  onScan: (decodedText: string) => void;
  disabled?: boolean;
}

/** Classify a getUserMedia start failure into a user-facing state + message. */
function classifyError(err: any): { status: ScanStatus; message: string } {
  // html5-qrcode wraps getUserMedia failures in a plain string like
  // "Error getting userMedia, error = NotAllowedError: Permission denied",
  // so pull the real error name out of the text when err is not an object.
  let name = '';
  if (typeof err === 'string') {
    const match = /error\s*=\s*([A-Za-z]+(?:Error)?)/.exec(err);
    name = match ? match[1] : '';
  } else {
    name = err?.name ?? err?.code ?? '';
  }
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
    return {
      status: 'denied',
      message: 'Camera access was denied. Allow camera access for this site in your browser settings and try again, or use the certificate ID field below.',
    };
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError' || name === 'ConstraintNotSatisfiedError') {
    return {
      status: 'denied',
      message: 'No camera was found on this device. Use the certificate ID field below instead.',
    };
  }
  if (name === 'NotReadableError') {
    return {
      status: 'error',
      message: 'The camera appears to be in use by another app. Close it and try again, or use the certificate ID field below.',
    };
  }
  return {
    status: 'error',
    message: 'Could not start the camera on this device. Use the certificate ID field below instead.',
  };
}

/** Stored camera permission state ('prompt' | 'granted' | 'denied'), or null when unsupported. */
async function getCameraPermissionState(): Promise<PermissionState | null> {
  try {
    const permission = await navigator.permissions.query({ name: 'camera' } as any);
    return permission.state;
  } catch {
    return null;
  }
}

export function QrScanner({ onScan, disabled }: QrScannerProps) {
  const readerId = useMemo(
    () => `qr-reader-${Math.random().toString(36).slice(2, 9)}`,
    []
  );
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const onScanRef = useRef(onScan);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [permissionBlocked, setPermissionBlocked] = useState(false);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  // Start the camera only once the scan frame is mounted (html5-qrcode requires
  // the container to exist in the DOM with a measurable width).
  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    const startScanner = async () => {
      setErrorMsg('');
      setStatus('starting');
      try {
        const scanner = new Html5Qrcode(readerId);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            if (cancelled) return;
            onScanRef.current(decodedText);
            setActive(false);
            setStatus('idle');
          },
          () => {
            /* per-frame decode misses are expected; keep scanning */
          }
        );
        if (cancelled) {
          await scanner.stop().catch(() => {});
          return;
        }
        startedRef.current = true;
        setStatus('scanning');
      } catch (err) {
        if (cancelled) return;
        console.error('[qr] could not start camera:', err);
        const classified = classifyError(err);
        setStatus(classified.status);
        setErrorMsg(classified.message);
        setPermissionBlocked(classified.status === 'denied');
        setActive(false);
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      // A failed start() leaves the scanner in NOT_STARTED; stop() throws there,
      // which would crash the app through the error boundary.
      if (scanner && startedRef.current) {
        try {
          scanner
            .stop()
            .then(() => scanner.clear())
            .catch(() => {});
        } catch {
          /* scanner is not running — nothing to tear down */
        }
      }
      startedRef.current = false;
    };
  }, [active, readerId]);

  const start = async () => {
    if (disabled) return;
    // Camera APIs are only available in secure contexts (HTTPS or localhost).
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('error');
      setErrorMsg(
        'Camera access requires a secure connection (HTTPS). Open this site on https:// or localhost and try again, or use the certificate ID field below.'
      );
      return;
    }
    // If the browser has the camera permission stored as blocked, getUserMedia
    // fails instantly WITHOUT showing the prompt again — tell the user how to
    // re-enable it instead. A 'prompt' state means the browser will ask.
    const permissionState = await getCameraPermissionState();
    if (permissionState === 'denied') {
      setPermissionBlocked(true);
      setStatus('denied');
      setErrorMsg(
        'Camera access is blocked for this site. Click "Open Camera Settings" to allow it, then try again — or use the certificate ID field below.'
      );
      return;
    }
    setPermissionBlocked(false);
    setActive(true);
  };

  const openCameraSettings = () => {
    // chrome:// URLs only work in Chromium browsers; other browsers have to
    // change the permission from their own settings page.
    if (typeof navigator !== 'undefined' && /chrome|edge|chromium/i.test(navigator.userAgent)) {
      window.open('chrome://settings/content/camera', '_blank');
    }
  };

  if (status === 'denied' || status === 'error') {
    return (
      <div className="w-full max-w-sm mx-auto bg-card border border-border rounded-xl p-4 text-center">
        {status === 'denied' ? (
          <CameraOff className="w-6 h-6 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
        ) : (
          <ShieldAlert className="w-6 h-6 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
        )}
        <p className="text-sm text-muted-foreground">{errorMsg}</p>
        {status === 'denied' && permissionBlocked && (
          <button
            type="button"
            onClick={openCameraSettings}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors"
          >
            <Settings className="w-4 h-4" /> Open Camera Settings
          </button>
        )}
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
          onClick={() => setActive(false)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border bg-card hover:bg-muted transition-colors focus-visible-ring"
        >
          <X className="w-4 h-4" /> Stop Scanning
        </button>
      </div>
    </div>
  );
}