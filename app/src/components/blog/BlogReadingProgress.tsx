import { useState, useEffect } from 'react';

export function BlogReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setProgress(0);
        return;
      }
      const scrolled = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
      setProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-1 z-50 bg-transparent pointer-events-none"
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-75 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
