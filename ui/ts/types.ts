export type StashesFile = {
    stashes: Stash[];
};

export type Stash = {
    id: string;
    lat: number;
    lon: number;
    location: string;
    contents: string;
    microtrot: boolean;
    type: StashType;
    w3w: string;
    points: number;
};

export type StashType = "STASH" | "HOUSE";

export type Tab = {
    tab: HTMLElement;
    contents: HTMLElement;
    name: string;
    activate?: () => void;
};
