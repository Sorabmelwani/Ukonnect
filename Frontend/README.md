# Frontend

A modern React TypeScript application for connecting UK professionals.

## Project Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

### Development

To start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

To build for production:
```bash
npm run build
```

### Preview Production Build

To preview the production build locally:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/        # Reusable React components
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── CTA.tsx
│   └── Footer.tsx
├── pages/            # Page components
│   └── LandingPage.tsx
├── styles/           # CSS stylesheets
│   ├── index.css
│   └── App.css
├── App.tsx           # Main app component
└── main.tsx          # Entry point
```

## Components

- **Header**: Navigation bar with logo and menu
- **Hero**: Main banner with call-to-action
- **Features**: Grid of feature cards
- **CTA**: Call-to-action section
- **Footer**: Footer with links and information

## Technologies

- React 18
- TypeScript
- Vite
- CSS3

## License

MIT
