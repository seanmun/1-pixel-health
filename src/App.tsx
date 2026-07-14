import { useState } from 'react';
import Journey from './components/journey/Journey';
import Sources from './components/Sources';
import Categories from './components/Categories';
import Footer from './components/Footer';

type View = 'journey' | 'categories' | 'sources';

const NAV: { id: View; label: string }[] = [
  { id: 'journey', label: 'Journey' },
  { id: 'categories', label: 'Categories' },
  { id: 'sources', label: 'Sources' },
];

function App() {
  const [view, setView] = useState<View>('journey');

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Fixed glass nav */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/70 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          <button
            onClick={() => setView('journey')}
            className="flex items-center gap-2 text-sm font-bold tracking-tight"
          >
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-[#FF6B6B] to-[#FF5DA2]" />
            Human Diet
          </button>
          <div className="flex items-center gap-1">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition md:text-sm ${
                  view === item.id
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main>
        {view === 'journey' && <Journey />}
        {view === 'categories' && (
          <div className="pt-14">
            <Categories />
          </div>
        )}
        {view === 'sources' && (
          <div className="pt-14">
            <Sources />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
