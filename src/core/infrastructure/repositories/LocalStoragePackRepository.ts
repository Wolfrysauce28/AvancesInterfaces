import type { PackRepository } from '../../domain/repositories/PackRepository';
import type { Pack } from '../../domain/entities/Pack';
import { INITIAL_MOCK_PACKS } from '../datasources/MockData';

export class LocalStoragePackRepository implements PackRepository {
  private getStoredPacks(): Pack[] {
    if (typeof window === 'undefined') return INITIAL_MOCK_PACKS;
    const data = localStorage.getItem('ceromerma_packs');
    if (!data) {
      localStorage.setItem('ceromerma_packs', JSON.stringify(INITIAL_MOCK_PACKS));
      return INITIAL_MOCK_PACKS;
    }
    try {
      return JSON.parse(data) as Pack[];
    } catch {
      return INITIAL_MOCK_PACKS;
    }
  }

  private savePacks(packs: Pack[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ceromerma_packs', JSON.stringify(packs));
    }
  }

  async getPacks(): Promise<Pack[]> {
    return this.getStoredPacks();
  }

  async getPackById(id: string): Promise<Pack | null> {
    const packs = this.getStoredPacks();
    return packs.find(p => p.id === id) || null;
  }

  async getPacksByStore(storeId: string): Promise<Pack[]> {
    const packs = this.getStoredPacks();
    return packs.filter(p => p.storeId === storeId);
  }

  async updateStock(packId: string, newStock: number): Promise<Pack> {
    const packs = this.getStoredPacks();
    const index = packs.findIndex(p => p.id === packId);
    if (index === -1) {
      throw new Error(`Pack con ID ${packId} no encontrado.`);
    }
    packs[index].stock = newStock;
    this.savePacks(packs);
    return packs[index];
  }

  async addPack(packData: Omit<Pack, 'id'>): Promise<Pack> {
    const packs = this.getStoredPacks();
    const newPack: Pack = {
      ...packData,
      id: `pack-${Date.now()}`
    };
    packs.push(newPack);
    this.savePacks(packs);
    return newPack;
  }
}
