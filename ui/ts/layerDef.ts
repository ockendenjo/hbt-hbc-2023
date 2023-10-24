import {PubData} from "./types";

export interface Renderer {
    render(pubs: PubData[]): void;
    updateStyling(pub: PubData): void;
}
