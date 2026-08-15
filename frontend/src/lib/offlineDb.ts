import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "e-sekooly-offline";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("syncQueue")) {
          db.createObjectStore("syncQueue", { keyPath: "id", autoIncrement: true });
        }
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("cachedModels")) {
          db.createObjectStore("cachedModels", { keyPath: "modelName" });
        }
      },
    });
  }
  return dbPromise;
}

export interface QueuedMutation {
  id?: number;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  createdAt: string;
  retries: number;
}

export async function enqueueMutation(mutation: Omit<QueuedMutation, "id" | "retries">) {
  const db = await getDb();
  await db.add("syncQueue", { ...mutation, retries: 0 });
}

export async function getQueuedMutations(): Promise<QueuedMutation[]> {
  const db = await getDb();
  return db.getAll("syncQueue");
}

export async function removeQueuedMutation(id: number) {
  const db = await getDb();
  await db.delete("syncQueue", id);
}

export async function clearSyncQueue() {
  const db = await getDb();
  await db.clear("syncQueue");
}

export async function getMeta(key: string): Promise<string | undefined> {
  const db = await getDb();
  const record = await db.get("meta", key);
  return record?.value;
}

export async function setMeta(key: string, value: string) {
  const db = await getDb();
  await db.put("meta", { key, value });
}

export interface CachedModel {
  modelName: string;
  data: unknown[];
  syncedAt: string;
}

export async function getCachedModel(modelName: string): Promise<CachedModel | undefined> {
  const db = await getDb();
  return db.get("cachedModels", modelName);
}

export async function setCachedModel(modelName: string, data: unknown[]) {
  const db = await getDb();
  await db.put("cachedModels", { modelName, data, syncedAt: new Date().toISOString() });
}

export async function clearCachedModels() {
  const db = await getDb();
  await db.clear("cachedModels");
}
