import VectorSource from "ol/source/Vector";
import {Stash} from "./types";
import {Point} from "ol/geom";
import {fromLonLat} from "ol/proj";
import {Feature} from "ol";
import {Fill, RegularShape, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";

export function renderStash(source: VectorSource, stash: Stash) {
    const featureConfig = {
        geometry: new Point(fromLonLat([stash.lon, stash.lat])),
        stash: stash,
    };
    const feature = new Feature(featureConfig);
    switch (stash.type) {
        case "HOUSE":
            feature.setStyle(DIAMOND_BROWN);
            break;
        default:
            feature.setStyle(STYLE_BROWN);
    }
    source.addFeature(feature);
}

export const STYLE_BROWN = new Style({
    image: new CircleStyle({
        radius: 7,
        fill: new Fill({color: "saddlebrown"}),
        stroke: new Stroke({color: "white", width: 2}),
    }),
});

export const DIAMOND_BROWN = new Style({
    image: new RegularShape({
        points: 4,
        radius: 8,
        fill: new Fill({color: "saddlebrown"}),
        stroke: new Stroke({color: "white", width: 2}),
    }),
});
