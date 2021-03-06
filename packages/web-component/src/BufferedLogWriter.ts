export default class BufferedLogWriter {

    private readonly MAX_FLUSH_SIZE = 25;

    private appendBuffer: Node[] = [];
    private prependBuffer: Node[] = [];

    private containerElement: ParentNode;

    private scheduled: boolean = false;

    private postFlushCb: () => any | null;

    constructor(containerElement: ParentNode) {
        this.containerElement = containerElement;

    }

    public queueAppend(node: Node): void {
        this.schedule();
        this.appendBuffer.push(node);
    }

    public queuePrepend(node: Node): void {
        this.schedule();
        this.prependBuffer.push(node);
    }

    public onPostFlush(callback: () => void): void {
        this.postFlushCb = callback;
    }

    private schedule(): void {
        if (this.scheduled) {
            return;
        }

        this.scheduled = true;
        window.requestAnimationFrame(() => {
            this.flushAppendBuffer();
            if (this.postFlushCb) {
                this.postFlushCb();
            }
            this.flushPrependBuffer();
            this.scheduled = false;
        });
    }

    private flushAppendBuffer(): void {
        if (this.appendBuffer.length > 0) {
            this.containerElement.append(this.doFlush(this.appendBuffer));
        }
    }

    private flushPrependBuffer(): void {
        if (this.prependBuffer.length > 0) {
            this.containerElement.prepend(this.doFlush(this.prependBuffer));
        }
    }

    private doFlush(buffer: Node[]): DocumentFragment {
        const frag: DocumentFragment = new DocumentFragment();

        for (let i = 0; this.appendBuffer.length > 0 && i < this.MAX_FLUSH_SIZE; i++) {
            frag.appendChild(buffer.shift());
        }

        return frag;
    }
}
