import type { IControl } from 'maplibre-gl';

export default class LayerControl implements IControl {
  private map: maplibregl.Map | undefined;
  private container: HTMLElement | undefined;
  private layers: { id: string; name: string; checked: boolean; }[];

  constructor(layers: { id: string; name: string; checked: boolean; }[]) {
    this.layers = layers;
  }

  onAdd(map: maplibregl.Map) {
    this.map = map;
    this.container = document.createElement('div');
    this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    this.container.style.padding = '1px 6px';
    this.container.style.backgroundColor = 'white';
    this.container.style.cursor = 'pointer';
    this.container.style.color = 'black';

    this.layers.forEach(layer => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `layer-${layer.id}`;
      checkbox.checked = layer.checked;
      checkbox.addEventListener('change', (e) => this.toggleLayer(e, layer.id));

      const label = document.createElement('label');
      label.htmlFor = `layer-${layer.id}`;
      label.textContent = layer.name;

      this.container?.appendChild(checkbox);
      this.container?.appendChild(label);
      this.container?.appendChild(document.createElement('br'));
    });

    return this.container;
  }

  onRemove() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.map = undefined;
    }
  }

  private toggleLayer(e: Event, layerId: string) {
    if (!this.map) return;
    const isChecked = (e.target as HTMLInputElement).checked;
    this.map.setLayoutProperty(layerId, 'visibility', isChecked ? 'visible' : 'none');
  }
}