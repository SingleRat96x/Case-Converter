'use client';

import React from 'react';

interface ReadingSpeedSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  speeds: {
    label: string;
    wpm: number;
  }[];
  className?: string;
}

export function ReadingSpeedSlider({ 
  label, 
  value, 
  onChange, 
  speeds,
  className = '' 
}: ReadingSpeedSliderProps) {
  
  const getCurrentLabel = () => {
    const speed = speeds.find(s => s.wpm === value);
    return speed?.label || 'Average';
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value);
    onChange(speeds[index].wpm);
  };

  const currentIndex = speeds.findIndex(s => s.wpm === value);
  const selectedIndex = currentIndex >= 0 ? currentIndex : 1; // Default to middle (Average)

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Title with current WPM */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">
          {label}
        </h3>
        <span className="text-lg font-bold text-primary">
          {value} WPM
        </span>
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max={speeds.length - 1}
          step="1"
          value={selectedIndex}
          onChange={handleSliderChange}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(selectedIndex / (speeds.length - 1)) * 100}%, hsl(var(--muted)) ${(selectedIndex / (speeds.length - 1)) * 100}%, hsl(var(--muted)) 100%)`
          }}
        />

        {/* Labels */}
        <div className="flex justify-between text-xs text-muted-foreground">
          {speeds.map((speed, index) => (
            <button
              key={speed.wpm}
              onClick={() => onChange(speed.wpm)}
              className={`flex-1 text-center py-1 rounded transition-colors ${
                selectedIndex === index
                  ? 'text-primary font-semibold'
                  : 'hover:text-foreground'
              }`}
            >
              {speed.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current selection indicator */}
      <div className="text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          {getCurrentLabel()}
        </span>
      </div>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          border: 3px solid hsl(var(--background));
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          border: 3px solid hsl(var(--background));
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
