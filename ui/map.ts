import "./map.css";
import "./popup.css";
import * as ol from "ol";
import {Overlay, View} from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import {fromLonLat} from "ol/proj";
import {defaults as defaultControls} from "ol/control";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {Stash, StashesFile, Tab} from "./ts/types";
import {renderStash} from "./ts/render";
import {setupTabs} from "./ts/tabs";

document.addEventListener("DOMContentLoaded", () => {
    const osmLayer = new TileLayer({
        source: new OSM(),
        opacity: 0.7,
    });

    const vectorSource = new VectorSource({wrapX: true});
    const vectorLayer = new VectorLayer({source: vectorSource});

    const mapView = new View({maxZoom: 19});
    mapView.setCenter(fromLonLat([-3.18985, 55.95285]));
    mapView.setZoom(12);

    function initialiseMap() {
        const map = new ol.Map({
            controls: defaultControls().extend([]),
            target: "map",
            layers: [osmLayer, vectorLayer],
            keyboardEventTarget: document,
            view: mapView,
        });

        const container = document.getElementById("popup");
        const content = document.getElementById("popup-content");
        const closer = document.getElementById("popup-closer");

        const overlay = new Overlay({
            element: container,
            autoPan: true,
        });

        map.on("click", function (e) {
            const feature = map.forEachFeatureAtPixel(e.pixel, (f) => f);
            if (!feature) {
                overlay.setPosition(undefined);
                closer.blur();
                return;
            }

            const properties = feature.getProperties();
            const stash = properties.stash as Stash;
            const title = stash.type === "HOUSE" ? "House / flat" : "Stash";

            content.innerHTML = `<b>${title}</b><p>${stash.description}</p>`;
            overlay.setPosition(e.coordinate);
        });

        map.addOverlay(overlay);
        closer.onclick = () => {
            overlay.setPosition(undefined);
            closer.blur();
            return false;
        };
    }

    initialiseMap();

    function loadData() {
        fetch("stashes.json")
            .then((r) => r.json())
            .then((j: StashesFile) => j.stashes)
            .then((stashes) => {
                stashes.forEach((s) => renderStash(vectorSource, s));
                mapView.fit(vectorSource.getExtent(), {padding: [20, 20, 20, 20]});
            });
    }

    setupTabs();
    loadData();
});

window.onerror = (event, source, lineno, colno, error) => {
    console.error({event, source, lineno, colno, error});
};
