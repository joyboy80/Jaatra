import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import img1 from "../../assets/images/jamuna.jpg";
import img2 from "../../assets/images/jamuna student.jpg";
import img3 from "../../assets/images/jamuna full body.jpg";
import img4 from "../../assets/images/jamuna campus.jpg";

const IMAGES = [
  { src: img1, alt: "Jamuna bus of CUET" },
  { src: img2, alt: "CUET students near Jamuna bus" },
  { src: img3, alt: "Full body view of Jamuna bus" },
  { src: img4, alt: "Jamuna bus in the campus" },
];

const AUTOPLAY_INTERVAL_MS = 5000;
const SWIPE_THRESHOLD = 50;

export default function DashboardBusCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + IMAGES.length) % IMAGES.length);
  }, []);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (isPaused) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return; // Do not auto-play if reduced motion is requested

    const timer = setInterval(goToNext, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isPaused, goToNext]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipeGesture();
  };

  const handleSwipeGesture = () => {
    const deltaX = touchStartX.current - touchEndX.current;
    if (deltaX > SWIPE_THRESHOLD) goToNext();
    if (deltaX < -SWIPE_THRESHOLD) goToPrev();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") goToPrev();
    if (e.key === "ArrowRight") goToNext();
  };

  return (
    <section 
      className="relative w-full max-w-full overflow-hidden rounded-3xl shadow-float ring-1 ring-white/20 bg-slate-100 group mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan dark:ring-slate-800"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="CUET Bus Highlights"
    >
      <div 
        className="flex transition-transform duration-700 ease-in-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {IMAGES.map((img, idx) => (
          <div 
            key={idx} 
            className="w-full flex-shrink-0 relative aspect-[16/9] sm:aspect-[21/9] lg:max-h-[380px]"
            aria-hidden={idx !== currentIndex}
          >
            <img 
              src={img.src} 
              alt={img.alt} 
              className="w-full h-full object-cover object-center"
              loading={idx === 0 ? "eager" : "lazy"} 
              decoding="async"
            />
            {/* Subtle Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 right-6 pointer-events-none">
              <h2 className="text-white text-2xl sm:text-3xl font-display font-black tracking-tight drop-shadow-md">Safar Transportation</h2>
              <p className="text-white/90 text-sm sm:text-base mt-2 max-w-xl font-medium drop-shadow-sm">Safe, intelligent, and convenient mobility powered by AI.</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        type="button"
        onClick={(e) => { e.stopPropagation(); goToPrev(); }}
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button 
        type="button"
        onClick={(e) => { e.stopPropagation(); goToNext(); }}
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {IMAGES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => goToSlide(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              idx === currentIndex ? "bg-white scale-125 w-6" : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
            aria-current={idx === currentIndex ? "true" : "false"}
          />
        ))}
      </div>
    </section>
  );
}
