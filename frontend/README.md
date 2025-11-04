# Frontend - MindCare Predictor

Modern React + Vite frontend for mental health treatment prediction with beautiful UI components.

## Tech Stack

- **Vite** - Next-generation frontend tooling
- **React 18** - UI library
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality accessible components
- **Recharts** - Composable charting library
- **Lucide Icons** - Beautiful, consistent icon set
- **Axios** - Promise-based HTTP client

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui base components
│   │   ├── Layout.jsx      # Navigation & Layout
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── Home.jsx        # Landing page
│   │   ├── Predict.jsx     # Prediction form
│   │   └── Insights.jsx    # Analytics dashboard
│   ├── services/           # API services
│   │   └── api.js          # Axios API client
│   ├── styles/             # Global styles
│   │   └── globals.css     # TailwindCSS imports
│   ├── utils/              # Utility functions
│   │   └── cn.js           # className merger
│   ├── App.jsx             # Main app component with routing
│   └── main.jsx            # React entry point
├── public/                 # Static assets
├── index.html              # HTML template
├── tailwind.config.js      # TailwindCSS configuration
├── vite.config.js          # Vite configuration
└── package.json
```

## Setup & Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint (if configured)
npm run lint
```

## Features

### 📱 Modern UI
- Clean, intuitive interface built with TailwindCSS
- Responsive design for all screen sizes
- Dark mode ready with CSS variables
- Smooth animations and transitions

### 🎯 Prediction Page
- Interactive form with 23 input fields
- Real-time form validation
- Beautiful result display with:
  - Prediction confidence indicators
  - Probability gauges for treatment likelihood
  - Top contributing factors with directional indicators
  - Sticky result panel on desktop

### 📊 Insights Dashboard
- Model performance metrics (ROC-AUC, F1, CV scores)
- Feature importance bar chart
- Dataset statistics overview
- 12+ EDA visualizations from the backend
- Responsive chart layouts

### 🏠 Home Page
- Hero section with CTA buttons
- Feature highlights
- Model performance summary
- API health status indicator

### 🧭 Navigation
- Sticky navigation bar with logo
- Active page indicators
- Mobile-friendly menu
- Quick access to all pages

## API Integration

The frontend communicates with the FastAPI backend at `http://localhost:8000`:

- `GET /health` - Check API status
- `GET /` - API information
- `POST /predict` - Make predictions
- `GET /insights` - Get model metrics & feature importance
- `GET /charts` - List available charts
- `GET /charts/{filename}` - Serve chart images

## Component Structure

### Base Components (shadcn/ui style)
- `Button` - Customizable button with variants
- `Card` - Container component with header/footer support
- `Input` - Text input field with validation styles
- `Select` - Dropdown select field
- `Label` - Form label component

### Layout Components
- `Navbar` - Top navigation with active page highlighting
- `Layout` - Wrapper component with navbar and footer

### Page Components
- `Home` - Landing page with features overview
- `Predict` - Prediction form with result display
- `Insights` - Analytics dashboard with charts

## Styling

### TailwindCSS Configuration
- Custom color palette with CSS variables
- Extended animation keyframes (accordion, shimmer)
- Responsive breakpoints (sm, md, lg, etc.)
- Dark mode support via `.dark` class

### Color Scheme
- Primary: Neutral (dark gray/white)
- Accent: Red (#ef4444)
- Secondary: Light gray
- Success: Green
- Warning: Yellow/Orange
- Danger: Red

## Performance Optimization

- Lazy loading of chart images
- Memoization of heavy components
- Optimized Recharts renderings
- CSS variables for efficient theming

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### CORS Issues
If frontend can't connect to backend:
1. Ensure backend is running on `http://localhost:8000`
2. Check CORS configuration in backend `app/config.py`
3. Frontend URL should be in `CORS_ORIGINS` list

### Build Issues
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

## Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized build in `dist/` folder.

### Deploy to Static Hosting
- **Netlify**: Drag & drop `dist/` folder
- **Vercel**: Connect GitHub repo, auto-deploys on push
- **GitHub Pages**: Push `dist/` to `gh-pages` branch
- **AWS S3**: Upload to S3 bucket configured for static hosting

---

For backend documentation, see `../backend/README.md`

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
