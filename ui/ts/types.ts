export type StashesFile = {
    stashes: Stash[];
};

export type Stash = {
    lat: number;
    lon: number;
    description: string;
    type: StashType;
    w3w: string;
};

export type StashType = "STASH" | "HOUSE";

export type Tab = {
    tab: HTMLElement;
    contents: HTMLElement;
    name: string;
    activate?: () => void;
};
