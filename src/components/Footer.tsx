import { useState } from 'react';
import { Globe, Linkedin, Twitter } from 'lucide-react';
import AcknowledgmentModal from './AcknowledgmentModal';
import CollaborateModal from './CollaborateModal';

const Footer = () => {
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [collabModalOpen, setCollabModalOpen] = useState(false);

  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-8 text-sm text-gray-700">
      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3 text-center md:text-left">
        {/* Column 1: Info */}
        <div>
          <p className="font-semibold text-gray-900 mb-1">© Human-Diet.com</p>
          <p>Interactive visualization showing</p>
          <p>300,000 years of human dietary changes</p>
        </div>

        {/* Column 2: Author & Contact */}
        <div>
          <p className="font-semibold text-gray-900 mb-1">Built by Sean Munley</p>
          <div className="flex justify-center md:justify-start gap-4 mt-2">
            <a href="https://twitter.com/seanmunley" target="_blank" rel="noopener noreferrer">
              <Twitter className="w-5 h-5 hover:text-blue-500 transition" />
            </a>
            <a href="https://linkedin.com/in/sean-munley" target="_blank" rel="noopener noreferrer">
              <Linkedin className="w-5 h-5 hover:text-blue-700 transition" />
            </a>
            <a href="https://seanmun.com" target="_blank" rel="noopener noreferrer">
              <Globe className="w-5 h-5 hover:text-green-600 transition" />
            </a>
          </div>
        </div>

        {/* Column 3: Modal Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => setAckModalOpen(true)}
            className="text-blue-600 underline hover:text-blue-800 transition"
          >
            Acknowledgments
          </button>
          <br />
          <button
            onClick={() => setCollabModalOpen(true)}
            className="text-blue-600 underline hover:text-blue-800 transition"
          >
            Become a Collaborator
          </button>
        </div>
      </div>

      {/* Modals */}
      <AcknowledgmentModal isOpen={ackModalOpen} onClose={() => setAckModalOpen(false)} />
      <CollaborateModal isOpen={collabModalOpen} onClose={() => setCollabModalOpen(false)} />
    </footer>
  );
};

export default Footer;
