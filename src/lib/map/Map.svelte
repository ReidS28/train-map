<script>
	import { onMount } from "svelte";
	import L from "leaflet";
	import "leaflet/dist/leaflet.css";
	import "leaflet.locatecontrol";
	import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";

	let mapContainer;

	// Fix marker icons for Vite
	delete L.Icon.Default.prototype._getIconUrl;
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

	onMount(() => {
		const map = L.map(mapContainer).setView([0, 0], 2);

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: "&copy; OpenStreetMap contributors",
		}).addTo(map);

		// Add the locate control
		L.control
			.locate({
				position: "topleft",
				strings: {
					title: "Show me where I am",
				},
				locateOptions: {
					maxZoom: 16,
				},
			})
			.addTo(map);

		return () => {
			map.remove();
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
