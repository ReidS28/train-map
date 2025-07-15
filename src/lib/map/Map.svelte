<script>
	import { onMount } from "svelte";
	import L from "leaflet";
	import "leaflet/dist/leaflet.css";

	let mapContainer;

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

	async function loadLocateControl() {
		window.L = L;

		try {
			await import("leaflet.locatecontrol/dist/L.Control.Locate.min.css");
			await import("leaflet.locatecontrol");

			if (L.control.locate) {
				return;
			}
		} catch (e) {
			console.log("NPM package failed, trying CDN...", e);
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
				if (L.control.locate) {
					resolve();
				} else {
					reject(new Error("Locate control not loaded"));
				}
			};
			script.onerror = () =>
				reject(new Error("Failed to load locate control script"));
			document.head.appendChild(script);
		});
	}

	onMount(async () => {
		try {
			await loadLocateControl();

			const map = L.map(mapContainer).setView([0, 0], 2);

			L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
				attribution: "&copy; OpenStreetMap contributors",
			}).addTo(map);

			var lc = L.control
				.locate({
					position: "topleft",
					strings: {
						title: "Current location",
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

			map.on("locateactivate", function () {
				console.log("Locate control started following user. 📍");
				map.setZoom(Math.max(Math.min(map.getZoom(), 18), 12));
			});

			//lc.start(); //Auto Start

			return () => {
				map.remove();
			};
		} catch (error) {
			console.error("Error loading locate control:", error);

			const map = L.map(mapContainer).setView([0, 0], 2);

			L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
				attribution: "&copy; OpenStreetMap contributors",
			}).addTo(map);

			return () => {
				map.remove();
			};
		}
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
