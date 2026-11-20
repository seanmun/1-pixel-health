// src/data/vitals.ts
// Body, lifespan, infant and child mortality, energy and climate curves that drive the walkers and the HUD.
//
// Every series is keyed to sources listed in src/data/sources.ts (topics
// "lifespan", "body", "energy", "climate"). Values before about 1800 are
// reconstructions with wide error bars, and each series splices different
// populations (living foragers as a proxy for prehistory, European skeletons,
// England, then the United States). See the notes on the Method & Sources page.

type Keys = [year: number, value: number][];

const interpolate = (keys: Keys, year: number): number => {
  if (year <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (year <= keys[i][0]) {
      const [y0, v0] = keys[i - 1];
      const [y1, v1] = keys[i];
      return v0 + ((year - y0) / (y1 - y0)) * (v1 - v0);
    }
  }
  return keys[keys.length - 1][1];
};

/**
 * Life expectancy at birth — the MEAN age at death, dragged down by child deaths.
 * Foragers: Gurven & Kaplan 2007 (living 20th-century foragers as a proxy).
 * Early farmers / antiquity: Eshed 2004, Scheidel 2007 (conventional 20–30).
 * ~1540: England (Our World in Data). 1800–1850: US white population (Hacker 2010).
 * 1900 on: US, CDC/NCHS life tables. Final point is 2024 data.
 */
const LIFE_EXPECTANCY: Keys = [
  [-300000, 31],
  [-10000, 31],
  [-5000, 25],
  [-1000, 24],
  [1500, 34],
  [1800, 41.6],
  [1850, 37],
  [1900, 47.3],
  [1950, 68.2],
  [2000, 76.8],
  [2022, 77.5],
  [2025, 79],
];

/**
 * Median age at death — the age by which half of everyone born had died
 * (where a period life table's survivorship crosses 50%).
 * Before 1800 these are inferences from child-mortality rates (roughly half
 * died before 15: Volk & Atkinson 2013) and forager survivorship curves, not
 * measurements. 1800–1850 derived from Hacker 2010; 1900 on from NCHS tables.
 */
const MEDIAN_AGE_AT_DEATH: Keys = [
  [-300000, 24],
  [-10000, 24],
  [-5000, 15],
  [-1000, 10],
  [1500, 30],
  [1800, 46],
  [1850, 37],
  [1900, 58.3],
  [1950, 72.7],
  [2000, 80.3],
  [2022, 81.7],
  [2025, 81.7],
];

/**
 * Infant mortality — deaths before the first birthday per 1,000 live births.
 * Before 1500: the cross-cultural means of Volk & Atkinson 2013 (26.8% across
 * 15 forager societies, 26.9% across 42 historical ones; 27% for England
 * c. 1500). These are averages of scattered estimates, not a measured series,
 * so the line is held flat.
 * 1590–1812: England, legitimate births in 26 parishes (Wrigley et al. 1997,
 * as tabulated by Galley 2023). The step down after 1500 is a change of source.
 * 1850–1895: US white population, Haines's census-based estimates as printed
 * in Historical Statistics of the United States. These are contested:
 * McDevitt-Irwin & Irwin 2025 put the 1850–80 rate at 60–110.
 * 1915 on: US, all races, CDC/NCHS (birth-registration states only to 1932).
 */
const INFANT_MORTALITY: Keys = [
  [-300000, 268],
  [-10000, 268],
  [-3000, 269],
  [1500, 270],
  [1590, 171],
  [1612, 165],
  [1637, 153],
  [1662, 167],
  [1687, 185],
  [1712, 191],
  [1737, 191],
  [1762, 163],
  [1787, 157],
  [1812, 136],
  [1850, 217],
  [1860, 181],
  [1870, 176],
  [1880, 215],
  [1890, 151],
  [1895, 111],
  [1915, 99.9],
  [1920, 85.8],
  [1930, 64.6],
  [1940, 47],
  [1950, 29.2],
  [1960, 26],
  [1970, 20],
  [1980, 12.6],
  [1990, 9.2],
  [2000, 6.9],
  [2010, 6.1],
  [2020, 5.4],
  [2024, 5.5],
];

/**
 * Child mortality — per cent of those born alive who died before age 15.
 * Before 1500: the cross-cultural means of Volk & Atkinson 2013 (48.8% across
 * 17 forager societies, 46.2% across 24 historical ones), held flat.
 * 1575–1775: England, about 30% in each half-century (Wrigley et al. 1997 as
 * summarised by Clark 2007; rounded, and not checked against the original
 * tables). The step down after 1500 is a change of source.
 * 1850–1890: US white population, Haines 1994 model life tables.
 * 1901 on: US, all races, NCHS life tables (death-registration states only
 * until the 1920s). Each value is 100 minus the survivors to age 15.
 */
const CHILD_MORTALITY: Keys = [
  [-300000, 48.8],
  [-10000, 48.8],
  [1500, 46.2],
  [1575, 30],
  [1675, 32],
  [1775, 30],
  [1850, 33.2],
  [1860, 28.3],
  [1870, 27.1],
  [1880, 32.5],
  [1890, 24.4],
  [1901, 21],
  [1910, 18.5],
  [1920, 12.9],
  [1930, 9.6],
  [1940, 6.8],
  [1950, 4.1],
  [1960, 3.5],
  [1970, 2.7],
  [1980, 1.8],
  [1990, 1.4],
  [2000, 1],
  [2010, 0.85],
  [2020, 0.76],
  [2024, 0.8],
];

