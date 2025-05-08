const CATEGORIES = {
    animal: [
      'Meat (beef, lamb, poultry, pork)',
      'Fish & shellfish',
      'Eggs',
      'Dairy (milk, cheese, butter)',
      'Honey'
    ],
    vegetables: [
      'Leafy greens (kale, spinach)',
      'Root vegetables (carrots, beets)',
      'Stalks (celery, asparagus)',
      'Cruciferous (broccoli, cauliflower)'
    ],
    fruits: [
      'Berries',
      'Apples, oranges, bananas',
      'Melons',
      'Stone fruits (peaches, plums)'
    ],
    grains: [
      'Wheat, rice, corn',
      'Barley, millet, oats',
      'Bread, pasta, cereal'
    ],
    nuts: [
      'Almonds, walnuts, pecans',
      'Seeds (sunflower, chia, flax)',
      'Nut butters'
    ],
    seedOils: [
      'Canola oil',
      'Soybean oil',
      'Corn oil',
      'Cottonseed oil',
      'Vegetable blends'
    ],
    processedTraditional: [
      'Fermented foods (cheese, kefir, sauerkraut)',
      'Smoked meats and fish',
      'Naturally dried fruit or jerky',
      'Pickled vegetables using natural brine'
    ],
    processedModern: [
      'Ultra-processed snacks (chips, cookies, candy)',
      'Frozen dinners, shelf-stable meals',
      'Sugary cereals and energy bars',
      'Foods with artificial flavors, preservatives, emulsifiers'
    ]
  };
  
  const Categories = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dietary Categories Explained</h1>
      {Object.entries(CATEGORIES).map(([key, items]) => (
        <div key={key} className="mb-6">
          <h2 className="text-xl font-semibold capitalize mb-2">{key}</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {items.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
  
  export default Categories;
  