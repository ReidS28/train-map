<template>
        <div
                ref="mapContainer"
                class="map-container"
        ></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";

const mapContainer = ref<HTMLDivElement | null>(null);
let map: Map | null = null;

onMounted(() => {
        if (!mapContainer.value) return;

        try {
                // Initialize PMTiles protocol
                const protocol = new Protocol();
                maplibregl.addProtocol("pmtiles", protocol.tile);

                // Create MapLibre GL map with error handling
                map = new maplibregl.Map({
                        container: mapContainer.value,
                        style: {
                                version: 8,
                                sources: {
                                        "osm-bright": {
                                                type: "raster",
                                                tiles: [
                                                        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                                                        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
                                                        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                ],
                                                tileSize: 256,
                                                attribution: "© OpenStreetMap contributors"
                                        }
                                },
                                layers: [
                                        {
                                                id: "osm",
                                                type: "raster",
                                                source: "osm-bright",
                                                minzoom: 0,
                                                maxzoom: 18
                                        }
                                ]
                        },
                        center: [0, 0],
                        zoom: 2,
                });

                // Add error handling
                map.on('error', (e) => {
                        console.error('Map error:', e);
                });

                // Add load event
                map.on('load', () => {
                        console.log('Map loaded successfully');
                });

                // Add zoom controls
                map.addControl(new maplibregl.NavigationControl());
        } catch (error) {
                console.error('Error initializing map:', error);
        }
});

onBeforeUnmount(() => {
        map?.remove();
});
</script>

<style scoped>
.map-container {
        width: 100%;
        height: 100vh;
}
</style>
