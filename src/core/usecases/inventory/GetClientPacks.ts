import type { PackRepository } from '../../domain/repositories/PackRepository';
import type { Pack } from '../../domain/entities/Pack';

export class GetClientPacks {
  constructor(private packRepository: PackRepository) {}

  async execute(): Promise<Pack[]> {
    const packs = await this.packRepository.getPacks();
    // Filtro inicial de packs que tengan stock disponible
    return packs;
  }
}
