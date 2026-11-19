import { SOURCE_MAP, SOURCE_TOPICS, Source } from '../data/sources';
import { CHAPTERS } from '../data/chapters';
import { FULL_SPAN, MIN_SPAN, formatYear } from '../utils/timeScale';

const byTopic = (topic: string): [string, Source][] =>
  Object.entries(SOURCE_MAP).filter(([, s]) => s.topic === topic);

// Share of the whole timeline taken up by the modern window (the last 150 years).
const MODERN_SHARE = ((MIN_SPAN / FULL_SPAN) * 100).toFixed(2);

const Sources = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="text-3xl font-extrabold md:text-4xl">Method & Sources</h1>
      <p className="mt-2 max-w-2xl text-white/50">
        How the journey is drawn, what the numbers mean, and the evidence
        behind each claim.
      </p>

      {/* How time is drawn */}
      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-7">
        <h2 className="text-xl font-bold">How time is drawn: the linear timeline</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/70 md:text-[15px]">
          <p>
            The coloured strip along the bottom of the journey is{' '}
            <strong className="text-white">strictly linear</strong>: every year
            is drawn exactly the same width, and the present is pinned to the
            right-hand edge. Nothing is stretched or compressed. Drawn that
            way, the {FULL_SPAN.toLocaleString()} years of our species show
            what the data really says — one long, nearly unchanging band, and
            then all of the modern change squeezed into a sliver. The last{' '}
            {MIN_SPAN} years are {MODERN_SHARE}% of the timeline, which on a
            typical screen is less than a single pixel.
          </p>
          <p>
            Most history charts quietly use a logarithmic or broken axis so the
            recent past is readable. That makes the modern era look like a
            large share of human history when it is not. We keep the axis
            honest and move the <em>camera</em> instead: as you scroll, the
            strip zooms toward the present, always showing a true, evenly
            spaced window from “you are here” to now.
          </p>
          <p>
            The walk above the strip is a{' '}
            <strong className="text-white">time-lapse</strong>, not a scale
            drawing. If the walkers crossed every year at the same pace, they
            would spend more than 99.9% of the journey in an unchanging
            landscape. So their pace through time slows as they approach the
            present, and the display always states it — from thousands of years
            per step at the start to about six months per step at the end. Use
            the walk for the story and the strip for the proportions.
          </p>
        </div>
      </section>

      {/* What the numbers are */}
      <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-7">
        <h2 className="text-xl font-bold">What the numbers are — and are not</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/70 md:text-[15px]">
          {NOTES.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>

      {/* Evidence by chapter */}
      <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-7">
        <h2 className="text-xl font-bold">Evidence by chapter</h2>
        <ul className="mt-3 space-y-3 text-sm">
          {CHAPTERS.map((c) => (
            <li key={c.year} className="md:flex md:gap-4">
              <div className="shrink-0 text-white/80 md:w-56">
                <span className="font-mono text-xs text-white/40">{formatYear(c.year)}</span>{' '}
                {c.title}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {c.sourceIds.map((id) => (
                  <a key={id} href={`#${id}`} className="text-[#FF5DA2] hover:underline">
                    {SOURCE_MAP[id]?.author.split(/,| & | and colleagues| \(/)[0]} {SOURCE_MAP[id]?.year}
                  </a>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Sources by topic */}
      {SOURCE_TOPICS.map((topic) => {
        const entries = byTopic(topic.id);
        if (entries.length === 0) return null;
        return (
          <section key={topic.id} className="mt-12">
            <h2 className="text-xl font-bold">{topic.label}</h2>
            <p className="mt-1 text-sm text-white/50">{topic.blurb}</p>
            <ul className="mt-4 space-y-3">
              {entries.map(([id, source]) => (
                <li
                  key={id}
                  id={id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <h3 className="text-base font-semibold md:text-lg">{source.title}</h3>
                  <p className="mt-0.5 text-sm text-white/45">
                    <span className="italic">{source.author}</span> · {source.year}
                    {source.publication ? ` · ${source.publication}` : ''}
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
          </section>
        );
      })}
    </div>
  );
};

const NOTES: string[] = [
  'The diet bands are a stylised reconstruction, not a measurement. They are built from the research below to show the order and rough size of each change. Prehistoric shares in particular carry wide uncertainty and varied enormously by latitude and season.',
  'The eight bands never overlap, so they always add to 100%. For today that means "seed oils" counts all added plant fats and oils wherever they are eaten (about a fifth of available US calories, USDA 2010), "modern processed" is the rest of ultra-processed food, and the whole-food bands are only what is eaten unprocessed or minimally processed. Seed oils and modern processed together come to about 58%, in line with ultra-processed foods at 55% of US calories (CDC, 2021–23) plus oil used outside them. Values for 1800–1950 are illustrative: US food-supply data begin in 1909 and ultra-processed estimates in 2001.',
  'Life expectancy at birth is an average pulled down by infant and child deaths: before modern medicine roughly a quarter of babies died in their first year and nearly half of children before 15. It never meant adults died at 30 — foragers who reached 45 typically lived another two decades.',
  'Infant mortality is the number of babies per 1,000 born alive who died before their first birthday. Before 1500 it is a cross-cultural average of about 27%, held flat because the evidence is a scatter of estimates rather than a series. From 1590 it follows English parish records, and the drop at that point is a change of source, not a sudden improvement. The US figures for 1850–1895 are census-based estimates for the white population that recent work argues are too high, possibly by half. Measured US rates begin in 1915.',
  'Median age at death is the age by which half of those born had died. Before 1800 it is inferred from child-mortality rates and model life tables rather than measured, and is uncertain by at least five years either way.',
  'No single population is followed through time. Prehistoric lifespans come from 20th-century foragers used as a proxy; early heights from European skeletons; early-modern lifespans from England; and everything from 1800 from the United States (white population only before 1900). Where the series changes population it can step — the height rise between 1700 and 1800 is Europe giving way to the US, not growth.',
  'Height did not fall simply because of farming. In Europe the largest drop came among hunter-gatherers around the last glacial maximum; early farmers were then often a little shorter still, and somewhat shorter than their genes predicted. US men have not grown taller since about 2000.',
  'Body weight before the 1860s was never measured. The early values rest on living foragers and on estimates from skeletons, and are illustrative.',
  'Energy per person combines two measures: total energy capture including food (Morris) up to 1900, and US primary energy use (EIA) from 1950. US energy use per person peaked in 1978–79 and has since fallen by about a fifth.',
  'On energy and longevity: across countries, life expectancy rises steeply with energy use at low levels and then flattens, with most health measures levelling off somewhere between 10 and 75 gigajoules (about 3,000–21,000 kWh) per person per year. Energy looks like a necessary enabler of what directly extends life — food, clean water, sanitation, medicine — rather than the single cause: in the one study that compares drivers directly, total energy use explains less of the gain in life expectancy than household electricity, income or food supply. These are correlations, not proof of cause.',
];

export default Sources;
