// === FILE: src/data/dietPeriods.ts ===
// Share of dietary energy by band, at the START of each period (each period
// eases into the next). These are a stylised model anchored to the cited
// evidence, not measurements:
//  - Foragers: animal foods ~45–65% of energy in recent foragers, about half
//    in warm climates and more in cold ones (Cordain 2000; Pontzer & Wood
//    2021). "Vegetables" includes starchy roots and tubers.
//  - Farmers: cereals become the staple once agriculture is established.
//  - 1900: vegetable oils + shortening ~2% of energy (Blasbalg 2011).
//  - 2000 on (US): the bands do not overlap. "seedOils" is all added plant
//    fats and oils (~20% of available calories, USDA 2010) wherever eaten;
//    "processedModern" is the rest of ultra-processed food. Together ~58%,
//    matching ultra-processed foods at ~55% of calories (CDC 2021–23) plus
//    oil used outside them. The whole-food bands are what is eaten
//    unprocessed or minimally processed (~30%, Martínez Steele 2016).
import { DietComposition, DietSource } from '../types';

export const DIET_PERIODS: {
  startYear: number;
  endYear: number;
  composition: DietComposition;
  sources?: DietSource[];
}[] = [
  {
    startYear: -300000,
    endYear: -50000,
    composition: {
      animal: 55,
      vegetables: 20,
      fruits: 12,
      grains: 5,
      nuts: 8,
      seedOils: 0,
      processedTraditional: 0,
      processedModern: 0
    },
    sources: [
      { id: 'cordain-2000-hg-ratios', note: 'Recent foragers: animal foods typically 45–65% of energy.', type: 'nutritional' },
      { id: 'pontzer-wood-2021', note: 'Diets were variable; about half plant in warm climates.', type: 'nutritional' },
      { id: 'ben-dor-2021-trophic', note: 'Case for a strongly carnivorous Pleistocene diet.', type: 'archaeological' },
      { id: 'wadley-2020-rhizomes', note: 'Cooked starchy plants 170,000 years ago.', type: 'archaeological' }
    ]
  },
  {
    startYear: -50000,
    endYear: -20000,
    composition: {
      animal: 55,
      vegetables: 20,
      fruits: 12,
      grains: 5,
      nuts: 8,
      seedOils: 0,
      processedTraditional: 0,
      processedModern: 0
    },
    sources: [
      { id: 'richards-trinkaus-2009', note: 'Early modern humans broadened their diet, adding fish.', type: 'archaeological' },
      { id: 'revedin-2010-flour', note: 'Plant grinding across Europe 30,000 years ago.', type: 'archaeological' }
    ]
  },
  {
    startYear: -20000,
    endYear: -10000,
    composition: {
      animal: 70,
      vegetables: 12,
      fruits: 6,
      grains: 5,
      nuts: 7,
      seedOils: 0,
      processedTraditional: 0,
      processedModern: 0
    },
    sources: [
      { id: 'clark-2009-lgm', note: 'Last Glacial Maximum 26,500–19,000 years ago.', type: 'historical' },
      { id: 'bocherens-2015-predmosti', note: 'Strong reliance on mammoth in ice-age Moravia.', type: 'archaeological' }
    ]
  },
  {
    startYear: -10000,
    endYear: -5000,
    composition: {
      animal: 50,
      vegetables: 15,
      fruits: 10,
      grains: 15,
      nuts: 5,
      seedOils: 0,
      processedTraditional: 5,
      processedModern: 0
    },
    sources: [
      { id: 'walker-2009-holocene', note: 'Holocene warming from 11,700 years ago.', type: 'historical' },
      { id: 'zeder-2011-agriculture', note: 'Farming emerges gradually from 11,500 years ago.', type: 'archaeological' },
      { id: 'arranz-otaegui-2018-bread', note: 'Bread from wild cereals 14,400 years ago.', type: 'archaeological' }
    ]
  },
  {
    startYear: -5000,
    endYear: -1000,
    composition: {
      animal: 30,
      vegetables: 15,
      fruits: 8,
      grains: 35,
      nuts: 4,
      seedOils: 0,
      processedTraditional: 8,
      processedModern: 0
    },
    sources: [
      { id: 'salque-2013-cheese', note: 'Cheese-making in the sixth millennium BC.', type: 'archaeological' },
      { id: 'mcgovern-2017-wine', note: 'Wine about 6000–5800 BC.', type: 'archaeological' },
      { id: 'bogaard-2013-manuring', note: 'Crops central to early farmer diets.', type: 'archaeological' }
    ]
  },
  {
    startYear: -1000,
    endYear: 1500,
    composition: {
      animal: 25,
      vegetables: 15,
      fruits: 8,
      grains: 40,
      nuts: 4,
      seedOils: 0,
      processedTraditional: 8,
      processedModern: 0
    },
    sources: [
      { id: 'tyers-1996-dressel20', note: 'Mass trade in olive oil.', type: 'archaeological' },
      { id: 'pliny-nh-18-28', note: 'Professional bakers in Rome.', type: 'historical' },
      { id: 'themudo-2025-garum', note: 'Industrial fish-salting.', type: 'archaeological' }
    ]
  },
  {
    startYear: 1500,
    endYear: 1800,
    composition: {
      animal: 25,
      vegetables: 15,
      fruits: 8,
      grains: 40,
      nuts: 3,
      seedOils: 0,
      processedTraditional: 9,
      processedModern: 0
    },
    sources: [
      { id: 'nunn-qian-2010', note: 'New World crops spread after 1492.', type: 'historical' }
    ]
  },
  {
    startYear: 1800,
    endYear: 1900,
    composition: {
      animal: 25,
      vegetables: 15,
      fruits: 8,
      grains: 38,
      nuts: 3,
      seedOils: 0,
      processedTraditional: 9,
      processedModern: 2
    },
    sources: [
      { id: 'nal-canning-timeline', note: 'Canning from 1809–1812.', type: 'historical' },
      { id: 'mnhs-flour-milling', note: 'Roller-milled flour from the 1870s.', type: 'historical' }
    ]
  },
  {
    startYear: 1900,
    endYear: 1950,
    composition: {
      animal: 28,
      vegetables: 10,
      fruits: 6,
      grains: 33,
      nuts: 2,
      seedOils: 2,
      processedTraditional: 9,
      processedModern: 10
    },
    sources: [
      { id: 'aocs-hydrogenation', note: 'Hydrogenated cottonseed oil on sale 1911.', type: 'historical' },
      { id: 'blasbalg-2011-omega', note: 'Vegetable oil and sugar availability from 1909.', type: 'nutritional' },
      { id: 'fda-1906-act', note: 'Additives prompt the 1906 Act.', type: 'historical' }
    ]
  },
  {
    startYear: 1950,
    endYear: 2000,
    composition: {
      animal: 26,
      vegetables: 7,
      fruits: 5,
      grains: 20,
      nuts: 2,
      seedOils: 8,
      processedTraditional: 9,
      processedModern: 23
    },
    sources: [
      { id: 'blasbalg-2011-omega', note: 'Soybean oil rises steeply after 1946.', type: 'nutritional' },
      { id: 'ers-eib3-2005', note: 'Mechanised, specialised farming.', type: 'historical' }
    ]
  },
  {
    startYear: 2000,
    endYear: 2025,
    composition: {
      animal: 16,
      vegetables: 4,
      fruits: 5,
      grains: 5,
      nuts: 3,
      seedOils: 20,
      processedTraditional: 9,
      processedModern: 38
    },
    sources: [
      { id: 'cdc-nchs-db536-2025', note: 'Ultra-processed foods 55% of US calories.', type: 'nutritional' },
      { id: 'juul-2022-upf-trend', note: 'Ultra-processed share 2001–2018.', type: 'nutritional' },
      { id: 'ers-rehkamp-2016-calories', note: 'US calories by food group.', type: 'nutritional' }
    ]
  }
];
