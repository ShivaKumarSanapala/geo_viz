import React from 'react';
import '../css/Sidebar.css';

const Sidebar = ({ stateName }) => {
    return (
        <div className="sidebar">
            <div className="header">
                <h3>
                    <span className="visually-hidden">Mapbox</span>
                    <span className="title">Boundaries Explorer</span>
                    <small>v4</small>
                </h3>
            </div>

            <div className="controls">
                <fieldset className="select-fieldset">
                    <label>Region</label>
                    <div className="select-container" id="selectCountryContainer">
                        <select>
                            <option>USA</option>
                            <option>Canada</option>
                            <option>Mexico</option>
                        </select>
                    </div>
                </fieldset>

                <fieldset className="select-fieldset">
                    <label>Worldview</label>
                    <div className="select-container">
                        <select id="selectWorldview" className="select">
                            <option>Default</option>
                            <option>Satellite</option>
                            <option>Terrain</option>
                        </select>
                    </div>
                </fieldset>

                <fieldset className="select-fieldset">
                    <label>Layer</label>
                    <div className="select-container" id="selectLayerContainer">
                        <select>
                            <option>Roads</option>
                            <option>Buildings</option>
                            <option>Water Bodies</option>
                        </select>
                    </div>
                </fieldset>

                <div className="autocomplete" id="autocomplete">
                    <input type="text" placeholder="Search..." />
                </div>

                <div className="boundary-info">
                    <span id="boundaryCount">0 Boundaries</span>
                    <label className="switch-container">
                        <input type="checkbox" />
                        <span className="slider"></span>
                    </label>
                </div>

                {/* Display selected state name here */}
                {stateName && (
                    <div className="state-name">
                        <h4>Selected State: {stateName}</h4>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
