// === FILE: src/data/timelineEvents.ts ===
import { TimelineEvent } from '../types';

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: -300000,
    type: 'popup',
    content: {
      message: "Early Homo sapiens emerged in Africa around 300,000 years ago. They survived harsh climates with no permanent shelter, no energy, no hospitals, and constant threats from predators and rival groups. Their diet was primarily large game, with some gathered plants, fruits, and nuts."
    },
    sourceId: "homo-sapiens-diet"
  },
  {
    year: -280000,
    type: 'popup',
    content: {
      message: "Wooden spears became a crucial advancement in this era. These tools allowed humans to hunt large animals more effectively, reducing reliance on scavenging and increasing access to nutrient-dense animal foods."
    },
    sourceId: "wooden-spears"
  },
  {
    year: -250000,
    type: 'popup',
    content: {
      message: "The habitual use of fire became widespread. Cooking food improved nutrient absorption and digestion, protected against pathogens, and provided warmth and safety, allowing expansion into colder regions."
    },
    sourceId: "fire-usage"
  },
  {
    year: -200000,
    type: 'popup',
    content: {
      message: "Climate fluctuations between glacial and interglacial periods required constant mobility. Populations followed migrating herds and settled near seasonal water sources, living with extreme resource unpredictability."
    },
    sourceId: "climate-fluctuations"
  },
  {
    year: -100000,
    type: 'popup',
    content: {
      message: "Humans began showing signs of symbolic behavior: red ochre use, ornamentation, and early burial rituals. This suggests the development of culture, identity, and more complex social structures."
    },
    sourceId: "symbolic-behavior"
  },
  {
    year: -20000,
    type: 'popup',
    content: {
      message: "The peak of the Ice Age limited plant availability, forcing humans to depend more on large game animals for survival. Preservation techniques like freezing in cold climates became important survival strategies."
    }
  },
  {
    year: -10000,
    type: 'popup',
    content: {
      message: "As the Ice Age ended, warmer climates allowed for more plant diversity and the beginnings of primitive agriculture. Traditional food processing emerged with early fermentation, drying, and primitive bread-making from wild grains."
    }
  },
  {
    year: -5000,
    type: 'popup',
    content: {
      message: "Early farming civilizations emerged, increasing grain consumption while reducing the reliance on hunted animals. Traditional processing methods expanded to include beer brewing, cheese making, wine production, and more sophisticated bread-making."
    }
  },
  {
    year: -1000,
    type: 'popup',
    content: {
      message: "Trade networks and urbanization led to greater grain availability and more diverse traditional processing methods. Specialized food crafts emerged, with dedicated bakers, brewers, and cheese makers creating traditionally processed foods for urban populations."
    }
  },
  {
    year: 1500,
    type: 'popup',
    content: {
      message: "The Columbian Exchange introduced new crops like potatoes, tomatoes, and maize, diversifying diets. Traditional processing methods adapted to these new foods, creating new fermented, dried, and preserved foods, though all using time-honored techniques."
    }
  },
  {
    year: 1800,
    type: 'popup',
    content: {
      message: "The Agricultural and Industrial Revolutions expanded farming output and brought the first modern food processing. Commercial canning was invented, factories began producing foods at scale, and chemical additives started to appear, marking the beginning of modern processing."
    }
  },
  {
    year: 1900,
    type: 'popup',
    content: {
      message: "Industrialization introduced mass food production and early modern processing techniques. Chemical preservatives became common, refined sugar consumption increased dramatically, and the first artificial food colors and flavors appeared in processed foods."
    }
  },
  {
    year: 1950,
    type: 'popup',
    content: {
      message: "Post-war industrialization led to the golden age of modern food processing. TV dinners, shelf-stable products, fast food, and highly processed convenience foods became widespread, while traditional processing declined in the home."
    }
  },
  {
    year: 2000,
    type: 'popup',
    content: {
      message: "Modern diets saw peak modern processed food consumption, with ultra-processed products dominating supermarkets. Foods with dozens of ingredients, many artificial, became the norm, while traditional processing methods were largely forgotten in many households."
    }
  },
  {
    year: 2025,
    type: 'popup',
    content: {
      message: "A growing health-conscious movement has sparked renewed interest in whole foods and traditional processing methods. Fermented foods, traditional bread-making, and other ancient processing techniques are being revived, even as modern ultra-processed foods remain common."
    }
  }
];


// Processing type descriptions - can be used in tooltips or information panels
export const PROCESSING_TYPES = {
  traditional: {
    title: "Traditional Processing",
    description: "Methods developed over thousands of years that use natural preservation and transformation techniques. These typically enhance nutrition and preserve foods without synthetic additives.",
    examples: [
      "Fermentation (cheese, yogurt, kefir, kombucha, sauerkraut)",
      "Drying and smoking (jerky, dried fruits, smoked fish)",
      "Natural pickling and curing",
      "Traditional sourdough bread making",
      "Brewing and wine-making"
    ]
  },
  modern: {
    title: "Modern Processing",
    description: "Industrial techniques developed since the 1800s that focus on mass production, shelf stability, uniformity, and convenience, often at the expense of nutritional value.",
    examples: [
      "Ultra-processed packaged foods",
      "Ready-to-eat meals with long shelf life",
      "Foods with artificial preservatives, colors, and flavors",
      "Mass-produced refined foods (white flour, refined sugar)",
      "Factory-made products with dozens of ingredients"
    ]
  }
};