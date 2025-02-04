// src/components/Popup.tsx
interface PopupProps {
  message: string;
}

const Popup = ({ message }: PopupProps) => {
  return (
    <div 
      className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 
                 bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-lg
                 max-w-sm md:max-w-md mx-4 animate-fade-in transition-opacity duration-500"
    >
      <div className="text-sm md:text-base">
        {message}
      </div>
    </div>
  );
};

export default Popup;