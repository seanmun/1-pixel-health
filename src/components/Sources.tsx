import { SOURCE_MAP } from '../data/sources';

const Sources = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Sources & References</h1>
      <ul className="space-y-4">
        {Object.entries(SOURCE_MAP).map(([id, source]) => (
          <li key={id} className="border border-gray-200 p-4 rounded bg-white shadow">
            <h2 className="text-lg font-semibold">{source.title}</h2>
            <p className="text-sm text-gray-600">
              <span className="italic">{source.author}</span>, {source.year}
            </p>
            <p className="text-sm mt-2">{source.summary}</p>
            <a 
              href={source.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 hover:underline text-sm mt-2 inline-block"
            >
              View Source
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sources;
