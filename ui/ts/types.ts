export type StashesFile = {
    demo: boolean;
    stashes: Stash[];
};

export type Stash = {
    id: string;
    lat: number;
    lon: number;
    location: string;
    contents: string[];
    microtrot: boolean;
    type: StashType;
    w3w: string;
    points: number;
    visited: boolean;
};

export type StashType = "STASH" | "HOUSE" | "INFO";

export type Tab = {
    tab: HTMLElement;
    contents: HTMLElement;
    name: string;
    activate?: () => void;
};
