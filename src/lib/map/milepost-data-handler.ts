import L from "leaflet";

const RAILROAD_API_URL =
	"https://data.transportation.gov/resource/ugux-y9xm.json?$limit=200000";

let railLines: milepostPoint[][] = [];
let dataLatLng: L.LatLng;
let centerPoint: L.Marker;

interface milepostPoint {
	lat: number;
	lon: number;
	latLng: L.LatLng;
	milepost: number;
	distanceToUser: number;
	data: any;
}

export async function updateCenterPoint(
	layerGroup: L.LayerGroup,
	targetLat: number,
	targetLon: number
): Promise<void> {
	try {
		const targetLatLng = L.latLng(targetLat, targetLon);

		// Reset center point
		if (centerPoint) layerGroup.removeLayer(centerPoint);

		// Plot Center Point
		plotMilepostPoint(
			{
				lat: targetLat,
				lon: targetLon,
				latLng: targetLatLng,
				milepost: -1,
				distanceToUser: 0,
				data: null,
			},
			layerGroup
		);
	} catch (error) {
		console.error("Error plotting center point:", error);
	}
}

export async function updateMilepostMarkers(
	layerGroup: L.LayerGroup,
	targetLat: number,
	targetLon: number,
	force: boolean = false,
	maxNearbyPoints: number = 1000,
	maxDistanceLimit: number = 10
): Promise<void> {
	try {
		const targetLatLng = L.latLng(targetLat, targetLon);

		if (
			force ||
			railLines.length <= 1 ||
			targetLatLng.distanceTo(dataLatLng) >= 8000
		) {
			railLines = await getMilepostData(
				targetLatLng,
				maxNearbyPoints,
				maxDistanceLimit
			);
		} else {
			for (const railLine of railLines) {
				for (const point of railLine) {
					point.distanceToUser = targetLatLng.distanceTo(point.latLng);
				}
			}
		}

		// Limit points per rail line to 2
		let nearbyRailLines: milepostPoint[][] = [];
		railLines.forEach((railLine, index) => {
			if (railLine.length >= 2) {
				nearbyRailLines.push(
					[...railLine]
						.sort((a, b) => a.distanceToUser - b.distanceToUser)
						.slice(0, 2)
				);
			}
		});

		// Reset layer
		layerGroup.clearLayers();

		// Plot Center Point
		plotMilepostPoint(
			{
				lat: targetLat,
				lon: targetLon,
				latLng: targetLatLng,
				milepost: -1,
				distanceToUser: 0,
				data: null,
			},
			layerGroup
		);

		// Plot Markers
		for (let i = nearbyRailLines.length - 1; i >= 0; i--) {
			const railLine = nearbyRailLines[i];

			if (railLine.length === 2) {
				const nearestPoint = getClosestPointOnLine(
					railLine[0],
					railLine[1],
					targetLatLng
				);

				if (nearestPoint != null) {
					plotMilepostPoint(nearestPoint, layerGroup);
				} else {
					nearbyRailLines.splice(i, 1);
				}
			}
		}

		drawPolylinesForRailLines(nearbyRailLines, layerGroup);
	} catch (error) {
		console.error("Error fetching or processing railroad data:", error);
	}
}

