// src/components/Popup.tsx
interface PopupProps {
    message: string;
    onClose: () => void;
  }
  
  const Popup = ({ message, onClose }: PopupProps) => {
    return (
      <div 
        className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 
                   bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-lg
                   max-w-sm md:max-w-md mx-4 animate-fade-in"
      >
        <div className="text-sm md:text-base">
          {message}
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:text-gray-300"
          >
            ×
          </button>
        </div>
      </div>
    );
  };
  
  export default Popup;