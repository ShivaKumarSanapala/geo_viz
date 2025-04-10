import React from 'react';
import '../css/Sidebar.css';

const Sidebar = ({ stateName, stateData, selectedBoundaryType, setSelectedBoundaryType }) => {
    return (
        <div className="sidebar">
            <div className="header">
                <h3>
                    <span className="title">Turl Stree Group</span>
                    <small>v1</small>
                </h3>
            </div>

            <div className="controls">
                <fieldset className="select-fieldset">
                    <label>Boundary Type</label>
                    <div className="select-container">
                        <select value={selectedBoundaryType} onChange={(e) => setSelectedBoundaryType(e.target.value)}>
                            <option value="states">States</option>
                            <option value="counties">Counties</option>
                            <option value="regions">Regions</option>
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

                {/* Display selected state name */}
                {stateName && (
                    <div className="state-name">
                        <h4>Name: {stateName}</h4>
                    </div>
                )}

                {/* Conditionally render state demographics data */}
                {stateData && stateData.state && (
                    <div className="state-demographics">
                        <h4>State Demographics - {stateData.state.name}</h4>
                        {stateData.state.demographics.map((item, index) => (
                            <div key={index} className="demog-entry">
                                <p><strong>Year:</strong> {item.year}</p>
                                <p><strong>Total Population:</strong> {item.total_population}</p>
                                <p><strong>Female Population:</strong> {item.female_population}</p>
                                <p><strong>Median Gross Rent:</strong> ${item.median_gross_rent_in_dollars}</p>
                                <p><strong>Median Household Income:</strong> ${item.median_household_income_past12months}</p>
                                <p><strong>Male Bachelor's Degree (25+):</strong> {item.male_bachelors_degree_25yrs_above}</p>
                                <p><strong>Female Bachelor's Degree (25+):</strong> {item.female_bachelors_degree_25yrs_above}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Conditionally render county demographics data */}
                {stateData && stateData.county && (
                    <div className="county-demographics">
                        <h4>County Demographics - {stateData.county.name}</h4>
                        {stateData.county.demographics.map((item, index) => (
                            <div key={index} className="demog-entry">
                                <p><strong>Year:</strong> {item.year}</p>
                                <p><strong>Total Population:</strong> {item.total_population}</p>
                                <p><strong>Female Population:</strong> {item.female_population}</p>
                                <p><strong>Median Gross Rent:</strong> ${item.median_gross_rent_in_dollars}</p>
                                <p><strong>Median Household Income:</strong> ${item.median_household_income_past12months}</p>
                                <p><strong>Male Bachelor's Degree (25+):</strong> {item.male_bachelors_degree_25yrs_above}</p>
                                <p><strong>Female Bachelor's Degree (25+):</strong> {item.female_bachelors_degree_25yrs_above}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
