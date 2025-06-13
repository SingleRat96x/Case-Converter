'use client';

interface AdSpaceProps {
  position: 'top' | 'middle' | 'bottom';
  className?: string;
}

export default function AdSpace({ position, className = '' }: AdSpaceProps) {
  // This is where you can centrally manage all your ads
  // You can add different ads based on position, A/B testing, etc.
  
  const getAdContent = () => {
    switch (position) {
      case 'top':
        return (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Advertisement</p>
            <div className="bg-white dark:bg-gray-700 rounded p-3 border-2 border-dashed border-gray-300 dark:border-gray-600">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Top Ad Space - Replace with your ad content
              </p>
            </div>
          </div>
        );
      case 'middle':
        return (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Advertisement</p>
            <div className="bg-white dark:bg-gray-700 rounded p-3 border-2 border-dashed border-gray-300 dark:border-gray-600">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Middle Ad Space - Replace with your ad content
              </p>
            </div>
          </div>
        );
      case 'bottom':
        return (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Advertisement</p>
            <div className="bg-white dark:bg-gray-700 rounded p-3 border-2 border-dashed border-gray-300 dark:border-gray-600">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Bottom Ad Space - Replace with your ad content
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {getAdContent()}
    </div>
  );
} 