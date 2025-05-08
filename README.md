# 1-Pixel-Health: Human Diet Evolution Visualization

An interactive visualization showing 300,000 years of human dietary changes. Each pixel represents one year of history, revealing how our diet composition has dramatically shifted, especially in the last 150 years.

## Features
- Interactive timeline from 300,000 BCE to present
- Real-time diet composition breakdown with distinct traditional and modern food processing categories
- Historical context cards that appear as you scroll through time
- Evidence-based data with detailed information about each food category
- Responsive design that works on desktop and mobile devices

## Development Stack
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Recharts for data visualization
- GitHub Pages for deployment

## Building and Running

### Prerequisites
- Node.js (v16 or later)
- npm or yarn

### Development
```bash
# Clone the repository
git clone https://github.com/seanmun/1-pixel-health.git
cd 1-pixel-health

# Install dependencies
npm install

# Run development server
npm run dev
```

### Deployment
```bash
# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Project Structure
```
src/
├── components/
│   ├── Timeline.tsx         # Main timeline container with scroll handling
│   ├── DietVisualization.tsx# Area chart visualization of diet composition
│   ├── DietLegend.tsx       # Interactive legend with dropdown information
│   └── Popup.tsx            # Historical event popup component
├── utils/
│   └── dietUtils.ts         # Utility functions for diet calculations
├── data/
│   ├── dietPeriods.ts       # Diet composition data across historical periods
│   └── timelineEvents.ts    # Historical events and period descriptions
├── types/
│   └── index.ts             # TypeScript interfaces and types
└── App.tsx                  # Main application component
```

## Data Categories
The visualization tracks these food categories across human history:
- Animal foods (including meat, fish, eggs, dairy, and honey)
- Vegetables
- Fruits
- Nuts and seeds
- Grains
- Seed oils (industrial)
- Traditional processed foods (fermented, dried, etc.)
- Modern processed foods (industrial production)

## Contributing
We welcome contributions from researchers, nutritionists, and historians. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Data Sources
All dietary compositions are based on anthropological and historical research. Primary sources include:
- Archeological findings
- Anthropological studies
- Historical accounts
- Nutritional analysis of traditional diets
- Modern dietary surveys

## License
MIT License - see the LICENSE file for details.