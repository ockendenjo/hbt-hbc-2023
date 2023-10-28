export class StorageService {
    private stashMap = new Map<string, number>();

    constructor() {
        this.readData();
    }

    private readData(): void {
        const lsd = localStorage.getItem("data") ?? "{}";
        const sd = JSON.parse(lsd);
        Object.entries(sd).forEach(([k, v]) => {
            this.stashMap.set(k, Number(v));
        });
    }

    public getVisited(stashId: string): number {
        return this.stashMap.get(stashId) ?? 0;
    }

    public setVisited(stashId: string, points: number): void {
        this.stashMap.set(stashId, points);
        this.writeData();
    }

    private writeData(): void {
        const data: Record<string, number> = {};
        this.stashMap.forEach((v, k) => {
            if (v) {
                data[k] = v;
            }
        });
        localStorage.setItem("data", JSON.stringify(data));
    }
}
