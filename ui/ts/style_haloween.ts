import { Stash } from "./types";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import ImageStyle from "ol/style/Image";
import CircleStyle from "ol/style/Circle";

export function getHaloweenStyle(stash: Stash): Style {
  const textFill = stash.visited
    ? "white"
    : stash.microtrot
      ? "black"
      : "white";

  let image: ImageStyle;
  switch (stash.type) {
    case "HOUSE":
      image = new Icon({
        src: getPumpkinSource(stash),
        offset: [0, 8],
        scale: 0.5,
      });
      break;
    case "INFO":
      image = new CircleStyle({
        radius: 8,
        fill: new Fill({ color: "cornflowerblue" }),
        stroke: new Stroke({ color: "white", width: 2 }),
      });
      break;
    default:
      image = new Icon({
        src: getBatSource(stash),
        offset: [0, 4],
        scale: 0.5,
      });
  }

  let text: Text;

  if (stash.type !== "INFO") {
    text = new Text({
      text: String(stash.points),
      fill: new Fill({ color: textFill }),
    });
  }

  return new Style({
    image: image,
    text,
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
