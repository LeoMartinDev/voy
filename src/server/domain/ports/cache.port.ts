export interface Cache<T> {
	get(key: string): Promise<T | null>;
	set(key: string, value: T, ttlMs?: number): Promise<void>;
	delete(key: string): Promise<void>;
	clear(): Promise<void>;
}
