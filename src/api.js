export const getStateDemographics = async (lat, lng) => {
    const url = `http://localhost:5001/demographics?lat=${lat}&lng=${lng}`;
    return await fetchData(url);
};

// Provided fetchData function for reference:
const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${url}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
};
