import { getDietColor, formatCategory } from '../utils/dietUtils';
import { DietComposition } from '../types';

const CATEGORIES: Record<keyof DietComposition, string[]> = {
  animal: [
    'Meat (beef, lamb, poultry, pork)',
    'Fish & shellfish',
    'Eggs',
    'Dairy (milk, cheese, butter)',
    'Honey',
  ],
  vegetables: [
    'Leafy greens (kale, spinach)',
    'Root vegetables (carrots, beets)',
    'Stalks (celery, asparagus)',
    'Cruciferous (broccoli, cauliflower)',
  ],
  fruits: ['Berries', 'Apples, oranges, bananas', 'Melons', 'Stone fruits (peaches, plums)'],
  nuts: ['Almonds, walnuts, pecans', 'Seeds (sunflower, chia, flax)', 'Nut butters'],
  grains: ['Wheat, rice, corn', 'Barley, millet, oats', 'Bread, pasta, cereal'],
  seedOils: ['Canola oil', 'Soybean oil', 'Corn oil', 'Cottonseed oil', 'Vegetable blends'],
  processedTraditional: [
    'Fermented foods (cheese, kefir, sauerkraut)',
    'Smoked meats and fish',
    'Naturally dried fruit or jerky',
    'Pickled vegetables using natural brine',
  ],
  processedModern: [
    'Ultra-processed snacks (chips, cookies, candy)',
    'Frozen dinners, shelf-stable meals',
    'Sugary cereals and energy bars',
    'Foods with artificial flavors, preservatives, emulsifiers',
  ],
};

const ORDER: (keyof DietComposition)[] = [
  'animal',
  'vegetables',
  'fruits',
  'nuts',
  'grains',
  'seedOils',
  'processedTraditional',
  'processedModern',
];

const Categories = () => (
  <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
    <h1 className="text-3xl font-extrabold md:text-4xl">Dietary Categories</h1>
    <p className="mt-2 max-w-2xl text-white/50">
      The eight food groups tracked across 300,000 years — from the foods that fed
      the first humans to the ones engineered in the last century.
    </p>
    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      {ORDER.map((key) => {
        const color = getDietColor(key);
        return (
          <div
            key={key}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
          >
            <div
              className="flex items-center gap-2 px-5 py-3"
              style={{ backgroundColor: `${color}1f`, borderBottom: `1px solid ${color}40` }}
            >
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
              <h2 className="font-semibold">{formatCategory(key)}</h2>
            </div>
            <ul className="space-y-1.5 px-5 py-4 text-sm text-white/70">
              {CATEGORIES[key].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-white/25">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  </div>
);

export default Categories;
