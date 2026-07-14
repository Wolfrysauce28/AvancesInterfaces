import type { PackRepository } from '../../domain/repositories/PackRepository';
import type { Pack } from '../../domain/entities/Pack';

export class UpdatePackStock {
  constructor(private packRepository: PackRepository) {}

  async execute(packId: string, newStock: number): Promise<Pack> {
    if (newStock < 0) {
      throw new Error('El stock no puede ser menor a cero.');
    }
    return this.packRepository.updateStock(packId, newStock);
  }
}
