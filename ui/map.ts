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
import {Tab} from "./ts/types";

document.addEventListener("DOMContentLoaded", () => {
    const osmLayer = new TileLayer({
        source: new OSM(),
        opacity: 0.8,
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
            // const feature = map.forEachFeatureAtPixel(e.pixel, (f) => f);
            // if (!feature) {
            //     overlay.setPosition(undefined);
            //     closer.blur();
            //     return;
            // }
            //
            // const properties = feature.getProperties();
            // const pub = properties.pub as PubData;
            //
            // content.innerHTML = `<b>${pub.name}</b><p>Score: ${pub.stats.meanRating.toFixed(1)}<br>Visits: ${
            //     pub.stats.visitCount
            // }</p><div id="popup-link">View details</div>`;
            // document.getElementById("popup-link").onclick = () => {
            //     // viewPubDetails(pub);
            // };
            // overlay.setPosition(e.coordinate);
        });

        map.addOverlay(overlay);
        closer.onclick = () => {
            overlay.setPosition(undefined);
            closer.blur();
            return false;
        };
    }

    initialiseMap();

    const tabs: Tab[] = [
        {
            tab: document.getElementById("select-map"),
            contents: document.getElementById("tab-map"),
            name: "map",
        },
        {
            tab: document.getElementById("select-info"),
            contents: document.getElementById("tab-info"),
            name: "instructions",
        },
    ];

    function setupTabs() {
        tabs.forEach((t) => {
            const otherTabs = tabs.filter((i) => i !== t);
            t.activate = () => {
                otherTabs.forEach((ot) => {
                    ot.contents.style.display = "none";
                    ot.tab.classList.remove("active");
                });
                t.contents.style.display = "";
                t.tab.classList.add("active");
            };

            t.tab.addEventListener("click", () => {
                t.activate();
            });
        });
    }

    setupTabs();
    tabs[0].activate();
});

window.onerror = (event, source, lineno, colno, error) => {
    console.error({event, source, lineno, colno, error});
};
