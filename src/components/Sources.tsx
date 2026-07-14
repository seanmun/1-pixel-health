import { SOURCE_MAP } from '../data/sources';

const Sources = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="text-3xl font-extrabold md:text-4xl">Sources & References</h1>
      <p className="mt-2 max-w-2xl text-white/50">
        Dietary compositions are estimates synthesized from archaeological,
        anthropological, historical, and nutritional research.
      </p>
      <ul className="mt-10 space-y-3">
        {Object.entries(SOURCE_MAP).map(([id, source]) => (
          <li
            key={id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
          >
            <h2 className="text-lg font-semibold">{source.title}</h2>
            <p className="mt-0.5 text-sm text-white/45">
              <span className="italic">{source.author}</span> · {source.year}
            </p>
            <p className="mt-2 text-sm text-white/70">{source.summary}</p>
            <a
              href={source.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#FF5DA2] hover:underline"
            >
              View source →
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sources;
