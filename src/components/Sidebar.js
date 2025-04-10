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

                {/* Conditionally render demographic data */}
                {stateData && (
                    <div className="state-demographics">
                        <h4>State Demographics</h4>

                        {/* Age & Sex Section */}
                        <div className="section">
                            <h5>Age & Sex</h5>
                            <p><strong>Female Percent:</strong> {stateData.age_sex.female_percent}%</p>
                            <p><strong>Over 65 Percent:</strong> {stateData.age_sex.over_65_percent}%</p>
                            <p><strong>Under 18 Percent:</strong> {stateData.age_sex.under_18_percent}%</p>
                            <p><strong>Under 5 Percent:</strong> {stateData.age_sex.under_5_percent}%</p>
                        </div>

                        {/* Economy Section */}
                        <div className="section">
                            <h5>Economy</h5>
                            <p><strong>Median Household Income:</strong> ${stateData.economy.median_household_income}</p>
                            <p><strong>Per Capita Income:</strong> ${stateData.economy.per_capita_income}</p>
                            <p><strong>Poverty Rate:</strong> {stateData.economy.poverty_rate}%</p>
                        </div>

                        {/* Housing Section */}
                        <div className="section">
                            <h5>Housing</h5>
                            <p><strong>Building Permits 2023:</strong> {stateData.housing.building_permits_2023}</p>
                            <p><strong>Median Gross Rent:</strong> ${stateData.housing.median_gross_rent}</p>
                            <p><strong>Median Value:</strong> ${stateData.housing.median_value}</p>
                            <p><strong>Owner Occupied Rate:</strong> {stateData.housing.owner_occupied_rate}%</p>
                        </div>

                        {/* Population Section */}
                        <div className="section">
                            <h5>Population</h5>
                            <p><strong>Census 2020:</strong> {stateData.population.census_2020}</p>
                            <p><strong>Estimates 2023:</strong> {stateData.population.estimates_2023}</p>
                            <p><strong>Percent Change (2020-2024):</strong> {stateData.population.percent_change_2020_2024}%</p>
                        </div>

                        {/* Race & Ethnicity Section */}
                        <div className="section">
                            <h5>Race & Ethnicity</h5>
                            <p><strong>White Percent:</strong> {stateData.race_ethnicity.white_percent}%</p>
                            <p><strong>Black Percent:</strong> {stateData.race_ethnicity.black_percent}%</p>
                            <p><strong>Asian Percent:</strong> {stateData.race_ethnicity.asian_percent}%</p>
                            <p><strong>Hispanic Percent:</strong> {stateData.race_ethnicity.hispanic_percent}%</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
