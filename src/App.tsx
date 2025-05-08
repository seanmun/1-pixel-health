import { useState } from 'react';
import Timeline from './components/Timeline';
import Sources from './components/Sources';
import Categories from './components/Categories';
import Footer from './components/Footer';

function App() {
  const [view, setView] = useState<'timeline' | 'sources' | 'categories'>('timeline');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="p-4 flex gap-4">
        <button onClick={() => setView('timeline')}>Timeline</button>
        <button onClick={() => setView('sources')}>Sources</button>
        <button onClick={() => setView('categories')}>Categories</button>
      </nav>

      {view === 'timeline' && <Timeline />}
      {view === 'sources' && <Sources />}
      {view === 'categories' && <Categories />}

      <Footer />
    </div>
  );
}

export default App;
