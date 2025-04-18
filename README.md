
---

# 🌐 TSG Frontend

This is the React-based frontend for the **TSG Geo Analytics** platform.

## 🚀 Quick Start

### 1. Build the Docker Image

```bash
docker build -t tsg_frontend .
```

### 2. Run the Full Stack

Navigate to the backend repository and start all services:

```bash
cd ../tsg_geo_analytics
docker-compose up -d
```

---

## **Project Summary**

This app is a **React-based demographic data visualization tool** where users can:

- **Choose a geographic boundary type** (States or Counties)
- **Search for a specific boundary** (e.g., "California" or "Los Angeles County")
- **View demographic data** (population, rent, income, education) for selected years
- **Visualize this data dynamically**, in a map (via `setSelectedBoundaryGeometry`)

The sidebar works alongside a map component that displays visual boundaries for the selected regions.

---

## **Key Concepts & Technologies Involved**

### 1. **React (Frontend Framework)**
This app uses **React**, a JavaScript library for building user interfaces.

#### Key React Concepts:
- **Components**: Independent, reusable UI pieces like `<Sidebar />`.
- **Props**: External data passed into components (e.g., `stateData`, `setSelectedBoundaryGeometry`).
- **State (`useState`)**: Manages local component data like the selected year or search term.
- **Effects (`useEffect`)**: Executes side-effects (e.g., setting default years) when data changes.
- **Conditional Rendering**: Renders content only if data is available (e.g., `if (stateData?.state)`).

### 2. **Search with Autocomplete**
The user types into a search box, and suggestions are fetched via an API.

#### Concepts Involved:
- **Controlled Input**: The input value is tied to React state (`value={searchTerm}`).
- **Fetching Data**: `fetch()` hits an API endpoint dynamically based on user input.
- **Filtering and Display**: A dropdown of results is displayed, filtered by the search term.

### 3. **Demographic Data Display**
This app displays dynamic data (e.g., population, rent, etc.) based on the selected year and location.

#### Concepts:
- **Range Input (`type="range"`)**: A slider that lets the user choose a year.
- **Dynamic Rendering**: The table updates based on the selected year’s data.
- **Expandable Panels**: County and State data sections are collapsible using `isExpanded` flags.

### 4. **Environment Variables**
```js
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5001';
```
The app uses `.env` variables for configuration, which allows flexibility between different environments (e.g., development, staging, production).

### 5. **Map Interaction**
The app uses:
```js
setSelectedBoundaryGeometry(boundary.geometry);
```
This likely sends boundary geometry data (probably GeoJSON or TopoJSON) to a **Map component**, which highlights or zooms into the selected region.

### 6. **CSS Styling**
The styles are in a separate file: `Sidebar.css`.

Practices used in the app:
- Semantic HTML for better accessibility and readability
- Class names for custom styling
- Responsive sections (e.g., collapsible panels, sliders)

---

## **Data Flow (High-Level Diagram)**

```text
User Selects Boundary Type → Search API Fetch → User Clicks Result
   ↓                                             ↓
Sidebar Updates Selected Boundary        Map Component Updates Geometry
   ↓
Demographics Data Displayed by Year
```

---

## **Tech Stack Summary**

| Feature              | Tool/Concept              |
|----------------------|---------------------------|
| UI Framework         | React                     |
| State Management     | `useState` / `useEffect`  |
| Styling              | Plain CSS (`Sidebar.css`) |
| API Integration      | `fetch()`                 |
| Search               | Autocomplete w/ dropdown  |
| Data Visualization   | Range input + tables      |
| Environment Config   | `.env` + `REACT_APP_...`  |
| Map (likely)         | GeoJSON, Mapbox           |

---
