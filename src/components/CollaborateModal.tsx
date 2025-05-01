// src/components/CollaborateModal.tsx
import { X } from 'lucide-react';

const CollaborateModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold mb-2">Become a Collaborator</h2>
        <p className="text-sm text-gray-700 mb-4">
          Looking to help improve this project? Here are some ways to get involved:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>Research new historical or dietary references</li>
          <li>UI/UX design enhancements</li>
          <li>Testing across devices and screen sizes</li>
          <li>Quality assurance and bug tracking</li>
          <li>Content editing or scientific review</li>
        </ul>
        <p className="mt-4 text-sm">
          Email:{" "}
          <a href="mailto:sean.munley@protonmail.com" className="text-blue-600 underline">
            sean.munley@protonmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default CollaborateModal;
