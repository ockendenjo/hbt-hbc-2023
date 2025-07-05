import {Stash} from "./types";
import {Fill, Icon, Stroke, Style, Text} from "ol/style";
import ImageStyle from "ol/style/Image";
import CircleStyle from "ol/style/Circle";

export function getBeerienteeringStyle(stash: Stash): Style {
    let image: ImageStyle;
    switch (stash.type) {
        case "INFO":
            image = new CircleStyle({
                radius: 8,
                fill: new Fill({color: "cornflowerblue"}),
                stroke: new Stroke({color: "white", width: 2}),
            });
            break;
        default:
            image = new Icon({
                src: getCanSource(stash),
                offset: [0, 4],
                scale: 0.5,
            });
    }

    let text: Text;

    if (stash.type !== "INFO") {
        text = new Text({
            text: String(stash.points),
            fill: new Fill({color: "white"}),
        });
    }

    return new Style({
        image: image,
        text,
    });
}

function getCanSource(stash: Stash): string {
    if (stash.visited) {
        return "imgs/can_green.png";
    }
    return "imgs/can_brown.png";
}
