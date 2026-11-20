// src/data/objects.ts
// Asset manifest for the walking world. Every model the scene needs, with the
// size it should be built at. The procedural low-poly placeholders live in
// src/components/journey/world/scenery.ts and figure.ts; a finished model for
// an entry is delivered as public/models/<id>.glb and replaces its placeholder
// (the walkers as public/models/walkers/<who>-<outfit>.glb).

export type ObjectCategory =
  | 'people'
  | 'carried'
  | 'animals'
  | 'plants'
  | 'food'
  | 'shelter'
  | 'farms'
  | 'industry'
  | 'machines'
  | 'energy';

/** done = finished model in the scene; placeholder = low-poly stand-in; wishlist = not in the scene yet. */
export type ObjectStatus = 'done' | 'placeholder' | 'wishlist';

export interface WorldObject {
  id: string;
  name: string;
  category: ObjectCategory;
  /** When it appears along the walk. */
  era: string;
  /** Real-world size to model at, in metres (length × width × height unless stated). */
  size: string;
  /** What it should look like / what matters about it. */
  notes: string;
  /** Variants needed of the same model. */
  variants?: string[];
  status: ObjectStatus;
}

export const OBJECT_CATEGORIES: { id: ObjectCategory; label: string; blurb: string }[] = [
  { id: 'people', label: 'People', blurb: 'The three walkers. These need a skeleton and a walk cycle, and their bodies change with the data.' },
  { id: 'carried', label: 'Carried & worn', blurb: 'Held in the right hand or worn; swapped by era.' },
  { id: 'animals', label: 'Animals', blurb: 'Wild game, then livestock. Standing poses are enough; a grazing or walking loop is a bonus.' },
  { id: 'plants', label: 'Plants & terrain', blurb: 'Scattered by the hundred, so keep these light. Snowy variants are used through the ice age.' },
  { id: 'food', label: 'Food & preparation', blurb: 'The roadside props that show what was eaten and how it was prepared.' },
  { id: 'shelter', label: 'Shelter & towns', blurb: 'From hide tents to stone cities.' },
  { id: 'farms', label: 'Farms & fields', blurb: 'Hand-worked plots growing into continuous monocrop.' },
  { id: 'industry', label: 'Industry & retail', blurb: 'Factories, refineries and the places modern food is sold.' },
  { id: 'machines', label: 'Machines', blurb: 'Farm and road machinery.' },
  { id: 'energy', label: 'Energy', blurb: 'How energy is captured in each era.' },
];

