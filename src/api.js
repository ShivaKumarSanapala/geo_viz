const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${url}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
};

// Function to fetch demographic data by state
export const getStateDemographics = (stateName) => {
    const url = `http://127.0.0.1:5000/demographics?state=${stateName}`;
    return fetchData(url);
};

// You can easily add more endpoints here
// Example for another API endpoint
// export const getOtherData = () => {
//     const url = 'http://127.0.0.1:5000/other-endpoint';
//     return fetchData(url);
// };

