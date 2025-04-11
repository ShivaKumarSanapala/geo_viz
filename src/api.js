const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5002'; // Default to localhost if not set

// Fetch demographics data
export const getDemographics = async (lat, lng) => {
    const url = `${BASE_URL}/demographics?lat=${lat}&lng=${lng}`;
    return await fetchData(url);
};

// Fetch nearby places data
export const getNearbyPlaces = async (lat, lng, radius, page = 1, limit = 30) => {
    const url = `${BASE_URL}/nearby-redis?lat=${lat}&lng=${lng}&radius=${radius}&page=${page}&limit=${limit}`;
    return await fetchData(url);
};

// Helper function to fetch data
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
