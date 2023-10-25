import VectorSource from "ol/source/Vector";
import {Stash} from "./types";
import {Point} from "ol/geom";
import {fromLonLat} from "ol/proj";
import {Feature} from "ol";
import {Fill, RegularShape, Stroke, Style, Text} from "ol/style";
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
    const fill = stash.microtrot ? COLOUR2 : COLOUR1;
    const textFill = stash.microtrot ? "black" : "white";

    let image: CircleStyle | RegularShape;
    switch (stash.type) {
        case "HOUSE":
            image = new RegularShape({
                points: 5,
                radius: 16,
                radius2: 10,
                fill: new Fill({color: fill}),
                stroke: new Stroke({color: "white", width: 2}),
            });
            break;
        default:
            image = new CircleStyle({
                radius: 10,
                fill: new Fill({color: fill}),
                stroke: new Stroke({color: "white", width: 2}),
            });
    }

    return new Style({
        image: image,
        text: new Text({
            text: String(stash.points),
            fill: new Fill({color: textFill}),
        }),
    });
}

export const COLOUR1 = "saddlebrown";
export const COLOUR2 = "#fdae6c";
