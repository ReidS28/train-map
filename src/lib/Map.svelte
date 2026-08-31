<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import * as maplibregl from "maplibre-gl";
	import "maplibre-gl/dist/maplibre-gl.css";
	import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
	import * as pmtiles from "pmtiles";
	import { layers, namedFlavor } from "@protomaps/basemaps";

	maplibregl.setWorkerUrl(workerUrl);

	const PMTILES_URL =
		"https://build.protomaps.com/20260831.pmtiles";

	const id = `map-container-${crypto.randomUUID()}`;

	let mapContainer: HTMLDivElement;
	let map: maplibregl.Map;

	onMount(() => {
		let protocol = new pmtiles.Protocol();
		maplibregl.addProtocol("pmtiles", protocol.tile);

		map = new maplibregl.Map({
			container: mapContainer,
			zoom: 10,
			center: [-83, 40],
			style: {
				version: 8,
				glyphs:
					"https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
				sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
				sources: {
					['protomaps']: {
						type: "vector",
						url: `pmtiles://${PMTILES_URL}`,
						attribution:
							'<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
					},
				},
				layers: layers('protomaps', namedFlavor('light'), { lang: "en" }),
			},
			maplibreLogo: false,
		});
		return () => map.remove();
	});
</script>

<div
	bind:this={mapContainer}
	class="w-full h-full bg-blue-500"
>
	<h1>Map will go here</h1>
</div>
