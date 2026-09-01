import type { SourceSpecification, LayerSpecification } from "maplibre-gl";

export interface OverlayDefinition {
	id: string;
	source: SourceSpecification;
	layers: LayerSpecification[];
}