async function getMilepostData(
	targetLatLng: L.LatLng,
	maxNearbyPoints: number = 1000,
	maxDistanceLimit: number = 10
): Promise<milepostPoint[][]> {
	dataLatLng = targetLatLng;
	try {
		const response = await fetch(RAILROAD_API_URL);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const railroadData = await response.json();

		let nearbyPoints: milepostPoint[] = [];

		// Filter out extra points
		railroadData.forEach((point: any) => {
			if (
				point.lat &&
				point.long &&
				point.railroad &&
				point.milepost !== undefined
			) {
				const lat = parseFloat(point.lat);
				const lon = parseFloat(point.long);
				const milepost = parseFloat(point.milepost);

				const pointLatLng = L.latLng(lat, lon);
				const distanceToUser = targetLatLng.distanceTo(pointLatLng);

				if (distanceToUser <= maxDistanceLimit * 1609.34 && !isNaN(milepost)) {
					nearbyPoints.push({
						lat: lat,
						lon: lon,
						latLng: pointLatLng,
						milepost: milepost,
						distanceToUser: distanceToUser,
						data: point,
					});
				}
			}
		});

		// Limit Points
		if (nearbyPoints.length > maxNearbyPoints) {
			nearbyPoints.sort((a, b) => a.distanceToUser - b.distanceToUser);
			nearbyPoints = nearbyPoints.slice(0, maxNearbyPoints);
		}

		// Group by railroad
		const railroadGroups: {
			[railroadName: string]: milepostPoint[];
		} = {};

		nearbyPoints.forEach((item: milepostPoint) => {
			const point = item.data;
			const lat = parseFloat(point.lat);
			const lon = parseFloat(point.long);
			const railroadName = point.railroad || "Unknown Railroad";

			if (!railroadGroups[railroadName]) {
				railroadGroups[railroadName] = [];
			}
			railroadGroups[railroadName].push(item);
		});

		// Group by rail Line
		const railLineGroups: milepostPoint[][] = [];
		Object.values(railroadGroups).forEach((railroadGroup: milepostPoint[]) => {
			const lines = splitRailroadToRailLines(railroadGroup);
			railLineGroups.push(...lines);
		});

		return railLineGroups;
	} catch (error) {
		console.error("Error fetching or processing railroad data:", error);
		return [];
	}
}

function plotMilepostPoint(point: milepostPoint, layerGroup: L.LayerGroup) {
	const label = point.milepost === -1 ? "T" : point.milepost;
	let iconHtml;

	if (point.milepost !== -1) {
		iconHtml = `
		<div style="position: relative; display: inline-block; padding-left: 12px;">
			<div style="
				position: absolute;
				top: 0;
				left: 0;
				width: 8px;
				height: 8px;
				background: #0078ff;
				border-radius: 50%;
				box-shadow: 0 0 2px rgba(0,0,0,0.5);
				border: 2px solid white;
			"></div>
			<div style="
				background: #0078ff;
				color: white;
				font-size: 12px;
				font-weight: bold;
				border-radius: 100vw; /* pill shape */
				padding: 0px 4px;
				border: 2px solid white;
				box-shadow: 0 0 4px rgba(0,0,0,0.3);
				white-space: nowrap;
			">
			${label}
			</div>
		</div>
		`;
	} else {
		iconHtml = `
		<div style="
		position: absolute;
		width: 12px;
		height: 12px;
		background: #00ff77b5;
		border-radius: 50%;
		border: 2px solid white;
		box-shadow: 0 0 2px rgba(0,0,0,0.5);
		"></div>
		`;
	}

	const customIcon = L.divIcon({
		className: "",
		html: iconHtml,
	});

	const marker = L.marker([point.lat, point.lon], { icon: customIcon });

	const popupContent =
		point.milepost == -1
			? `<b>Target</b>`
			: `
        <b>Railroad:</b> ${point.data.railroad}<br>
        <b>Milepost:</b> ${
					Number.isFinite(point.milepost) ? point.milepost : "N/A"
				}<br>
        <b>State:</b> ${point.data.stateab || "N/A"}<br>
        <small>ID: ${point.data.objectid || "N/A"}</small>
    `;

	marker.bindPopup(popupContent);
	layerGroup.addLayer(marker);
	if (point.milepost == -1) centerPoint = marker;
}

