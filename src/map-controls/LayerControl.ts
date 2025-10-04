import type { IControl, Map } from "maplibre-gl";

interface OverlayLayer {
  id: string;
  name: string;
  source: any;
  layer: any;
  checked: boolean;
}

export default class LayerControl implements IControl {
  private map: Map | undefined;
  private container: HTMLElement | undefined;
  private baseMaps: Record<string, string>;
  private overlays: OverlayLayer[];

  constructor(baseMaps: Record<string, string>, overlays: OverlayLayer[]) {
    this.baseMaps = baseMaps;
    this.overlays = overlays;
  }

  onAdd(map: Map) {
    this.map = map;

    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";
    this.container.style.padding = "6px";
    this.container.style.maxWidth = "180px";
    this.container.style.fontSize = "13px";

    // --- Base layers (style switcher) ---
    const baseTitle = document.createElement("div");
    baseTitle.innerText = "Base Maps";
    baseTitle.style.fontWeight = "bold";
    baseTitle.style.marginBottom = "4px";
    this.container.appendChild(baseTitle);

    for (const mapName in this.baseMaps) {
      const button = document.createElement("button");
      button.textContent = mapName;
      button.style.display = "block";
      button.style.width = "100%";
      button.style.margin = "2px 0";
      button.style.cursor = "pointer";

      button.addEventListener("click", () => {
        if (!this.map) return;
        this.map.setStyle(this.baseMaps[mapName]);
      });

      this.container.appendChild(button);
    }

    // --- Overlays ---
    const overlayTitle = document.createElement("div");
    overlayTitle.innerText = "Overlays";
    overlayTitle.style.fontWeight = "bold";
    overlayTitle.style.margin = "6px 0 4px";
    this.container.appendChild(overlayTitle);

    this.overlays.forEach((ol) => {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `overlay-${ol.id}`;
      checkbox.checked = ol.checked;

      checkbox.addEventListener("change", (e) => this.toggleOverlay(e, ol));

      const label = document.createElement("label");
      label.htmlFor = checkbox.id;
      label.textContent = ol.name;

      this.container?.appendChild(checkbox);
      this.container?.appendChild(label);
      this.container?.appendChild(document.createElement("br"));
    });

    // Re-add overlays every time style changes
    this.map.on("style.load", () => {
      this.overlays.forEach((ol) => {
        if (!this.map!.getSource(ol.id)) {
          this.map!.addSource(ol.id, ol.source);
        }
        if (!this.map!.getLayer(ol.id)) {
          this.map!.addLayer(ol.layer);
        }
        this.map!.setLayoutProperty(
          ol.id,
          "visibility",
          ol.checked ? "visible" : "none"
        );
      });
    });

    return this.container;
  }

  onRemove() {
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.map = undefined;
    }
  }

  private toggleOverlay(e: Event, overlay: OverlayLayer) {
    if (!this.map) return;
    const isChecked = (e.target as HTMLInputElement).checked;
    overlay.checked = isChecked; // remember state
    this.map.setLayoutProperty(
      overlay.id,
      "visibility",
      isChecked ? "visible" : "none"
    );
  }
}
