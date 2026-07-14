import type { Pack } from '../entities/Pack';

export interface PackRepository {
  getPacks(): Promise<Pack[]>;
  getPackById(id: string): Promise<Pack | null>;
  getPacksByStore(storeId: string): Promise<Pack[]>;
  updateStock(packId: string, newStock: number): Promise<Pack>;
  addPack(pack: Omit<Pack, 'id'>): Promise<Pack>;
}
