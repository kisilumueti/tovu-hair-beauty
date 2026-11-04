import { sampleProfessionals, sampleServices } from './data';
import type { TovuDatabase } from './types';

const STORAGE_KEY = 'tovu.marketplace.database.v1';

function createInitialDatabase(): TovuDatabase {
  return {
    version: 1,
    customers: [],
    professionals: sampleProfessionals,
    services: sampleServices,
    bookings: [],
  };
}

export function loadDatabase(): TovuDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialDatabase();
      saveDatabase(initial);
      return initial;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !('version' in parsed) || !('customers' in parsed) || !('professionals' in parsed) || !('services' in parsed) || !('bookings' in parsed)) {
      throw new Error('The saved TOVU data has an invalid structure.');
    }
    return parsed as TovuDatabase;
  } catch (error) {
    console.error('TOVU local data could not be loaded.', error);
    return createInitialDatabase();
  }
}

export function saveDatabase(database: TovuDatabase): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

export function exportDatabase(database: TovuDatabase): void {
  const blob = new Blob([JSON.stringify(database, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `tovu-data-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function importDatabase(file: File): Promise<TovuDatabase> {
  const parsed: unknown = JSON.parse(await file.text());
  if (!parsed || typeof parsed !== 'object') throw new Error('The selected file is not a valid JSON object.');
  const data = parsed as Partial<TovuDatabase>;
  if (data.version !== 1 || !Array.isArray(data.customers) || !Array.isArray(data.professionals) || !Array.isArray(data.services) || !Array.isArray(data.bookings)) {
    throw new Error('This JSON file is not a supported TOVU database backup.');
  }
  return data as TovuDatabase;
}

export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}