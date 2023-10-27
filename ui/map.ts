import "./map.css";
import "./popup.css";
import * as ol from "ol";
import {Feature, Overlay, View} from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import {fromLonLat} from "ol/proj";
import {defaults as defaultControls} from "ol/control";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {Stash, StashesFile} from "./ts/types";
import {getStyle, renderStash} from "./ts/render";
import {setupTabs} from "./ts/tabs";
import {StorageService} from "./ts/StorageService";

document.addEventListener("DOMContentLoaded", () => {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop as string),
    });

    const osmLayer = new TileLayer({
        source: new OSM(),
        opacity: 0.7,
    });

    const vectorSource = new VectorSource({wrapX: true});
    const vectorLayer = new VectorLayer({source: vectorSource});

    const mapView = new View({maxZoom: 19});
    mapView.setCenter(fromLonLat([-3.18985, 55.95285]));
    mapView.setZoom(12);

    const storageSvc = new StorageService();

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
            let selectElem: HTMLSelectElement;

            const feature = map.forEachFeatureAtPixel(e.pixel, (f) => f);
            if (!feature) {
                overlay.setPosition(undefined);
                closer.blur();
                if (selectElem) {
                    selectElem.onchange = undefined;
                }
                return;
            }

            const properties = feature.getProperties();
            const stash = properties.stash as Stash;
            const title = stash.type === "HOUSE" ? "House / flat" : "Stash";

            let html = `<b>${title}</b>`;
            if (stash.location?.length) {
                html += `<div>${stash.location}</div>`;
            }
            if (stash.contents?.length) {
                html += `<div><ul>`;
                stash.contents.forEach((c) => {
                    html += `<li>${c}</li>`;
                });
                html += `</ul></div>`;
            } else {
                html += `<div class="unknown">Stash content unknown</div>`;
            }
            if (stash.microtrot) {
                html += `<div>Micro-trot friendly</div>`;
            }
            html += `<div class="w3w"><img src="imgs/w3w.png" height="32" width="32" alt="w3w"><a href="https://what3words.com/${stash.w3w}" target="_blank">${stash.w3w}</a></div>`;
            html += `<div><select id="visit_select"><option value="0">Unvisited</option><option value="1">Visited</option></select></div>`;
            content.innerHTML = html;
            overlay.setPosition(e.coordinate);

            selectElem = document.getElementById("visit_select") as HTMLSelectElement;
            selectElem.value = stash.visited ? "1" : "0";

            selectElem.onchange = () => {
                let visited = selectElem.value === "1";
                storageSvc.setVisited(stash.id, visited);
                stash.visited = visited;
                (feature as Feature).setStyle(getStyle(stash));
                updateScore();
            };
        });

        map.addOverlay(overlay);
        closer.onclick = () => {
            overlay.setPosition(undefined);
            closer.blur();
            return false;
        };
    }

    initialiseMap();
    let stashes: Stash[];

    function getFilename(): string {
        const key = params["key"];
        if (key === "5f55435a-da7f-4475-a58e-51e48369faac") {
            return "stashes.json";
        }
        return Date.now() > 1698505200000 ? "stashes.json" : "demo.json";
    }

    function loadData() {
        fetch(getFilename())
            .then((r) => r.json())
            .then((j: StashesFile) => {
                if (!j.demo) {
                    document.getElementById("demo").style.display = "none";
                }
                return j.stashes;
            })
            .then((s) => {
                stashes = s;
                stashes.forEach((s) => {
                    s.visited = storageSvc.getVisited(s.id);
                    renderStash(vectorSource, s);
                });
                mapView.fit(vectorSource.getExtent(), {padding: [20, 20, 20, 20]});
                updateScore();
            });
    }

    function updateScore(): void {
        const score = stashes
            .map((s) => {
                return s.visited ? s.points : 0;
            })
            .reduce((a, v) => a + v, 0);
        document.getElementById("score").textContent = String(score);
    }

    setupTabs();
    loadData();
});

window.onerror = (event, source, lineno, colno, error) => {
    console.error({event, source, lineno, colno, error});
};
