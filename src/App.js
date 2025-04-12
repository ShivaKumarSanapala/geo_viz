import React from 'react';
import MapComponent from "./components/MapComponent";
import Sidebar from "./components/Sidebar";
import './css/App.css';
import 'mapbox-gl/dist/mapbox-gl.css';

function App() {
    return (
        <div className="app-container">
            <Sidebar />
            <MapComponent />
        </div>
    );
}

export default App;
