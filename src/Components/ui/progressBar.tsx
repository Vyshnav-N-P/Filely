// ProgressBar.tsx
'use client'

interface ProgressBarProps {
  progress: number;
  type: 'sending' | 'receiving'; // to differentiate between sending and receiving
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, type }) => {
  return (
    <div className="w-full bg-gray-300 rounded h-4 mt-4">
      <div
        className={`h-4 rounded ${type === 'sending' ? 'bg-green-500' : 'bg-blue-500'}`}
        style={{ width: `${progress}%` }}
      ></div>
      <div className="text-center text-sm mt-1">
        {type === 'sending' ? 'Sending...' : 'Receiving...'} {progress.toFixed(2)}%
      </div>
    </div>
  );
};

export default ProgressBar; // Ensure it's exported as default
