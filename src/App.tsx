import { useEffect, useState } from 'react';
import Journey from './components/journey/Journey';
import Sources from './components/Sources';
import Categories from './components/Categories';
import Objects from './components/Objects';
import Footer from './components/Footer';

type View = 'journey' | 'categories' | 'objects' | 'sources';

const NAV: { id: View; label: string }[] = [
  { id: 'journey', label: 'Journey' },
  { id: 'categories', label: 'Categories' },
  { id: 'objects', label: 'Objects' },
  { id: 'sources', label: 'Sources' },
];

function App() {
  const [view, setView] = useState<View>('journey');

  // On phones the nav gets out of the way while the reader walks forward
  // through the journey, drops back in as soon as they scroll back, and is
  // always there at the start and the end. `--nav-h` tells the journey how
  // much room the nav is taking so its top-pinned panels can move up.
  const [navHidden, setNavHidden] = useState(false);
  useEffect(() => {
    const phone = window.matchMedia('(max-width: 767px)');
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const footer = document.querySelector('footer')?.offsetHeight ?? 0;
      const end = document.documentElement.scrollHeight - vh - footer;
      const atEdge = y < vh * 0.6 || y > end - vh * 0.7;
      if (view !== 'journey' || !phone.matches || atEdge) setNavHidden(false);
      else if (y > last + 4) setNavHidden(true);
      else if (y < last - 4) setNavHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    phone.addEventListener('change', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      phone.removeEventListener('change', onScroll);
    };
  }, [view]);
  useEffect(() => {
    document.documentElement.style.setProperty('--nav-h', navHidden ? '0rem' : '3.5rem');
  }, [navHidden]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Fixed glass nav */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/70 backdrop-blur-md transition-transform duration-300 ${
          navHidden ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          <button
            onClick={() => setView('journey')}
            className="flex items-center gap-2 text-sm font-bold tracking-tight"
          >
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-[#FF6B6B] to-[#FF5DA2]" />
            <span className="hidden whitespace-nowrap min-[430px]:inline">Human Diet</span>
          </button>
          <div className="flex items-center gap-0.5 md:gap-1">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`rounded-full px-2 py-1.5 text-xs md:px-3 font-medium transition md:text-sm ${
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
        {view === 'objects' && (
          <div className="pt-14">
            <Objects />
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
