'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ChevronsLeftRight } from 'lucide-react';

interface InteractiveSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  onChange: (value: number) => void;
  className?: string;
  unit?: string;
}

export function InteractiveSlider({
  value,
  min,
  max,
  step = 1,
  label,
  onChange,
  className = '',
  unit = ''
}: InteractiveSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  // Store the active track rect during a drag to avoid ref conflicts between mobile/desktop tracks
  const activeTrackRectRef = useRef<DOMRect | null>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const getValueFromPosition = useCallback((clientX: number): number => {
    // Prefer the rect captured at drag start; fallback to current ref
    const rect = activeTrackRectRef.current ?? sliderRef.current?.getBoundingClientRect();
    if (!rect) return value;
    const position = (clientX - rect.left) / rect.width;
    const clampedPosition = Math.max(0, Math.min(1, position));
    const rawValue = min + clampedPosition * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  }, [min, max, step, value]);

  const updateValue = useCallback((clientX: number) => {
    const newValue = getValueFromPosition(clientX);
    if (newValue !== value) {
      onChange(newValue);
    }
  }, [getValueFromPosition, onChange, value]);

  // Keyboard support
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    let nextValue = value;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      nextValue = Math.min(max, value + step);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      nextValue = Math.max(min, value - step);
    } else if (e.key === 'PageUp') {
      nextValue = Math.min(max, value + step * 5);
    } else if (e.key === 'PageDown') {
      nextValue = Math.max(min, value - step * 5);
    } else if (e.key === 'Home') {
      nextValue = min;
    } else if (e.key === 'End') {
      nextValue = max;
    }
    if (nextValue !== value) {
      e.preventDefault();
      onChange(nextValue);
    }
  }, [value, min, max, step, onChange]);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // Capture the rect of the exact track that was interacted with
    const target = e.currentTarget as HTMLDivElement;
    activeTrackRectRef.current = target.getBoundingClientRect();
    setIsDragging(true);
    updateValue(e.clientX);
  }, [updateValue]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      updateValue(e.clientX);
    }
  }, [isDragging, updateValue]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    activeTrackRectRef.current = null;
  }, []);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const target = e.currentTarget as HTMLDivElement;
      activeTrackRectRef.current = target.getBoundingClientRect();
      setIsDragging(true);
      updateValue(e.touches[0].clientX);
    }
  }, [updateValue]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging && e.touches.length > 0) {
      e.preventDefault();
      updateValue(e.touches[0].clientX);
    }
  }, [isDragging, updateValue]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    activeTrackRectRef.current = null;
  }, []);

  // Global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Desktop Layout - Inline */}
      <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
        {/* Label */}
        <span className="text-sm text-muted-foreground flex-shrink-0">
          {label.replace(/:\s*\d+.*$/, '')}: <span className="text-lg font-bold text-foreground">{value}{unit ? ` ${unit}` : ''}</span>
        </span>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-1 max-w-sm">
          {/* Decrement Button */}
          <Button
            onClick={handleDecrement}
            disabled={value <= min}
            variant="outline"
            size="sm"
            className="h-8 w-8 rounded-full p-0 flex-shrink-0"
          >
            <Minus className="h-3 w-3" />
          </Button>

          {/* Slider Track */}
          <div className="flex-1 relative">
            <div
              ref={sliderRef}
              className="h-2 bg-muted rounded-full cursor-pointer relative select-none"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              tabIndex={0}
              role="slider"
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={value}
              onKeyDown={handleKeyDown}
            >
              {/* Progress Fill */}
              <div
                className="h-full bg-primary rounded-full transition-all duration-150"
                style={{ width: `${percentage}%` }}
              />
              
              {/* Thumb */}
              <div
                data-slider-thumb
                className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-2 border-primary rounded-full shadow-sm cursor-grab transition-all duration-150 flex items-center justify-center text-primary ${
                  isDragging ? 'scale-105 cursor-grabbing shadow-lg ring-2 ring-primary/30' : ''
                }`}
                style={{ left: `calc(${percentage}% - 16px)` }}
                aria-hidden="true"
              >
                <ChevronsLeftRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Increment Button */}
          <Button
            onClick={handleIncrement}
            disabled={value >= max}
            variant="outline"
            size="sm"
            className="h-8 w-8 rounded-full p-0 flex-shrink-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Mobile Layout - Stacked with centered title */}
      <div className="sm:hidden space-y-3">
        {/* Centered Label with emphasized number */}
        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            {label.replace(/:\s*\d+.*$/, '')}: <span className="text-lg font-bold text-foreground">{value}{unit ? ` ${unit}` : ''}</span>
          </span>
        </div>

        {/* Slider Controls */}
        <div className="flex items-center gap-3">
          {/* Decrement Button */}
          <Button
            onClick={handleDecrement}
            disabled={value <= min}
            variant="outline"
            size="sm"
            className="h-8 w-8 rounded-full p-0 flex-shrink-0"
          >
            <Minus className="h-3 w-3" />
          </Button>

          {/* Slider Track */}
          <div className="flex-1 relative">
            <div
              ref={sliderRef}
              className="h-2 bg-muted rounded-full cursor-pointer relative select-none"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              {/* Progress Fill */}
              <div
                className="h-full bg-primary rounded-full transition-all duration-150"
                style={{ width: `${percentage}%` }}
              />
              
              {/* Thumb */}
              <div
                data-slider-thumb
                className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-2 border-primary rounded-full shadow-sm cursor-grab transition-all duration-150 flex items-center justify-center text-primary ${
                  isDragging ? 'scale-105 cursor-grabbing shadow-lg ring-2 ring-primary/30' : ''
                }`}
                style={{ left: `calc(${percentage}% - 16px)` }}
                aria-hidden="true"
              >
                <ChevronsLeftRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Increment Button */}
          <Button
            onClick={handleIncrement}
            disabled={value >= max}
            variant="outline"
            size="sm"
            className="h-8 w-8 rounded-full p-0 flex-shrink-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}