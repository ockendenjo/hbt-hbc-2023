import VectorSource from "ol/source/Vector";
import {Stash} from "./types";
import {Point} from "ol/geom";
import {fromLonLat} from "ol/proj";
import {Feature} from "ol";
import {Fill, Icon, Style, Text} from "ol/style";
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

export function getStyle(stash: Stash): Style {
    const textFill = stash.visited ? "white" : stash.microtrot ? "black" : "white";

    let image: ImageStyle;
    switch (stash.type) {
        case "HOUSE":
            image = new Icon({
                src: getPumpkinSource(stash),
                offset: [0, 8],
                scale: 0.5,
            });
            break;
        default:
            image = new Icon({
                src: getBatSource(stash),
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

function getPumpkinSource(stash: Stash): string {
    if (stash.visited) {
        return "imgs/pumpkin_green.png";
    }
    if (stash.microtrot) {
        return "imgs/pumpkin_orange.png";
    }
    return "imgs/pumpkin_brown.png";
}

function getBatSource(stash: Stash): string {
    if (stash.visited) {
        return "imgs/bat_green.png";
    }
    if (stash.microtrot) {
        return "imgs/bat_orange.png";
    }
    return "imgs/bat_brown.png";
}

export const COLOUR1 = "saddlebrown";
export const COLOUR2 = "#fdae6c";
