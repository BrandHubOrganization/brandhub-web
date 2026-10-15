/** One queue per Task: a failed write blocks later writes until explicit retry/discard. */
export class TaskEditSession {
  private queues = new Map<string, Promise<unknown>>();
  private failures = new Map<string, unknown>();
  private dirty = new Set<string>();
  private listeners = new Set<() => void>();
  private version = 0;
  pending = 0;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  snapshot = () => this.version;
  private notify() {
    this.version++;
    this.listeners.forEach((listener) => listener());
  }
  setDirty(id: string, dirty: boolean) {
    if (dirty === this.dirty.has(id)) return;
    if (dirty) this.dirty.add(id);
    else this.dirty.delete(id);
    this.notify();
  }
  get hasUnsaved() {
    return this.pending > 0 || this.dirty.size > 0;
  }
  discard() {
    this.dirty.clear();
    this.failures.clear();
    this.notify();
  }
  retry(key: string) {
    this.failures.delete(key);
  }
  run<T>(key: string, operation: () => Promise<T>): Promise<T> {
    this.pending++;
    this.notify();
    const queued = (this.queues.get(key) || Promise.resolve())
      .catch(() => undefined)
      .then(async () => {
        if (this.failures.has(key)) throw this.failures.get(key);
        try {
          return await operation();
        } catch (error) {
          this.failures.set(key, error);
          throw error;
        }
      })
      .finally(() => {
        this.pending--;
        this.notify();
      });
    this.queues.set(key, queued);
    return queued;
  }
}