/**
 * How long those who survived childhood lived: 15 plus the life expectancy at
 * age 15 — the average age at death of everyone who reached 15.
 * Foragers: 52.7 (Gurven & Kaplan 2007, mean of five hunter-gatherer groups;
 * range 43.6–57.5). That is the mean; the single most common age of adult
 * death in the same study is 72. Held flat to 1500 for want of anything
 * better, then drawn straight to the first US figure: there is no comparable
 * number for 1500–1850 (England's records give life expectancy at 20 or 25,
 * about 53 at age 20, which fits the line).
 * 1850–1890: US white population, Haines 1994. 1901 on: US, NCHS life tables.
 */
const ADULT_AGE_AT_DEATH: Keys = [
  [-300000, 52.7],
  [1500, 52.7],
  [1850, 58.2],
  [1860, 60.2],
  [1870, 61.4],
  [1880, 59.2],
  [1890, 61.2],
  [1901, 61.8],
  [1910, 62.7],
  [1920, 64.4],
  [1930, 65.3],
  [1940, 68.1],
  [1950, 70.9],
  [1960, 72.3],
  [1970, 72.7],
  [1980, 75.2],
  [1990, 76.4],
  [2000, 77.6],
  [2010, 79.3],
  [2020, 77.6],
  [2024, 79.6],
];

/**
 * Average adult male stature, cm.
 * Before 1800: European skeletal estimates (Will 2017 for early H. sapiens;
 * Hermanussen 2003; Marciniak 2022; Koepke & Baten 2005; Steckel 2004).
 * From 1800: US men — military records (Steckel), then measured CDC surveys.
 * The step at 1700→1800 is a change of population (Europe → US), not growth.
 * Note the big drop falls around the glacial maximum, before farming.
 */
const HEIGHT_CM: Keys = [
  [-300000, 172],
  [-30000, 177],
  [-20000, 172],
  [-8000, 167],
  [-5000, 164.5],
  [-3000, 165.5],
  [-1000, 167],
  [1, 169],
  [1000, 172],
  [1700, 167.5],
  [1800, 172.5],
  [1900, 170.5],
  [1950, 173],
  [1980, 175.4],
  [2000, 176],
  [2025, 175.1],
];

/**
 * Average adult male body-mass index.
 * No BMI was measured before the 1860s: the flat early value is a proxy from
 * living foragers (Hadza men 20.3, Pontzer 2012) and skeletal mass estimates
 * (~21, Hermanussen 2003). 1865: Union Army soldiers (Costa & Steckel 1997).
 * 1961 on: measured US men, CDC/NCHS.
 */
const BMI: Keys = [
  [-300000, 21],
  [1800, 21],
  [1865, 22.8],
  [1900, 22.8],
  [1950, 24.5],
  [1961, 25.1],
  [1980, 25.6],
  [1991, 26.8],
  [2000, 27.8],
  [2016, 29.1],
  [2025, 29.4],
];

/**
 * Energy captured per person per year, kWh.
 * Through 1900: Ian Morris's "energy capture" for the Western core (food +
 * animal feed + fuel + materials), converted from kcal/day (× 0.4245).
 * From 1950: US primary energy consumption per capita (EIA Monthly Energy
 * Review Table 1.7; fuels + electricity, excludes food), converted from
 * million Btu (× 293.07). The two measures agree to within ~3% in 2000.
 * The US peak is 1978–79.
 */
const ENERGY_KWH: Keys = [
  [-300000, 1700],
  [-14000, 1700],
  [-10000, 2100],
  [-5000, 3400],
  [-3000, 5100],
  [1, 13200],
  [1000, 11000],
  [1500, 11500],
  [1700, 13600],
  [1800, 16100],
  [1900, 39100],
  [1950, 64500],
  [1979, 102600],
  [2000, 100500],
  [2025, 82600],
];

/** How glacial the climate is, 0 (interglacial) to 1 (glacial maximum). */
const ICE: Keys = [
  [-115000, 0],
  [-60000, 0.45],
  [-30000, 0.6],
  [-24000, 1],
  [-17000, 1],
  [-9700, 0],
];

export interface Vitals {
  lifeExpectancy: number;
  medianAgeAtDeath: number;
  /** Deaths before age 1 per 1,000 live births. */
  infantMortality: number;
  /** Per cent of live births who died before age 15. */
  childMortality: number;
  /** Average age at death of those who reached 15. */
  adultAgeAtDeath: number;
  heightCm: number;
  bmi: number;
  weightKg: number;
  energyKwh: number;
}

export const vitalsAt = (year: number): Vitals => {
  const heightCm = interpolate(HEIGHT_CM, year);
  const bmi = interpolate(BMI, year);
  return {
    lifeExpectancy: interpolate(LIFE_EXPECTANCY, year),
    medianAgeAtDeath: interpolate(MEDIAN_AGE_AT_DEATH, year),
    infantMortality: interpolate(INFANT_MORTALITY, year),
    childMortality: interpolate(CHILD_MORTALITY, year),
    adultAgeAtDeath: interpolate(ADULT_AGE_AT_DEATH, year),
    heightCm,
    bmi,
    weightKg: bmi * (heightCm / 100) ** 2,
    energyKwh: interpolate(ENERGY_KWH, year),
  };
};

export const iceAt = (year: number): number => interpolate(ICE, year);
