import { X } from 'lucide-react';

const AcknowledgmentModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold mb-2">Acknowledgments</h2>
        <p className="text-sm text-gray-700 mb-4">
          This project draws inspiration from the work of many — including visualizations, evolutionary nutrition research,
          and open-source contributions.
        </p>

        <p className="text-sm text-gray-700">
          A special acknowledgment goes to <strong>Matt Korostoff</strong> for his brilliant
          <a
            href="https://dbkrupp.github.io/1-pixel-wealth/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline ml-1"
          >
            1-pixel-wealth visualization
          </a>
          , which inspired the core design concept of this timeline.
        </p>
      </div>
    </div>
  );
};

export default AcknowledgmentModal;
