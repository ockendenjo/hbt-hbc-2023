import VectorSource from "ol/source/Vector";
import {Stash} from "./types";
import {Point} from "ol/geom";
import {fromLonLat} from "ol/proj";
import {Feature} from "ol";
import {Fill, Icon, RegularShape, Stroke, Style, Text} from "ol/style";
import CircleStyle from "ol/style/Circle";
import ImageStyle from "ol/style/Image";

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

    let image: ImageStyle;
    switch (stash.type) {
        case "HOUSE":
            image = new Icon({
                src: stash.microtrot ? "imgs/pumpkin_orange.png" : "imgs/pumpkin_brown.png",
                offset: [0, 8],
                scale: 0.5,
            });
            break;
        default:
            image = new Icon({
                src: stash.microtrot ? "imgs/bat_orange.png" : "imgs/bat_brown.png",
                offset: [0, 4],
                scale: 0.5,
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
