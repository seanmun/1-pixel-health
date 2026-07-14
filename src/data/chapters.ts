// src/data/chapters.ts
// Narrative chapters for the scrollytelling journey. Bodies are adapted from
// the original TIMELINE_EVENTS; titles/kickers frame each moment in the arc.

export interface Chapter {
  year: number;
  kicker: string; // short era label
  title: string;
  body: string;
  sourceId?: string;
  climax?: boolean; // triggers the visual "explosion" treatment
}

export const CHAPTERS: Chapter[] = [
  {
    year: -300000,
    kicker: 'The First Humans',
    title: 'A diet built on animals',
    body: 'Early Homo sapiens emerged in Africa ~300,000 years ago — no shelter, no medicine, constant danger. Their diet was overwhelmingly large game, rounded out by gathered plants, fruits, and nuts.',
    sourceId: 'homo-sapiens-diet',
  },
  {
    year: -280000,
    kicker: 'Toolmaking',
    title: 'The spear changes everything',
    body: 'Wooden spears let humans hunt large animals far more effectively — less scavenging, more access to dense, nutrient-rich animal foods.',
    sourceId: 'wooden-spears',
  },
  {
    year: -250000,
    kicker: 'Fire',
    title: 'Cooking rewires nutrition',
    body: 'The habitual use of fire spreads. Cooking unlocks nutrients, kills pathogens, and provides warmth — opening colder regions of the world to us.',
    sourceId: 'fire-usage',
  },
  {
    year: -100000,
    kicker: 'Culture',
    title: 'Symbols, ritual, identity',
    body: 'Red ochre, ornamentation, and early burials appear. Diet is now bound up with culture, cooperation, and increasingly complex social life.',
    sourceId: 'symbolic-behavior',
  },
  {
    year: -20000,
    kicker: 'The Ice Age',
    title: 'Peak reliance on the hunt',
    body: 'At the height of the Ice Age, plants grow scarce. Survival leans hard on large game, and cold-climate preservation becomes a way of life.',
  },
  {
    year: -10000,
    kicker: 'The Thaw',
    title: 'The first farms',
    body: 'As the ice retreats, plant diversity returns and primitive agriculture begins. Traditional processing is born: early fermentation, drying, and wild-grain bread.',
  },
  {
    year: -5000,
    kicker: 'Civilization',
    title: 'Grain takes hold',
    body: 'Farming civilizations rise. Grain climbs, hunting fades, and food craft blossoms — brewing, cheese-making, wine, and better bread.',
  },
  {
    year: -1000,
    kicker: 'Cities & Trade',
    title: 'The rise of the food maker',
    body: 'Trade and cities widen the pantry. Specialist bakers, brewers, and cheesemakers supply growing urban populations with traditionally processed foods.',
  },
  {
    year: 1500,
    kicker: 'The Columbian Exchange',
    title: 'The world on one plate',
    body: 'Potatoes, tomatoes, and maize cross oceans and reshape diets everywhere — adapted with the same time-honored preservation techniques.',
  },
  {
    year: 1800,
    kicker: 'The Industrial Revolution',
    title: 'The first factory food',
    body: 'Canning is invented. Factories begin making food at scale, and the first chemical additives appear. Modern processing has begun — and the graph starts to shift.',
  },
  {
    year: 1900,
    kicker: 'Mass Production',
    title: 'Additives, sugar, seed oils',
    body: 'Preservatives become routine, refined sugar consumption soars, and the first artificial colors and flavors enter the food supply. Seed oils appear for the first time.',
    climax: true,
  },
  {
    year: 1950,
    kicker: 'The Convenience Era',
    title: 'The golden age of processing',
    body: 'TV dinners, shelf-stable products, and fast food sweep the world. Traditional processing all but vanishes from the home kitchen.',
    climax: true,
  },
  {
    year: 2000,
    kicker: 'Ultra-Processed',
    title: 'Peak processed food',
    body: 'Ultra-processed products with dozens of engineered ingredients dominate the supermarket. In a geological blink, the human diet has been rewritten.',
    climax: true,
  },
  {
    year: 2025,
    kicker: 'Today',
    title: 'A quiet reckoning',
    body: 'A whole-foods movement revives fermentation, sourdough, and ancient techniques — even as ultra-processed foods remain the modern default. Where we go next is still being written.',
  },
];
