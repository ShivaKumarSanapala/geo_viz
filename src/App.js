import React from 'react';
import MapComponent from "./components/MapComponent";
import Sidebar from "./components/Sidebar";
import './css/App.css'; // Import CSS for styling

function App() {
    return (
        <div className="app-container">
            {/*<MapView />*/}
            <Sidebar />
            <MapComponent />
        </div>
    );
}

export default App;
