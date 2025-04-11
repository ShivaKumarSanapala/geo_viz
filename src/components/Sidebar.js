import React, { useState, useEffect } from 'react';
import '../css/Sidebar.css';

const Sidebar = ({ stateName, stateData, selectedBoundaryType, setSelectedBoundaryType }) => {
    const [selectedStateYear, setSelectedStateYear] = useState('');
    const [selectedCountyYear, setSelectedCountyYear] = useState('');

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

    const renderDemographics = (title, data, selectedYear, setSelectedYear) => {
        const demographics = data.demographics || [];
        const years = [...new Set(demographics.map(d => d.year))].sort((a, b) => b - a);
        const yearData = demographics.find(d => d.year === Number(selectedYear)); // ✅ Convert to number

        return (
            <div className="demographics-section">
                <h4>{title} - {data.name}</h4>
                <div className="select-container">
                    <label>📅 Select Year</label>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                {yearData ? (
                    <div className="demog-entry">
                        <p><small>👥 Total Population: {yearData.total_population}</small></p>
                        <p><small>👩 Female Population: {yearData.female_population}</small></p>
                        <p><small>🏠 Median Rent: ${yearData.median_gross_rent_in_dollars}</small></p>
                        <p><small>💰 Household Income: ${yearData.median_household_income_past12months}</small></p>
                        <p><small>👨🎓Bachelor's Degree (25+): {yearData.male_bachelors_degree_25yrs_above}</small></p>
                        <p><small>👩🎓Bachelor's  (25+): {yearData.female_bachelors_degree_25yrs_above}</small></p>
                    </div>
                ) : (
                    <p><small>❗ No data available for the selected year.</small></p>
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
                        <select value={selectedBoundaryType} onChange={(e) => setSelectedBoundaryType(e.target.value)}>
                            <option value="states">🗺️ States</option>
                            <option value="counties">🏞️ Counties</option>
                            <option value="regions">📌 Regions</option>
                        </select>
                    </div>
                </fieldset>

                {/*<div className="autocomplete" id="autocomplete">*/}
                {/*    <input type="text" placeholder="🔍 Search for a location..." />*/}
                {/*</div>*/}

                {/*<div className="boundary-info">*/}
                {/*    <span id="boundaryCount">📊 0 Boundaries</span>*/}
                {/*    <label className="switch-container" title="Toggle boundary visibility">*/}
                {/*        <input type="checkbox" />*/}
                {/*        <span className="slider"></span>*/}
                {/*    </label>*/}
                {/*</div>*/}

                {/*{stateName && (*/}
                {/*    <div className="state-name">*/}
                {/*        <h4>🗺️ Selected: <strong>{stateName}</strong></h4>*/}
                {/*    </div>*/}
                {/*)}*/}

                {stateData?.county &&
                    renderDemographics("📊 County Demographics", stateData.county, selectedCountyYear, setSelectedCountyYear)
                }

                {stateData?.state &&
                    renderDemographics("📈 State Demographics", stateData.state, selectedStateYear, setSelectedStateYear)
                }

            </div>
        </div>
    );
};

export default Sidebar;
