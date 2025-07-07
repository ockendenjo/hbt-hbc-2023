import VectorSource from "ol/source/Vector";
import { Stash } from "./types";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { Feature } from "ol";
import { getBeerienteeringStyle } from "./style_beerienteering";

export function renderStash(source: VectorSource, stash: Stash) {
  const featureConfig = {
    geometry: new Point(fromLonLat([stash.lon, stash.lat])),
    stash: stash,
  };
  const feature = new Feature(featureConfig);
  feature.setStyle(getBeerienteeringStyle(stash));
  source.addFeature(feature);
}
