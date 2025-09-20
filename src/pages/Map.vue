<template>
        <div
                ref="mapContainer"
                class="map-container"
                id="map"
        ></div>
</template>

<script lang="ts" setup>

import { ref, onMounted, onBeforeUnmount } from "vue";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Protocol } from "pmtiles";

onMounted(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    const pmtilesUrl = `pmtiles://${window.location.origin}/pmtiles/v4.pmtiles`;

    const customStyle = {
        version: 8,
        sources: {
            'protomaps': {
                'type': 'vector',
                'url': pmtilesUrl,
                'attribution': '© <a href="https://protomaps.com">Protomaps</a>'
            }
        },
        layers: [
                {
                    'id': 'background',
                    'type': 'background',
                    'paint': {
                        'background-color': '#2a5e96' // A light gray color
                    }
                },
            // Layer 1: Render the land area as a polygon fill
            {
                'id': 'land-fill',
                'type': 'fill',
                'source': 'protomaps',
                'source-layer': 'land',
                'paint': {
                    'fill-color': '#e3e8e1'
                }
            },
            // Layer 2: Render buildings as a polygon fill
            {
                'id': 'buildings-fill',
                'type': 'fill',
                'source': 'protomaps',
                'source-layer': 'buildings',
                'paint': {
                    'fill-color': '#d1d1d1',
                    'fill-opacity': 0.8
                }
            },
            // Layer 3: Render roads as lines
            {
                'id': 'roads-line',
                'type': 'line',
                'source': 'protomaps',
                'source-layer': 'roads',
                'paint': {
                    'line-color': '#9b9b9b',
                    'line-width': 2
                }
            }
        ]
    };

    const map = new maplibregl.Map({
        container: 'map',
        style: customStyle,
        center: [-74.006, 40.7128], // Centered on New York City
        zoom: 12
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
});

onBeforeUnmount(() => {
    // It's good practice to call map.remove() here to clean up the map instance
    // and prevent memory leaks.
});

</script>

<style scoped>
.map-container {
        width: 100%;
        height: 100vh;
}
</style>
