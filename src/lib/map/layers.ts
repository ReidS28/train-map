// src/lib/map/layers.ts
import L, { TileLayer, LayerGroup } from 'leaflet';

// Base Layers for L.control.layers
export const leafletBaseLayers: { [key: string]: TileLayer } = {
    "OSM Grayscale": L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "&copy; OpenStreetMap contributors" }
    ).on("tileload", (event) => {
        const tileElement = event.tile as HTMLImageElement;
        if (tileElement && !tileElement.classList.contains("grayscale-tile")) {
            tileElement.classList.add("grayscale-tile");
        }
    }),
    "OpenStreetMap": L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "&copy; OpenStreetMap contributors" }
    ),
    "OpenTopoMap": L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        { attribution: "Map data: &copy; <a href='https://www.opentopomap.org/'>OpenTopoMap</a> contributors", maxZoom: 17 }
    ),
};

// Overlay Layers for L.control.layers
export const leafletOverlayLayers: { [key: string]: TileLayer | LayerGroup } = {
    "OpenRailwayMap": L.tileLayer(
        "https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png",
        { attribution: "© OpenRailwayMap contributors, © OpenStreetMap contributors", maxZoom: 18 }
    ),
    "Predefined Markers": L.layerGroup([
        L.marker([51.5, -0.09]).bindPopup("Marker 1"),
        L.marker([48.8566, 2.3522]).bindPopup("Marker 2"),
    ]),
    "Railroad Mileposts": L.layerGroup(),
};

// IDs for initial layers to be added to the map on load
export const defaultBaseLayerId: string = "OSM Grayscale";
// Add "Railroad Mileposts" to default overlays if you want it visible on load
export const defaultOverlayIds: string[] = ["OpenRailwayMap"];