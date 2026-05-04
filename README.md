# Usage Dashboard App

A React application with TypeScript that provides usage analytics and data exploration features.

## Features

### Usage Dashboard Page
- **Graph 1**: Bar chart showing total application usage across 35 applications
- **Graph 2**: Line chart displaying usage trends over time with Excel export functionality
- **Graph 3**: Comparison chart for two selected applications
- Filters for date range and application types (Productivity, Communication, Development)

### Data Table and Search Page
- Search functionality for the first column with real-time filtering
- Interactive table with 6 columns
- Cascading dropdown dependencies (Column 2 → 3 → 4)
- Pagination and sorting capabilities

## Technologies Used
- React 18 with TypeScript
- Material-UI for UI components
- Chart.js for data visualization
- React Router for navigation
- XLSX for Excel export
- Vite for build tooling

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure
```
src/
├── pages/
│   ├── UsageDashboard.tsx
│   └── DataTableSearch.tsx
├── App.tsx
├── main.tsx
└── index.css
```

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Data
The application uses mock data for demonstration purposes. In a real-world scenario, this would be replaced with API calls to fetch actual usage data and table data.