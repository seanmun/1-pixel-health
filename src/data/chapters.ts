// src/data/chapters.ts
// Narrative chapters for the scrollytelling journey. Bodies are adapted from
// the original TIMELINE_EVENTS; titles/kickers frame each moment in the arc.

export interface Chapter {
  year: number;
  kicker: string; // short era label
  title: string;
  body: string;
  eating: string; // typical foods of the era
  prepared: string; // how that food was prepared or preserved
  sourceIds: string[];
  climax?: boolean; // triggers the visual "explosion" treatment
}

export const CHAPTERS: Chapter[] = [
  {
    year: -300000,
    kicker: 'The First Humans',
    title: 'Hunters and gatherers',
    body: 'Homo sapiens appears across Africa about 300,000 years ago. These were hunter-gatherers, eating hunted and scavenged animals alongside gathered tubers, fruits, nuts and seeds — a balance that shifted with place and season.',
    eating: 'Large game, marrow and organ meat, tubers, wild fruit, nuts',
    prepared: 'Raw or roasted over open flame; meat strips air-dried',
    sourceIds: ['hublin-2017-jebel-irhoud', 'cordain-2000-hg-ratios', 'pontzer-wood-2021', 'wadley-2020-rhizomes'],
  },
  {
    year: -280000,
    kicker: 'Toolmaking',
    title: 'The spear changes everything',
    body: 'Wooden hunting spears found among butchered horses at Schöningen, Germany — made by earlier humans, and recently redated to about 200,000 years ago — show organised big-game hunting. Tools like these gave reliable access to dense animal foods.',
    eating: 'Big game — horse, deer, wild cattle — plus gathered plants',
    prepared: 'Butchered with stone tools; marrow cracked from bone',
    sourceIds: ['thieme-1997-schoningen', 'hutson-2025-schoningen-age'],
  },
  {
    year: -250000,
    kicker: 'Fire',
    title: 'Cooking rewires nutrition',
    body: 'Fire became a habitual tool between about 400,000 and 300,000 years ago. Cooking raises the energy gained from meat and starch, kills pathogens, and provides warmth — opening colder regions of the world to us.',
    eating: 'Roasted meat, cooked tubers and roots',
    prepared: 'Open hearths, spit-roasting, baking in embers',
    sourceIds: ['roebroeks-villa-2011', 'shimelmitz-2014-fire', 'carmody-wrangham-2009'],
  },
  {
    year: -100000,
    kicker: 'Culture',
    title: 'Symbols, ritual, identity',
    body: 'Red ochre, ornamentation, and early burials appear. Diet is now bound up with culture, cooperation, and increasingly complex social life.',
    eating: 'Game, shellfish, fish, seeds, wild plants',
    prepared: 'Hearth cooking, smoking, shared communal meals',
    sourceIds: ['henshilwood-2011-ochre-workshop', 'vanhaeren-2006-beads', 'bar-yosef-mayer-2009-qafzeh'],
  },
  {
    year: -20000,
    kicker: 'The Ice Age',
    title: 'Peak reliance on the hunt',
    body: 'Ice sheets reach their maximum between about 26,500 and 19,000 years ago. In the cold north, survival leans hard on large game such as mammoth, and bone needles point to sewn, fitted clothing.',
    eating: 'Mammoth and other large game, fish, some starchy plants',
    prepared: 'Probably frozen, dried or smoked, as Arctic peoples still do — direct evidence is thin',
    sourceIds: ['clark-2009-lgm', 'bocherens-2015-predmosti', 'derrico-2018-needles', 'revedin-2010-flour'],
  },
  {
    year: -10000,
    kicker: 'The Thaw',
    title: 'The first farms',
    body: 'As the ice retreats, farming emerges gradually across the Fertile Crescent. Traditional processing is already under way: flatbread from wild grain 14,400 years ago, and possibly the first brewing soon after.',
    eating: 'Wild grains, legumes, early goats and sheep, game',
    prepared: 'Stone-ground flour, flatbread on hot stones, drying, early fermentation',
    sourceIds: ['walker-2009-holocene', 'zeder-2011-agriculture', 'arranz-otaegui-2018-bread', 'liu-2018-raqefet', 'zeder-hesse-2000-goats'],
  },
  {
    year: -5000,
    kicker: 'Civilization',
    title: 'Grain takes hold',
    body: 'Farming civilizations rise. Grain climbs, hunting fades, and food craft blossoms — brewing, cheese-making, wine, and better bread.',
    eating: 'Wheat and barley bread, porridge, milk, beer, lentils',
    prepared: 'Clay ovens, brewing, cheese-making, salting',
    sourceIds: ['salque-2013-cheese', 'evershed-2008-milk', 'mcgovern-2017-wine', 'wang-2016-beer', 'bogaard-2013-manuring'],
  },
  {
    year: -1000,
    kicker: 'Cities & Trade',
    title: 'The rise of the food maker',
    body: 'Trade and cities widen the pantry. Specialist bakers, brewers, and cheesemakers supply growing urban populations with traditionally processed foods.',
    eating: 'Bread, olive oil, wine, cheese, salted fish, garden vegetables',
    prepared: 'Bakeries, presses, amphora storage, pickling and curing',
    sourceIds: ['pliny-nh-18-28', 'tyers-1996-dressel20', 'themudo-2025-garum'],
  },
  {
    year: 1500,
    kicker: 'The Columbian Exchange',
    title: 'The world on one plate',
    body: 'Potatoes, tomatoes, and maize cross oceans and reshape diets everywhere — adapted with the same time-honored preservation techniques.',
    eating: 'Bread, pottage, salted meat, plus new potatoes, maize, tomatoes',
    prepared: 'Windmill flour, hearth and oven cooking, salting, smoking, pickling',
    sourceIds: ['nunn-qian-2010', 'wikipedia-windmill'],
  },
  {
    year: 1800,
    kicker: 'The Industrial Revolution',
    title: 'The first factory food',
    body: 'Canning is invented — sealed jars in 1809, the tin canister in 1810 — and factories begin making food at scale. Modern processing has begun — and the graph starts to shift.',
    eating: 'Bread, potatoes, salt pork, tea and sugar, the first tinned food',
    prepared: 'Canning and milling at factory scale alongside home cooking',
    sourceIds: ['nal-canning-timeline'],
  },
  {
    year: 1900,
    kicker: 'Mass Production',
    title: 'Additives, sugar, seed oils',
    body: 'Synthetic dyes and chemical preservatives are common enough to prompt the 1906 Pure Food and Drugs Act, roller mills turn out white flour, and sugar keeps climbing. In 1911 hydrogenated cottonseed oil reaches grocery shelves — industrially refined seed oils enter the mass market.',
    eating: 'White flour, refined sugar, tinned goods, margarine, shortening',
    prepared: 'Roller milling, hydrogenation, chemical preservatives',
    sourceIds: ['fda-1906-act', 'mnhs-flour-milling', 'aocs-hydrogenation', 'blasbalg-2011-omega'],
    climax: true,
  },
  {
    year: 1950,
    kicker: 'The Convenience Era',
    title: 'The golden age of processing',
    body: 'TV dinners, shelf-stable products, and fast food sweep the world. Traditional processing all but vanishes from the home kitchen.',
    eating: 'TV dinners, soda, breakfast cereal, burgers and fries',
    prepared: 'Deep-frying in seed oils, freezing, extrusion, additives',
    sourceIds: ['blasbalg-2011-omega', 'ers-eib3-2005', 'ers-eib124-pesticides', 'naaa-ag-aviation-history'],
    climax: true,
  },
  {
    year: 2000,
    kicker: 'Ultra-Processed',
    title: 'Peak processed food',
    body: 'Ultra-processed products with dozens of engineered ingredients dominate the supermarket. In a geological blink, the human diet has been rewritten.',
    eating: 'Packaged snacks, sweetened drinks, fast food, ready meals',
    prepared: 'Industrial formulation: refined starches, seed oils, emulsifiers, flavourings',
    sourceIds: ['martinez-steele-2016-upf', 'juul-2022-upf-trend', 'monteiro-2019-nova', 'epa-ap42-9-11-1'],
    climax: true,
  },
  {
    year: 2025,
    kicker: 'Today',
    title: 'A quiet reckoning',
    body: 'Interest in less-processed and fermented foods is growing, and the ultra-processed share of American calories has edged down in the latest CDC data — but it is still more than half. Where we go next is still being written.',
    eating: 'Ultra-processed staples beside a whole-food revival',
    prepared: 'Mostly factory-made — with sourdough, ferments and home cooking returning',
    sourceIds: ['cdc-nchs-db536-2025', 'ers-farming-farm-income', 'benbrook-2016-glyphosate'],
  },
];
