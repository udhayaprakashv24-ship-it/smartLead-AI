import { useState, type ReactNode } from 'react';
import { motion, useReducedMotion, type PanInfo } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { stepCarouselIndex } from '../utils/validation';

export interface SkewedCarouselProps<T> {
  items: readonly T[];
  getKey: (item: T) => string;
  renderCard: (item: T, options: { isActive: boolean; index: number }) => ReactNode;
  activeIndex?: number;
  onIndexChange?: (nextIndex: number) => void;
  ariaLabel?: string;
  skewAngle?: number;
  tiltAngle?: number;
}

export function SkewedCarousel<T>({
  items,
  getKey,
  renderCard,
  activeIndex: controlledIndex,
  onIndexChange,
  ariaLabel = 'Skewed card carousel',
  skewAngle = 5,
  tiltAngle = 14,
}: SkewedCarouselProps<T>) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [dragTilt, setDragTilt] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const total = items.length;
  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const setIndex = (next: number) => {
    if (controlledIndex === undefined) {
      setInternalIndex(next);
    }
    onIndexChange?.(next);
  };

  const handleStep = (delta: 1 | -1) => {
    setIndex(stepCarouselIndex(activeIndex, delta, total));
  };

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (shouldReduceMotion) return;
    const clamped = Math.max(-8, Math.min(8, info.velocity.x * 0.012));
    setDragTilt(clamped);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragTilt(0);
    if (info.offset.x < -55 || info.velocity.x < -300) {
      handleStep(1);
    } else if (info.offset.x > 55 || info.velocity.x > 300) {
      handleStep(-1);
    }
  };

  if (total === 0) return null;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handleStep(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleStep(1);
        }
      }}
      className="relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-4 rounded-2xl"
    >
      {/* Top Bar Controls */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {items.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={getKey(item)}
                type="button"
                onClick={() => setIndex(idx)}
                aria-label={`Go to slide ${idx + 1} of ${total}`}
                aria-current={isActive ? 'true' : undefined}
                className={`h-2 rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                  isActive ? 'w-8 bg-[#2563EB]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-2.5">
          <span className="mr-1 font-mono text-xs font-semibold text-slate-500 tabular-nums">
            0{activeIndex + 1} / 0{total}
          </span>
          <button
            type="button"
            onClick={() => handleStep(-1)}
            aria-label="Previous student story"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#101828] transition-colors hover:border-[#2563EB] hover:bg-[#F4F8FF] hover:text-[#2563EB] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => handleStep(1)}
            aria-label="Next student story"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#101828] transition-colors hover:border-[#2563EB] hover:bg-[#F4F8FF] hover:text-[#2563EB] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* 3D Perspective Skewed Stage */}
      <motion.div
        drag={shouldReduceMotion ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ perspective: 1300 }}
        className="relative mx-auto flex min-h-[430px] w-full items-center justify-center overflow-hidden py-4 sm:min-h-[370px] touch-pan-y select-none"
      >
        {items.map((item, idx) => {
          // Circular relative offset in [-floor(total/2), ceil(total/2)]
          let offset = idx - activeIndex;
          if (offset > total / 2) offset -= total;
          if (offset < -total / 2) offset += total;

          const isActive = offset === 0;
          const absOffset = Math.abs(offset);
          const isVisible = absOffset <= 1;

          const xShiftPercent = offset * 68;
          const cardScale = isActive ? 1 : 0.87;
          const cardSkewY = shouldReduceMotion ? 0 : offset * -skewAngle + dragTilt * 0.45;
          const cardRotateY = shouldReduceMotion ? 0 : offset * -tiltAngle + dragTilt;
          const cardOpacity = isActive ? 1 : isVisible ? 0.58 : 0;

          return (
            <motion.div
              key={getKey(item)}
              data-testid={isActive ? 'active-testimonial' : `testimonial-slide-${idx}`}
              aria-hidden={!isActive}
              initial={false}
              animate={{
                x: `${xShiftPercent}%`,
                scale: cardScale,
                skewY: cardSkewY,
                rotateY: cardRotateY,
                opacity: cardOpacity,
                zIndex: isActive ? 30 : isVisible ? 20 : 10,
              }}
              transition={
                shouldReduceMotion
                  ? { duration: 0.15 }
                  : {
                      type: 'spring',
                      stiffness: 250,
                      damping: 26,
                      mass: 0.9,
                    }
              }
              onClick={() => {
                if (!isActive && isVisible) {
                  setIndex(idx);
                }
              }}
              className={`w-full max-w-3xl transition-shadow ${
                isActive
                  ? 'relative z-30'
                  : isVisible
                    ? 'absolute z-20 hidden cursor-pointer lg:block'
                    : 'pointer-events-none absolute z-10 opacity-0'
              }`}
            >
              {renderCard(item, { isActive, index: idx })}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
