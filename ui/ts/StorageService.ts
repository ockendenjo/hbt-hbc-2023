export class StorageService {
    private stashMap = new Map<string, boolean>();

    constructor() {
        this.readData();
    }

    private readData(): void {
        const lsd = localStorage.getItem("data") ?? "{}";
        const sd = JSON.parse(lsd);
        Object.entries(sd).forEach(([k, v]) => {
            this.stashMap.set(k, Boolean(v));
        });
    }

    public getVisited(stashId: string): boolean {
        return this.stashMap.get(stashId) ?? false;
    }

    public setVisited(stashId: string, visited: boolean): void {
        this.stashMap.set(stashId, visited);
        this.writeData();
    }

    private writeData(): void {
        const data: Record<string, boolean> = {};
        this.stashMap.forEach((v, k) => {
            if (v) {
                data[k] = v;
            }
        });
        localStorage.setItem("data", JSON.stringify(data));
    }
}
