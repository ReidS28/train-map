import type { IControl, Map } from "maplibre-gl";

export interface OverlayLayer {
  id: string;           // unique source id (should be unique across styles)
  name: string;         // UI label
  source: any;          // source definition to re-add (geojson, raster, etc)
  layer: any;           // layer definition that references source (has .id and .source === overlay.id)
  checked: boolean;     // visible by default
}

export default class LayerControl implements IControl {
  private map: Map | undefined;
  private container: HTMLElement | undefined;
  private boundOnStyleLoad: (() => void) | undefined;

  constructor(
    private baseMaps: Record<string, string>,
    private overlays: OverlayLayer[]
  ) {}

  onAdd(map: Map) {
    this.map = map;

    // bind once so we can remove listener later
    this.boundOnStyleLoad = this.onStyleLoad.bind(this);
    this.map.on("style.load", this.boundOnStyleLoad);

    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";
    this.container.style.padding = "6px";
    this.container.style.maxWidth = "180px";
    this.container.style.fontSize = "13px";

    // --- Base maps (buttons that call setStyle) ---
    const baseTitle = document.createElement("div");
    baseTitle.innerText = "Base Maps";
    baseTitle.style.fontWeight = "bold";
    baseTitle.style.marginBottom = "4px";
    this.container.appendChild(baseTitle);

    Object.keys(this.baseMaps).forEach((mapName) => {
      const button = document.createElement("button");
      button.textContent = mapName;
      button.style.display = "block";
      button.style.width = "100%";
      button.style.margin = "2px 0";
      button.style.cursor = "pointer";

      button.addEventListener("click", () => this.switchStyle(mapName));

      this.container!.appendChild(button);
    });

    // --- Overlays (checkboxes) ---
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

    // If the map already has a style loaded (initial load), add overlays now.
    // map.getStyle() returns the current style object; if it's present we can add overlays immediately.
    try {
      if (this.map.getStyle && this.map.getStyle()) {
        // small defer to ensure style internals are ready
        setTimeout(() => this.reAddOverlays(), 0);
      }
    } catch (e) {
      // ignore
    }

    return this.container;
  }

  onRemove() {
    // remove style listener
    if (this.map && this.boundOnStyleLoad) {
      this.map.off("style.load", this.boundOnStyleLoad);
    }
    this.container?.remove();
    this.map = undefined;
  }

  // Public helper if you ever want to trigger re-add manually
  public reAddOverlays() {
    if (!this.map) return;

    this.overlays.forEach((ol) => {
      try {
        // add source if missing
        if (!this.map!.getSource(ol.id)) {
          this.map!.addSource(ol.id, ol.source);
        }

        // if a layer with same id exists (unlikely after style change but possible on repeated calls), remove it first
        if (this.map!.getLayer(ol.layer.id)) {
          try {
            this.map!.removeLayer(ol.layer.id);
          } catch (err) {
            // ignore removal error
          }
        }

        // Add layer on top (no 'before' param => top)
        this.map!.addLayer({
          ...ol.layer,
          layout: { ...(ol.layer.layout || {}), visibility: ol.checked ? "visible" : "none" }
        });
      } catch (err) {
        // warn but continue
        // eslint-disable-next-line no-console
        console.warn(`[LayerControl] failed to add overlay ${ol.id}:`, err);
      }
    });
  }

  // internal handler called on every style.load
  private onStyleLoad() {
    // re-add overlays (will use current values of ol.checked)
    this.reAddOverlays();
  }

  private switchStyle(mapName: string) {
    if (!this.map) return;

    // We don't need to explicitly remove overlays here — they will be removed by setStyle.
    // But we should ensure our overlay state (checked) is up to date so reAddOverlays will set visibility correctly.
    this.map.setStyle(this.baseMaps[mapName]);
    // overlays will be re-added in onStyleLoad()
  }

  private toggleOverlay(e: Event, overlay: OverlayLayer) {
    const isChecked = (e.target as HTMLInputElement).checked;
    overlay.checked = isChecked; // update in-memory state

    if (!this.map) return;

    // If the overlay layer exists right now, just toggle its visibility
    if (this.map.getLayer(overlay.layer.id)) {
      this.map.setLayoutProperty(overlay.layer.id, "visibility", isChecked ? "visible" : "none");
    }
    // otherwise it will be added on next style.load with correct visibility because overlay.checked is updated
  }
}
