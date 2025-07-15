<script lang="ts">
	import { onMount } from "svelte";
	import L, { Map } from "leaflet";
	import "leaflet/dist/leaflet.css";

	let mapContainer: HTMLDivElement;

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

	onMount(() => {
		let map: Map;

		const initMap = async () => {
			try {
				await loadLocateControl();

				map = L.map(mapContainer).setView([0, 0], 2);

				// --Layers--

				// Base layers
				const osm = L.tileLayer(
					"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
					{
						attribution: "&copy; OpenStreetMap contributors",
					}
				);

				const osmGray = L.tileLayer(
					"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
					{
						attribution: "&copy; OpenStreetMap contributors",
					}
				);
				osmGray.on("tileload", (event) => {
					const container = osmGray.getContainer();
					if (container && !container.classList.contains("grayscale-tile")) {
						container.classList.add("grayscale-tile");
					}
				});

				const topo = L.tileLayer(
					"https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
					{
						attribution: "Map data: &copy; OpenTopoMap contributors",
					}
				);

				// Add default base layer
				osm.addTo(map);

				// Overlay layers
				const railway = L.tileLayer(
					"https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png",
					{
						attribution:
							"© OpenRailwayMap contributors, © OpenStreetMap contributors",
						maxZoom: 19,
					}
				);

				const markerLayer = L.layerGroup([
					L.marker([51.5, -0.09]).bindPopup("Marker 1"),
					L.marker([48.8566, 2.3522]).bindPopup("Marker 2"),
				]);

				// Add ORM overlay by default
				railway.addTo(map);

				// Layer control UI
				const baseLayers = {
					OpenStreetMap: osm,
					"Grayscale OSM": osmGray,
					OpenTopoMap: topo,
				};

				const overlays = {
					OpenRailwayMap: railway,
					Markers: markerLayer,
				};

				L.control
					.layers(baseLayers, overlays, { position: "topright" })
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
</style>