export const WORLD_OBJECTS: WorldObject[] = [
  // ---- People --------------------------------------------------------------
  {
    id: 'walker-man',
    name: 'Man',
    category: 'people',
    era: 'Whole journey',
    size: '1.75 tall (scaled 1.65–1.77 by era)',
    notes: 'Rigged humanoid with a walk cycle. One rigged model per outfit (public/models/walkers/man-1…6.glb); weight follows the data by widening the waist in-engine. Carries the era\'s tool in the right hand.',
    variants: ['Hides (300k BCE)', 'Sewn furs (ice age)', 'Woven tunic & sandals (first farmers)', 'Dyed wool tunic & trousers (antiquity–1700s)', 'Dark coat & hat (1800–1940)', 'T-shirt, jeans, sneakers (1955–today)'],
    status: 'done',
  },
  {
    id: 'walker-woman',
    name: 'Woman',
    category: 'people',
    era: 'Whole journey',
    size: '1.63 tall (scaled by era)',
    notes: 'Same rig and walk cycle as the man (walkers/woman-1…6.glb).',
    variants: ['Same six era outfits as the man'],
    status: 'done',
  },
  {
    id: 'walker-child',
    name: 'Child',
    category: 'people',
    era: 'Whole journey',
    size: '1.10 tall',
    notes: 'About 7 years old. Same rig (walkers/child-1…6.glb).',
    variants: ['Same six era outfits'],
    status: 'done',
  },

  // ---- Carried & worn --------------------------------------------------------
  { id: 'spear', name: 'Wooden spear', category: 'carried', era: '300k BCE – 9,000 BCE', size: '2.1 long', notes: 'Straight wooden shaft; fire-hardened point early, hafted stone point later.', variants: ['Wooden point', 'Stone point'], status: 'done' },
  { id: 'hoe', name: 'Hoe / digging stick', category: 'carried', era: '9,000 BCE – 1800', size: '1.6 long', notes: 'Wooden handle; stone blade early, iron blade later.', variants: ['Stone blade', 'Iron blade'], status: 'done' },
  { id: 'soda-cup', name: 'Soda cup with straw', category: 'carried', era: '1955 – today', size: '0.20 tall', notes: 'Unbranded fast-food cup, lid and straw.', status: 'done' },
  { id: 'hat', name: 'Hat', category: 'carried', era: '1800 – 1940', size: '0.40 brim', notes: 'Dark felt hat, worn by the adults.', status: 'done' },

  // ---- Animals ---------------------------------------------------------------
  { id: 'antelope', name: 'Antelope', category: 'animals', era: '300k BCE – 115,000 BCE', size: '1.3 long, 0.9 at shoulder', notes: 'African savanna game.', status: 'done' },
  { id: 'mammoth', name: 'Woolly mammoth', category: 'animals', era: 'Ice age (≈115,000 – 10,000 BCE)', size: '5.0 long, 3.0 at shoulder', notes: 'Shaggy coat, curved tusks, domed head. Appears alone and as a herd of three at the glacial maximum.', variants: ['Adult', 'Calf'], status: 'done' },
  { id: 'sheep', name: 'Sheep', category: 'animals', era: '8,000 BCE – 1800', size: '1.0 long, 0.7 at shoulder', notes: 'Early domesticate; woolly, dark face.', status: 'done' },
  { id: 'cow', name: 'Cow', category: 'animals', era: '5,000 BCE – 1900', size: '2.2 long, 1.4 at shoulder', notes: 'Village and farm cattle.', variants: ['Pale', 'Brown'], status: 'done' },
  { id: 'reindeer', name: 'Reindeer', category: 'animals', era: 'Ice age', size: '1.8 long, 1.1 at shoulder', notes: 'Principal ice-age game alongside mammoth.', status: 'done' },
  { id: 'bison', name: 'Bison / aurochs', category: 'animals', era: '300k BCE – 5,000 BCE', size: '2.8 long, 1.8 at shoulder', notes: 'Large game for the earliest camps.', status: 'done' },
  { id: 'goat', name: 'Goat', category: 'animals', era: '9,000 BCE – 1800', size: '1.0 long, 0.7 at shoulder', notes: 'Among the first domesticated animals.', status: 'done' },
  { id: 'ox-plough', name: 'Ox with plough', category: 'animals', era: '4,000 BCE – 1850', size: '4.0 long including plough', notes: 'Draft power before the tractor — the energy step between muscle and machine.', status: 'done' },

  // ---- Plants & terrain --------------------------------------------------------
  { id: 'acacia', name: 'Acacia tree', category: 'plants', era: '300k BCE – 30,000 BCE', size: '3–4 tall, 3–4.5 canopy', notes: 'Flat-topped savanna tree. 2–3 shape variants.', status: 'done' },
  { id: 'pine', name: 'Pine / spruce', category: 'plants', era: 'Ice age', size: '4–5 tall', notes: 'Conifer for the cold periods.', variants: ['Bare', 'Snow-laden'], status: 'done' },
  { id: 'broadleaf-tree', name: 'Broadleaf tree', category: 'plants', era: '9,700 BCE – today', size: '4–5.5 tall', notes: 'Oak-like temperate tree. 2–3 shape variants.', status: 'done' },
  { id: 'berry-bush', name: 'Berry bush', category: 'plants', era: '300k BCE – 30,000 BCE', size: '1.3 wide, 1.1 tall', notes: 'Visible red berries — gathered food.', status: 'done' },
  { id: 'grass-tuft', name: 'Grass tuft', category: 'plants', era: '300k BCE – 1900', size: '0.6 tall', notes: 'Very light; scattered in large numbers.', status: 'done' },
  { id: 'rock', name: 'Rock / boulder', category: 'plants', era: 'Whole journey', size: '0.5 – 3 across', notes: '3 shape variants.', variants: ['Bare', 'Snow-capped'], status: 'done' },
  { id: 'glacier', name: 'Glacier front', category: 'plants', era: 'Ice age', size: '12.8 wide, 7 tall', notes: 'Blue-white ice wall for the far background.', status: 'done' },
  { id: 'mountain', name: 'Mountain', category: 'plants', era: 'Whole journey (backdrop)', size: '40–60 wide, 18–36 tall', notes: 'Distant backdrop only; low detail.', variants: ['Bare', 'Snow-capped'], status: 'done' },

  // ---- Food & preparation --------------------------------------------------------
  { id: 'campfire', name: 'Campfire', category: 'food', era: '300k BCE – 10,000 BCE', size: '1.3 across', notes: 'Stone ring and logs. Flame and smoke are added in-engine.', status: 'done' },
  { id: 'spit-roast', name: 'Spit with roasting meat', category: 'food', era: '300k BCE – 10,000 BCE', size: '2.2 wide, 1.3 tall', notes: 'Two forked posts, crossbar, haunch of meat. Sits over the campfire.', status: 'done' },
  { id: 'drying-rack', name: 'Meat & fish drying rack', category: 'food', era: '300k BCE – 10,000 BCE', size: '2.5 wide, 1.8 tall', notes: 'Strips of meat and fish air-drying on a pole frame — the oldest preservation method.', status: 'done' },
  { id: 'spear-rack', name: 'Leaning spears', category: 'food', era: '300k BCE – 10,000 BCE', size: '1.4 wide, 2.2 tall', notes: 'Stone-tipped spears stood in a lashed pole frame at camp.', status: 'done' },
  { id: 'clay-oven', name: 'Clay oven with bread', category: 'food', era: '10,000 BCE – 1500', size: '1.7 dome, table 1.3 wide', notes: 'Domed earthen oven, glowing mouth, a side table of flat loaves.', status: 'done' },
  { id: 'ferment-jars', name: 'Fermentation jars', category: 'food', era: '10,000 BCE – 1500', size: '0.5 – 0.9 tall', notes: 'Sealed clay jars: beer, wine, pickles.', variants: ['Small', 'Large'], status: 'done' },
  { id: 'grain-sheaves', name: 'Grain sheaves', category: 'food', era: '10,000 BCE – 1800', size: '0.5 wide, 1.0 tall', notes: 'Bundled cut wheat or barley.', status: 'done' },
  { id: 'market-stall', name: 'Market stall', category: 'food', era: '1,000 BCE – 1700', size: '2.4 wide, 1.6 deep, 1.8 tall', notes: 'Awning over a counter with cheese wheels and bread; amphorae of oil and wine beside it.', variants: ['Red awning', 'Blue awning', 'Ochre awning'], status: 'done' },
  { id: 'tin-cans', name: 'Stacked tins', category: 'food', era: '1800 – 1930', size: 'Each tin 0.45 across, 0.5 tall', notes: 'Pyramid of six plain early tin cans outside the cannery.', status: 'done' },
  { id: 'quern', name: 'Grinding stone (quern)', category: 'food', era: '12,000 BCE – 1000 BCE', size: '0.6 long', notes: 'Saddle quern with handstone — stone-ground flour.', status: 'done' },
  { id: 'smokehouse', name: 'Smoking rack / smokehouse', category: 'food', era: 'Ice age – 1800', size: '2 × 2 × 2.5', notes: 'Smoked fish and meat.', status: 'done' },
  { id: 'olive-press', name: 'Olive / wine press', category: 'food', era: '1,000 BCE – 1500', size: '2.5 wide, 2.5 tall', notes: 'Traditional pressed oil — a contrast with the solvent-extracted seed oils later.', status: 'done' },

  // ---- Shelter & towns ---------------------------------------------------------------
  { id: 'hide-tent', name: 'Hide tent', category: 'shelter', era: '300k BCE – 10,000 BCE', size: '2.9 across, 2.4 tall', notes: 'Conical pole-and-hide shelter with a dark doorway.', variants: ['Hide', 'Fur (ice age)'], status: 'done' },
  { id: 'mud-hut', name: 'Round mud hut', category: 'shelter', era: '10,000 BCE – 3,000 BCE', size: '2.6 across, 3.0 tall', notes: 'Wattle-and-daub wall, conical thatch roof.', status: 'done' },
  { id: 'village-house', name: 'Village house', category: 'shelter', era: '5,000 BCE – 1800', size: '2.8 × 2.6 × 3.2', notes: 'Plastered walls, pitched roof.', variants: ['Thatch roof', 'Tile roof'], status: 'done' },
  { id: 'granary', name: 'Granary', category: 'shelter', era: '5,000 BCE – 1000 BCE', size: '2.0 across, 3.7 tall', notes: 'Round raised grain store.', status: 'done' },
  { id: 'stone-hall', name: 'Columned stone hall', category: 'shelter', era: '3,000 BCE – 1500', size: '6.4 × 4.4 × 4.2', notes: 'Temple or civic building with a five-column front.', status: 'done' },
  { id: 'city-block', name: 'Stone town houses', category: 'shelter', era: '1,000 BCE – 500', size: 'Row of three, each 2.1 × 2.6 × 2–4', notes: 'Flat-roofed masonry houses.', status: 'done' },
  { id: 'barn', name: 'Barn / farmhouse', category: 'shelter', era: '1650 – today', size: '5 × 4 × 4.2', notes: 'Red timber barn, dark roof.', status: 'done' },
  { id: 'skyscraper', name: 'City tower', category: 'shelter', era: '1925 – today (far background)', size: '4–7 square, 6–36 tall', notes: 'Distant skyline; lit windows. 3–4 variants of increasing height.', status: 'done' },

  // ---- Farms & fields -----------------------------------------------------------------
  { id: 'field-plot', name: 'Hand-worked field plot', category: 'farms', era: '10,000 BCE – 1800', size: '3–7 long, 2.5–4 deep', notes: 'Small plot with visible rows. Built from a short crop-row model (public/models/wheat-row.glb, greens-row.glb) repeated along each furrow; distant rows use the flat-card version (-far).', variants: ['Wheat (gold)', 'Greens / legumes'], status: 'done' },
  { id: 'maize-field', name: 'Maize field', category: 'farms', era: '1650 – 1900', size: '7 × 3.4, plants 0.9–2 tall', notes: 'New World crop after the Columbian Exchange. Rows of public/models/maize-row.glb.', status: 'done' },
  { id: 'monocrop-field', name: 'Monocrop field block', category: 'farms', era: '1900 – today', size: '24 long × 11–44 deep (tiles end to end)', notes: 'Perfectly uniform rows to the horizon. Maize and soy row models by the road, flat-card versions (maize-row-far.glb, soy-row-far.glb) beyond.', variants: ['Corn', 'Soy'], status: 'done' },
  { id: 'fence', name: 'Field fence / dry-stone wall', category: 'farms', era: '5,000 BCE – 1900', size: '3 long sections', notes: 'Separates the small plots; disappears in the monocrop era.', status: 'done' },
  { id: 'grain-silo', name: 'Grain silo / elevator', category: 'farms', era: '1900 – today', size: '6 across, 20 tall', notes: 'Industrial-scale grain storage.', status: 'done' },

  // ---- Industry & retail ------------------------------------------------------------------
  { id: 'brick-factory', name: 'Brick factory / cannery', category: 'industry', era: '1800 – 1940', size: '10–14 × 6.5–8.6 × 4–5.5, chimneys 7.7–10.5 tall', notes: 'Sawtooth roof, lit windows, two brick chimneys. Smoke is added in-engine.', variants: ['8 m', '11 m'], status: 'done' },
  { id: 'seed-oil-refinery', name: 'Seed-oil refinery', category: 'industry', era: '1911 – today', size: 'Main hall 9 × 6 × 5.6; three tanks 3 across, 6.5 tall; stacks 10 and 12 tall', notes: 'Process hall, three storage tanks with a purple band, two striped stacks, roof vents, a pipe to a wastewater lagoon, purple oil drums out front. Vent vapour is added in-engine.', status: 'done' },
  { id: 'oil-drum', name: 'Oil drum', category: 'industry', era: '1911 – today', size: '0.7 across, 1.0 tall', notes: 'Purple (the site\'s seed-oil colour).', status: 'done' },
  { id: 'fast-food', name: 'Drive-through fast-food restaurant', category: 'industry', era: '1957 – today', size: '7.2 × 5.7 × 3.4, sign pole 6.5 tall', notes: 'Unbranded: red box, yellow roof slab, lit window, tall glowing roadside sign.', status: 'done' },
  { id: 'supermarket', name: 'Supermarket with car park', category: 'industry', era: '1946 – today', size: '16 × 9.6 × 3.75, car park 16 × 6.5 (drawn in-engine)', notes: 'Unbranded: white box, blue fascia, glazed front.', status: 'done' },
  { id: 'car', name: 'Car', category: 'industry', era: '1946 – today', size: '4.2 × 1.8 × 1.4', notes: 'Generic sedan in five colours. 1950s and modern shapes.', variants: ['1950s', 'Modern'], status: 'done' },

  // ---- Machines ------------------------------------------------------------------------------
  { id: 'tractor', name: 'Tractor', category: 'machines', era: '1915 – today', size: '3.1 × 1.9 × 2.3', notes: 'Red mid-century farm tractor.', variants: ['1920s', 'Modern'], status: 'done' },
  { id: 'sprayer-rig', name: 'Boom sprayer', category: 'machines', era: '1950 – today', size: 'Boom 4.5–12 wide', notes: 'Yellow tank and folding spray boom towed behind the tractor. Spray mist is added in-engine.', status: 'done' },
  { id: 'crop-duster', name: 'Crop duster', category: 'machines', era: '1945 – today', size: '8 wingspan, 6 long', notes: 'Yellow single-engine agricultural aircraft. Spray trail is added in-engine.', status: 'done' },
  { id: 'combine', name: 'Combine harvester', category: 'machines', era: '1950 – today', size: '9 long, header 9 wide', notes: 'Scale cue for the giant fields.', status: 'done' },

  // ---- Energy ---------------------------------------------------------------------------------
  { id: 'windmill', name: 'Tower windmill', category: 'energy', era: '1185 – 1850', size: '3.5 base, 7 tall, sails 6.2 across', notes: 'Stone tower with a timber cap. The four sails are drawn in-engine and turn on the cap\'s axle.', status: 'done' },
  { id: 'coal-plant', name: 'Coal power station', category: 'energy', era: '1888 – today', size: 'Hall 8 × 5 × 4; stack 14 tall; two cooling towers 5 across, 8 tall', notes: 'Boiler hall, tall stack, two cooling towers, coal heap. Smoke and steam are added in-engine.', status: 'done' },
  { id: 'pylon', name: 'Transmission pylon', category: 'energy', era: '1890 – today', size: '3.4 wide, 9 tall, every 16 m', notes: 'Lattice tower. Wires are drawn in-engine between pylons.', status: 'placeholder' },
  { id: 'wind-turbine', name: 'Wind turbine', category: 'energy', era: '2004 – today', size: '12 tower, 10 rotor', notes: 'White tower and nacelle. The three blades are drawn in-engine and turn at the hub.', status: 'done' },
  { id: 'solar-array', name: 'Solar array', category: 'energy', era: '2010 – today', size: 'Row of four panels, 7.5 long', notes: 'Tilted ground-mount panels.', status: 'done' },
  { id: 'watermill', name: 'Watermill', category: 'energy', era: '0 – 1850', size: '5 × 4 × 5, wheel 3.5 across', notes: 'Water power for milling grain. Wheel as a separate turning part.', status: 'done' },
];

/** Things the engine draws itself — no model needed. */
export const ENGINE_EFFECTS = [
  'Sun and sky, including time-of-era colour and haze',
  'Snowfall and snow cover on the ground',
  'Fire, smoke and steam',
  'Crop spray mist and refinery vent vapour',
  'The diet road and its lanes',
  'Ground, fog and stars',
  'Power lines between pylons',
];
