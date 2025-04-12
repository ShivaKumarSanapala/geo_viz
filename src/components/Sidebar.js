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
    const [selectedBoundary, setSelectedBoundary] = useState(null);

    const mockApi = async (boundaryType, query) => {
        //Mock API data
        const stateData = [
            { name: "Texas", geo_id: "48" },
            { name: "California", geo_id: "06" },
            { name: "New York", geo_id: "36" },
            { name: "Florida", geo_id: "12" },
            { name: "Michigan", geo_id: "26" },
        ];

        const countyData = [
            { name: "Los Angeles County", geo_id: "06037" },
            { name: "Cook County", geo_id: "17031" },
            { name: "Harris County", geo_id: "48201" },
            { name: "Miami-Dade County", geo_id: "12086" },
            { name: "Wayne County", geo_id: "26163" },
            { name: "Travis County", geo_id: "48453" },
        ];

        const data = boundaryType === 'states' ? stateData : countyData;

        const filtered = data.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase())
        );

        // Simulate API delay
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(filtered);
            }, 200); // 200ms delay
        });
    };

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
        const fetchBoundaries = async (searchQuery = '') => {
            if (selectedBoundaryType !== 'states' && selectedBoundaryType !== 'counties') {
                setAllBoundaries([]);
                setFilteredBoundaries([]);
                console.log("Boundary type not states or counties, cleared boundaries.");
                return;
            }

            try {
                const data = await mockApi(selectedBoundaryType, searchQuery);
                setAllBoundaries(data);
                setFilteredBoundaries(data);
                console.log("Boundaries fetched:", data);
            } catch (err) {
                console.error("Failed to fetch boundaries:", err);
            }
        };

        fetchBoundaries(); // Initial fetch
    }, [selectedBoundaryType]);

    const getSortedYears = (data) => {
        const demographics = data.demographics || [];
        return [...new Set(demographics.map(d => d.year))].sort((a, b) => a - b);
    };

    const renderDemographics = (title, data, selectedYear, setSelectedYear) => {
        // ... (renderDemographics function remains the same)
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
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder={`Search ${selectedBoundaryType}`}
                                value={searchTerm}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSearchTerm(value);
                                    mockApi(selectedBoundaryType, value)
                                        .then(data => {
                                            setFilteredBoundaries(data);
                                            console.log("Search results:", data);
                                        })
                                        .catch(err => console.error("Search error:", err));
                                }}
                                className="search-input"
                            />
                            {Array.isArray(filteredBoundaries) && searchTerm && (
                                <ul className="autocomplete-dropdown">
                                    {filteredBoundaries.slice(0, 10).map((item, idx) => (
                                        <li
                                            key={idx}
                                            onClick={() => {
                                                setSelectedBoundary(item);
                                                setSearchTerm('');
                                                setFilteredBoundaries([]);
                                                console.log("Selected:", item);
                                            }}
                                        >
                                            {item.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
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