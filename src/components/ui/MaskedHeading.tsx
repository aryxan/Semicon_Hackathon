import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface MaskedHeadingProps {
  text: string;
  src: string;
  mediaType?: 'image' | 'video';
  poster?: string;
  fillScale?: number;
  parallax?: number;
  reveal?: 'rise' | 'fade' | 'none';
  trigger?: 'view' | 'load';
  drift?: number;
  brightness?: number;
  saturation?: number;
  grayscale?: boolean;
  duration?: number;
  stagger?: number;
  align?: 'center' | 'left' | 'right';
  weight?: number;
  tracking?: number;
  lineHeight?: number;
  textScale?: number;
  className?: string;
}

export default function MaskedHeading({
  text,
  src,
  mediaType = 'image',
  poster,
  fillScale = 1.25,
  parallax = 0,
  reveal = 'rise',
  trigger = 'view',
  drift = 0,
  brightness = 1,
  saturation = 1,
  grayscale = false,
  duration = 1.1,
  stagger = 0.09,
  align = 'center',
  weight = 700,
  tracking = -0.03,
  lineHeight = 1.06,
  textScale = 0.115,
  className
}: MaskedHeadingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(trigger === 'load');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (trigger !== 'view') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [trigger]);

  useEffect(() => {
    if (parallax === 0 && drift === 0) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress from 0 (bottom of screen) to 1 (top of screen)
      const progress = 1 - (rect.top / windowHeight);
      
      // Clamp between -0.5 and 1.5 for smooth edge transitions
      const clampedProgress = Math.max(-0.5, Math.min(1.5, progress));
      setScrollProgress(clampedProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init

    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallax, drift]);

  const words = text.split(' ');

  // Calculate dynamic transform based on scroll
  const parallaxY = (scrollProgress - 0.5) * parallax * 10;
  const driftX = (scrollProgress - 0.5) * drift * 10;

  const getAlignmentClass = () => {
    switch (align) {
      case 'left': return 'text-left';
      case 'right': return 'text-right';
      case 'center':
      default: return 'text-center';
    }
  };

  const getMediaFilter = () => {
    const filters = [];
    if (brightness !== 1) filters.push(`brightness(${brightness})`);
    if (saturation !== 1) filters.push(`saturate(${saturation})`);
    if (grayscale) filters.push('grayscale(100%)');
    return filters.join(' ');
  };

  return (
    <div 
      ref={containerRef}
      className={twMerge('relative overflow-hidden w-full h-[60vh] min-h-[400px] flex flex-col justify-center', className)}
      style={{
        fontSize: `calc(100vw * ${textScale})`,
        fontWeight: weight,
        letterSpacing: `${tracking}em`,
        lineHeight: lineHeight,
      }}
    >
      {/* Background Media with CSS Mix Blend Mode for masking effect */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden"
        style={{
          transform: `scale(${fillScale}) translate3d(${driftX}px, ${parallaxY}px, 0)`,
          transition: 'transform 0.1s ease-out',
          filter: getMediaFilter()
        }}
      >
        {mediaType === 'video' ? (
          <video 
            src={src} 
            poster={poster}
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img 
            src={src} 
            alt="Masked background" 
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Foreground masking element - Dark background with transparent text cutout */}
      <div className="absolute inset-0 z-10 bg-[var(--color-background)] mix-blend-multiply pointer-events-none"></div>

      {/* The Text - Rendered white on black background, then mix-blend-screen masks the video into the text */}
      <div 
        className={clsx(
          'relative z-20 w-full px-8 text-white mix-blend-screen flex flex-wrap',
          getAlignmentClass(),
          align === 'center' && 'justify-center',
          align === 'right' && 'justify-end'
        )}
      >
        {words.map((word, wordIndex) => (
          <span 
            key={wordIndex} 
            className="inline-block overflow-hidden mr-[0.2em] mb-[0.1em]"
          >
            <span
              className={clsx(
                'inline-block transition-transform ease-[cubic-bezier(0.16,1,0.3,1)]',
                isVisible ? 'translate-y-0 opacity-100' : (reveal === 'rise' ? 'translate-y-[120%] opacity-0' : 'opacity-0')
              )}
              style={{
                transitionDuration: `${duration}s`,
                transitionDelay: `${wordIndex * stagger}s`,
              }}
            >
              {word}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
