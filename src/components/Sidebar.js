import React, { useState, useEffect } from 'react';
import '../css/Sidebar.css';

const Sidebar = ({ stateData, selectedBoundaryType, setSelectedBoundaryType }) => {
    const [selectedStateYear, setSelectedStateYear] = useState('');
    const [selectedCountyYear, setSelectedCountyYear] = useState('');
    const [isCountyExpanded, setIsCountyExpanded] = useState(true);
    const [isStateExpanded, setIsStateExpanded] = useState(true);

    const [allBoundaries, setAllBoundaries] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredBoundaries, setFilteredBoundaries] = useState([]);
    const [selectedBoundary, setSelectedBoundary] = useState('');

    useEffect(() => {
        if (stateData?.state?.demographics?.length > 0) {
            const years = [...new Set(stateData.state.demographics.map(d => d.year))].sort((a, b) => b - a);
            setSelectedStateYear(years[0]);
        }
        if (stateData?.county?.demographics?.length > 0) {
            const years = [...new Set(stateData.county.demographics.map(d => d.year))].sort((a, b) => b - a);
            setSelectedCountyYear(years[0]);
        }
    }, [stateData]);

    useEffect(() => {
        const loadGeoJson = async () => {
            const filePath = selectedBoundaryType === 'states'
                ? '/geo_data/states.geo.json'
                : '/geo_data/counties.geo.json';

            try {
                const res = await fetch(filePath);
                const geojson = await res.json();
                const names = geojson.features.map(f => f.properties.name);
                setAllBoundaries(names);
                setFilteredBoundaries(names);
            } catch (err) {
                console.error("Failed to load boundaries:", err);
            }
        };

        if (selectedBoundaryType === 'states' || selectedBoundaryType === 'counties') {
            loadGeoJson();
        } else {
            setAllBoundaries([]);
            setFilteredBoundaries([]);
        }
    }, [selectedBoundaryType]);

    const getSortedYears = (data) => {
        const demographics = data.demographics || [];
        return [...new Set(demographics.map(d => d.year))].sort((a, b) => a - b);
    };

    const renderDemographics = (title, data, selectedYear, setSelectedYear) => {
        const demographics = data.demographics || [];
        const sortedYears = getSortedYears(data);
        const yearData = demographics.find(d => d.year === Number(selectedYear));

        const isCounty = title.toLowerCase().includes('county');
        const isExpanded = isCounty ? isCountyExpanded : isStateExpanded;
        const setIsExpanded = isCounty ? setIsCountyExpanded : setIsStateExpanded;

        return (
            <div className="demographics-section">
                <div className="demographics-title clickable-header" onClick={() => setIsExpanded(!isExpanded)}>
                    <h5>{title} - {data.name}</h5>
                    <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
                </div>

                {isExpanded && (
                    <>
                        <div className="timeline-container">
                            <input
                                type="range"
                                min={sortedYears[0]}
                                max={sortedYears[sortedYears.length - 1]}
                                step={1}
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="timeline-slider"
                            />
                            <div className="timeline-year-marks">
                                {sortedYears.map((year) => (
                                    <span
                                        key={year}
                                        className={`year-mark ${year === Number(selectedYear) ? 'active' : ''}`}
                                    >
                                        {year}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {yearData ? (
                            <div className="demog-entry fade-in">
                                <table className="demog-table">
                                    <tbody>
                                    <tr><td>👥 Total Population</td><td><strong>{yearData.total_population}</strong></td></tr>
                                    <tr><td>👩 Female Population</td><td><strong>{yearData.female_population}</strong></td></tr>
                                    <tr><td>🏠 Median Rent</td><td><strong>${yearData.median_gross_rent_in_dollars}</strong></td></tr>
                                    <tr><td>💰 Household Income</td><td><strong>${yearData.median_household_income_past12months}</strong></td></tr>
                                    <tr><td>👨🎓 Bachelor's Degree (25+)</td><td><strong>{yearData.male_bachelors_degree_25yrs_above}</strong></td></tr>
                                    <tr><td>👩🎓 Bachelor's Degree (25+)</td><td><strong>{yearData.female_bachelors_degree_25yrs_above}</strong></td></tr>
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p><small>❗ No data available for the selected year.</small></p>
                        )}
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="sidebar">
            <div className="header">
                <h3>
                    <span className="title">🌐 Turl Street Group</span>
                    <small>v1</small>
                </h3>
            </div>

            <div className="controls">
                <fieldset className="select-fieldset">
                    <label>📍 Select Boundary Type</label>
                    <div className="select-container">
                        <select
                            value={selectedBoundaryType}
                            onChange={(e) => setSelectedBoundaryType(e.target.value)}
                        >
                            <option value="states">🗺️ States</option>
                            <option value="counties">🏞️ Counties</option>
                            <option value="regions">📌 Regions</option>
                        </select>
                    </div>
                </fieldset>

                {(selectedBoundaryType === 'states' || selectedBoundaryType === 'counties') && (
                    <fieldset className="select-fieldset">
                        <label>🔍 Search {selectedBoundaryType ? selectedBoundaryType.slice(0, -1) : ''}</label>
                        <input
                            type="text"
                            placeholder={`Search ${selectedBoundaryType}`}
                            value={searchTerm}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSearchTerm(value);

                                if (!allBoundaries || !Array.isArray(allBoundaries)) return;

                                setFilteredBoundaries(
                                    allBoundaries.filter(name =>
                                        typeof name === 'string' && name.toLowerCase().includes(value.toLowerCase())
                                    )
                                );
                            }}

                            className="search-input"
                        />
                        {Array.isArray(filteredBoundaries) && searchTerm && (
                            <ul className="autocomplete-dropdown">
                                {filteredBoundaries.slice(0, 10).map((name, idx) => (
                                    <li
                                        key={idx}
                                        onClick={() => {
                                            setSelectedBoundary(name);
                                            setSearchTerm('');
                                            setFilteredBoundaries([]);
                                            console.log("Selected:", name);
                                        }}
                                    >
                                        {name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </fieldset>
                )}

                {stateData?.state &&
                    renderDemographics("📈 State Demographics", stateData.state, selectedStateYear, setSelectedStateYear)
                }
                {stateData?.county &&
                    renderDemographics("📊 County Demographics", stateData.county, selectedCountyYear, setSelectedCountyYear)
                }
            </div>
        </div>
    );
};

export default Sidebar;
