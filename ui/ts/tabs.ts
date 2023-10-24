import {Tab} from "./types";

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

export function setupTabs() {
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
    tabs[0].activate();
}
