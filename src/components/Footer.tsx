import { useState } from 'react';
import { Globe, Linkedin, Twitter } from 'lucide-react';
import AcknowledgmentModal from './AcknowledgmentModal';
import CollaborateModal from './CollaborateModal';

const Footer = () => {
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [collabModalOpen, setCollabModalOpen] = useState(false);

  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#05050a] px-6 py-10 text-sm text-white/60">
      <div className="mx-auto grid max-w-6xl gap-8 text-center md:grid-cols-3 md:text-left">
        <div>
          <p className="mb-1 font-semibold text-white">© Human-Diet.com</p>
          <p>An interactive visualization of</p>
          <p>300,000 years of human dietary change.</p>
        </div>

        <div>
          <p className="mb-1 font-semibold text-white">Built by Sean Munley</p>
          <div className="mt-2 flex justify-center gap-4 md:justify-start">
            <a href="https://twitter.com/seanmun" target="_blank" rel="noopener noreferrer">
              <Twitter className="h-5 w-5 transition hover:text-[#FF5DA2]" />
            </a>
            <a href="https://linkedin.com/in/sean-munley" target="_blank" rel="noopener noreferrer">
              <Linkedin className="h-5 w-5 transition hover:text-[#FF5DA2]" />
            </a>
            <a href="https://seanmun.com" target="_blank" rel="noopener noreferrer">
              <Globe className="h-5 w-5 transition hover:text-[#FF5DA2]" />
            </a>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setAckModalOpen(true)}
            className="block w-full text-white/70 underline-offset-4 hover:text-white hover:underline md:text-left"
          >
            Acknowledgments
          </button>
          <button
            onClick={() => setCollabModalOpen(true)}
            className="block w-full text-white/70 underline-offset-4 hover:text-white hover:underline md:text-left"
          >
            Become a Collaborator
          </button>
        </div>
      </div>

      <AcknowledgmentModal isOpen={ackModalOpen} onClose={() => setAckModalOpen(false)} />
      <CollaborateModal isOpen={collabModalOpen} onClose={() => setCollabModalOpen(false)} />
    </footer>
  );
};

export default Footer;
