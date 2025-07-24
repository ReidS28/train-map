<script lang="ts">
	import { onMount } from "svelte";
	import L, { Map, Marker } from "leaflet";
	import "leaflet/dist/leaflet.css";

	import {
		leafletBaseLayers,
		leafletOverlayLayers,
		defaultBaseLayerId,
		defaultOverlayIds,
	} from "./layers";
	import { addMilepostPointsAndLines } from "./milepost-data-handler";

	let mapContainer: HTMLDivElement;
	let map: Map;

	delete (L.Icon.Default.prototype as any)._getIconUrl;
	L.Icon.Default.mergeOptions({
		iconRetinaUrl: new URL(
			"leaflet/dist/images/marker-icon-2x.png",
			import.meta.url
		).href,
		iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url)
			.href,
		shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url)
			.href,
	});

	async function loadLocateControl(): Promise<void> {
		(window as any).L = L;

		try {
			await import("leaflet.locatecontrol/dist/L.Control.Locate.min.css");
			await import("leaflet.locatecontrol");
			if ((L.control as any).locate) return;
		} catch (e) {
			console.warn("NPM import failed, loading LocateControl via CDN...", e);
		}

		return new Promise((resolve, reject) => {
			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href =
				"https://cdn.jsdelivr.net/npm/leaflet.locatecontrol@0.79.0/dist/L.Control.Locate.min.css";
			document.head.appendChild(link);

			const script = document.createElement("script");
			script.src =
				"https://cdn.jsdelivr.net/npm/leaflet.locatecontrol@0.79.0/dist/L.Control.Locate.min.js";
			script.onload = () => {
				if ((L.control as any).locate) {
					resolve();
				} else {
					reject(new Error("LocateControl failed to load from CDN"));
				}
			};
			script.onerror = () => reject(new Error("CDN script failed to load"));
			document.head.appendChild(script);
		});
	}

	const DEFAULT_TARGET_LAT = 0;
	const DEFAULT_TARGET_LON = 0;

	onMount(() => {
		let map: Map;

		const initMap = async () => {
			try {
				await loadLocateControl();

				map = L.map(mapContainer).setView([0, 0], 2);

				const initialBaseLayer = leafletBaseLayers[defaultBaseLayerId];
				if (initialBaseLayer) {
					initialBaseLayer.addTo(map);
				}

				defaultOverlayIds.forEach((id) => {
					const overlay = leafletOverlayLayers[id];
					if (overlay) {
						overlay.addTo(map);
					}
				});

				L.control
					.layers(leafletBaseLayers, leafletOverlayLayers, {
						position: "topright",
					})
					.addTo(map);

				(L.control as any)
					.locate({
						position: "topleft",
						strings: {
							title: "Show me where I am",
						},
						keepCurrentZoomLevel: true,
						clickBehavior: {
							inView: "setView",
							outOfView: "setView",
							inViewNotFollowing: "inView",
						},
						locateOptions: {
							enableHighAccuracy: true,
							maxZoom: 18,
						},
					})
					.addTo(map);

				map.on("locateactivate", () => {
					console.log("📍 Locate control activated");
					map?.setZoom(Math.max(Math.min(map.getZoom(), 18), 12));
				});

				// Create custom control for milepost button
				const MilepostControl = L.Control.extend({
					onAdd: function (map: Map) {
						const container = L.DomUtil.create(
							"div",
							"leaflet-bar leaflet-control leaflet-control-custom"
						);

						const button = L.DomUtil.create("a", "", container);
						button.innerHTML = "📍"; // You can use any icon/text
						button.href = "#";
						button.title = "Add Milepost Points";
						button.style.backgroundColor = "white";
						button.style.width = "30px";
						button.style.height = "30px";
						button.style.lineHeight = "30px";
						button.style.textAlign = "center";
						button.style.textDecoration = "none";
						button.style.color = "black";
						button.style.display = "block";

						L.DomEvent.on(button, "click", function (e) {
							L.DomEvent.stopPropagation(e);
							L.DomEvent.preventDefault(e);

							// Call your function here
							const railroadCrossingsLayer = leafletOverlayLayers[
								"Railroad Mileposts"
							] as L.LayerGroup;
							const center = map.getCenter();
							addMilepostPointsAndLines(
								railroadCrossingsLayer,
								center.lat,
								center.lng
							);
						});

						return container;
					},

					onRemove: function (map: Map) {
						// Nothing to do here
					},
				});

				// Add the control to the map
				const milepostControl = new MilepostControl({ position: "topleft" });
				milepostControl.addTo(map);

				/*map.addEventListener("moveend", async () => {
					const railroadCrossingsLayer = leafletOverlayLayers[
						"Railroad Mileposts"
					] as L.LayerGroup;

					const center = map.getCenter();

					await addMilepostPointsAndLines(
						railroadCrossingsLayer,
						center.lat,
						center.lng
					);
				});*/
			} catch (err) {
				console.error("Error initializing map with LocateControl:", err);

				map = L.map(mapContainer).setView([0, 0], 2);
				L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
					attribution: "&copy; OpenStreetMap contributors",
				}).addTo(map);
			}
		};

		initMap();

		return () => {
			map?.remove();
		};
	});
</script>

<div
	bind:this={mapContainer}
	id="map"
></div>

<style>
	:global(.grayscale-tile) {
		filter: grayscale(100%);
	}
	#map {
		height: 100vh;
		width: 100vw;
	}
	:global(html, body) {
		margin: 0;
		padding: 0;
		height: 100%;
		width: 100%;
		overflow: hidden;
	}

	.leaflet-control-custom {
		margin-top: 10px !important; /* Add space below locate control */
	}

	.leaflet-control-custom a:hover {
		background-color: #f4f4f4 !important;
	}
</style>