function getClosestPointOnLine(
	linePoint1: milepostPoint,
	linePoint2: milepostPoint,
	anchorPoint: L.LatLng
): milepostPoint | null {
	// Get average latitude for conversion
	const avgLat = (linePoint1.lat + linePoint2.lat) / 2;

	// Approximate conversion to meters (more accurate for short distances)
	const latToMeters = 111320; // meters per degree latitude
	const lonToMeters = 111320 * Math.cos((avgLat * Math.PI) / 180); // meters per degree longitude

	// Convert to meters
	const x1 = linePoint1.lon * lonToMeters;
	const y1 = linePoint1.lat * latToMeters;
	const x2 = linePoint2.lon * lonToMeters;
	const y2 = linePoint2.lat * latToMeters;
	const x0 = anchorPoint.lng * lonToMeters;
	const y0 = anchorPoint.lat * latToMeters;

	const dx = x2 - x1;
	const dy = y2 - y1;

	const lenSq = dx * dx + dy * dy;
	if (lenSq === 0) {
		return { ...linePoint1 };
	}

	let t = ((x0 - x1) * dx + (y0 - y1) * dy) / lenSq;
	t = Math.max(0, Math.min(1, t));

	const closestX = (x1 + t * dx) / lonToMeters;
	const closestY = (y1 + t * dy) / latToMeters;

	const milepost =
		Math.round(
			(linePoint1.milepost * (1 - t) + linePoint2.milepost * t) * 100
		) / 100;

	const EPS = 1e-9;
	function nearlyEqual(a: number, b: number, epsilon = EPS) {
		return Math.abs(a - b) < epsilon;
	}

	if (
		(nearlyEqual(closestX, linePoint1.lon) &&
			nearlyEqual(closestY, linePoint1.lat)) ||
		(nearlyEqual(closestX, linePoint2.lon) &&
			nearlyEqual(closestY, linePoint2.lat))
	) {
		return null;
	}

	return {
		lat: closestY,
		lon: closestX,
		latLng: L.latLng(closestY, closestX),
		milepost: milepost,
		distanceToUser: linePoint1.distanceToUser,
		data: linePoint1.data,
	};
}

function splitRailroadToRailLines(
	points: milepostPoint[]
): Array<milepostPoint[]> {
	const railLines: Array<milepostPoint[]> = [];

	if (points.length === 0) {
		return railLines;
	}

	points.sort((a, b) => b.milepost - a.milepost);

	let loopCount = 0;
	let lastLength = Infinity;
	while (points.length > 0 && points.length != lastLength) {
		lastLength = points.length;

		let currentPoint = points[points.length - 1];

		if (railLines.length === 0) {
			railLines.push([currentPoint]);
		} else {
			const currentPointLatLng = L.latLng(currentPoint.lat, currentPoint.lon);

			let foundTarget = false;
			for (let railLine of railLines) {
				const lastLatLon = L.latLng(
					railLine[railLine.length - 1].lat,
					railLine[railLine.length - 1].lon
				);
				if (
					Math.abs(
						railLine[railLine.length - 1].milepost - currentPoint.milepost
					) <= 1 &&
					currentPointLatLng.distanceTo(lastLatLon) / 1609.34 <= 1.4
				) {
					railLine.push(currentPoint);
					foundTarget = true;
					break;
				}
			}
			if (!foundTarget) {
				railLines.push([currentPoint]);
			}
		}
		points.pop();

		loopCount++;
	}

	return railLines;
}

function drawPolylinesForRailLines(
	railLines: milepostPoint[][],
	layerGroup: L.LayerGroup
) {
	railLines.forEach((railLine) => {
		railLine.sort((a, b) => a.milepost - b.milepost);
		drawSinglePolylineSegment(railLine, layerGroup, "#0078ff");
	});
}

function drawSinglePolylineSegment(
	segmentPoints: milepostPoint[],
	layerGroup: L.LayerGroup,
	lineColor: string
) {
	const latlngs = segmentPoints.map((p) => L.latLng(p.lat, p.lon));

	if (latlngs.length > 1) {
		const polyline = L.polyline(latlngs, {
			color: lineColor,
			weight: 3,
			opacity: 0.7,
		});

		const firstPointData = segmentPoints[0].data;
		const lastPointData = segmentPoints[segmentPoints.length - 1].data;
		polyline.bindPopup(
			`Milepost Segment: ${
				Number.isFinite(firstPointData.milepost)
					? firstPointData.milepost
					: "N/A"
			} - ${
				Number.isFinite(lastPointData.milepost) ? lastPointData.milepost : "N/A"
			}
			`
		);

		layerGroup.addLayer(polyline);
	}
}
