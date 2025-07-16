import L from 'leaflet';

const RAILROAD_API_URL = 'https://data.transportation.gov/resource/ugux-y9xm.json?$limit=200000';

/**
 * Represents a railroad point with its distance from a target location.
 */
interface RailroadPointWithDistance {
    data: any; // The original railroad data object
    distance: number; // Distance in meters from the target location
}

/**
 * Fetches railroad crossing data, finds the nearest points,
 * and adds markers to a Leaflet LayerGroup.
 * @param layerGroup The Leaflet LayerGroup to add the markers to.
 * @param targetLat The latitude of the location to measure distance from.
 * @param targetLon The longitude of the location to measure distance from.
 * @param numberOfNearestPoints The maximum number of nearest points to display (default: 100).
 */
export async function addNearestRailroadPointsToMap(
    layerGroup: L.LayerGroup,
    targetLat: number,
    targetLon: number,
    numberOfNearestPoints: number = 100
): Promise<void> {
    try {
        const response = await fetch(RAILROAD_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const railroadData = await response.json();

        const targetLatLng = L.latLng(targetLat, targetLon);

        const allPointsWithDistance: RailroadPointWithDistance[] = [];

        railroadData.forEach((point: any) => {
            if (point.lat && point.long) { // Only check for lat and long
                const lat = parseFloat(point.lat);
                const lon = parseFloat(point.long);

                const pointLatLng = L.latLng(lat, lon);
                const distance = targetLatLng.distanceTo(pointLatLng);

                allPointsWithDistance.push({ data: point, distance: distance });
            }
        });

        // Sort all points by distance and take the 'numberOfNearestPoints'
        allPointsWithDistance.sort((a, b) => a.distance - b.distance);
        const finalNearestPoints = allPointsWithDistance.slice(0, numberOfNearestPoints);

        layerGroup.clearLayers();

        finalNearestPoints.forEach((item: RailroadPointWithDistance) => {
            const point = item.data;
            const lat = parseFloat(point.lat);
            const lon = parseFloat(point.long);

            const marker = L.marker([lat, lon]);

            const popupContent = `
                <b>Railroad:</b> ${point.railroad || 'N/A'}<br>
                <b>Milepost:</b> ${point.milepost || 'N/A'}<br>
                <b>State:</b> ${point.stateab || 'N/A'}<br>
                <b>Distance:</b> ${item.distance.toLocaleString(undefined, { maximumFractionDigits: 0 })} meters<br>
                <small>ID: ${point.objectid || 'N/A'}</small>
            `;
            marker.bindPopup(popupContent);

            layerGroup.addLayer(marker);
        });

        console.log(`Loaded and displayed ${finalNearestPoints.length} nearest railroad points.`);
    } catch (error) {
        console.error('Error fetching or processing railroad data:', error);
    }
}