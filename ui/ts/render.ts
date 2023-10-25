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
    feature.setStyle(getStyle(stash));
    source.addFeature(feature);
}

function getStyle(stash: Stash): Style {
    switch (stash.type) {
        case "HOUSE":
            return stash.microtrot ? STAR_PURPLE : STAR_BROWN;
        default:
            return stash.microtrot ? CIRCLE_PURPLE : STYLE_BROWN;
    }
}

function makeCircle(fill: string): Style {
    return new Style({
        image: new CircleStyle({
            radius: 7,
            fill: new Fill({color: "saddlebrown"}),
            stroke: new Stroke({color: "white", width: 2}),
        }),
    });
}

export const COLOUR1 = "saddlebrown";
export const COLOUR2 = "#fdae6c";

export const STYLE_BROWN = makeCircle(COLOUR1);
export const CIRCLE_PURPLE = makeCircle(COLOUR2);

function makeStar(fill: string): Style {
    return new Style({
        image: new RegularShape({
            points: 5,
            radius: 12,
            radius2: 6,
            fill: new Fill({color: fill}),
            stroke: new Stroke({color: "white", width: 2}),
        }),
    });
}

export const STAR_BROWN = makeStar(COLOUR1);
export const STAR_PURPLE = makeStar(COLOUR2);
