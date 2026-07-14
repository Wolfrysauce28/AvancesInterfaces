import type { PackRepository } from '../../domain/repositories/PackRepository';
import type { Pack } from '../../domain/entities/Pack';

export class GetAdminInventory {
  constructor(private packRepository: PackRepository) {}

  async execute(storeId: string): Promise<Pack[]> {
    if (!storeId) {
      throw new Error('El ID de tienda es requerido para ver el inventario.');
    }
    return this.packRepository.getPacksByStore(storeId);
  }
}
