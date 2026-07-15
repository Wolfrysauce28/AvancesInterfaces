import type { PackRepository } from '../../domain/repositories/PackRepository';
import type { Pack } from '../../domain/entities/Pack';
import { supabase } from '../datasources/supabaseClient';

type PackRow = {
  id: string;
  store_id: string;
  store_name: string;
  name: string;
  description: string;
  image_url: string;
  original_price: number;
  discounted_price: number;
  stock: number;
  collection_time: string;
  is_urgent: boolean;
  co2_saved_kg: number;
  category: string;
};

export class SupabasePackRepository implements PackRepository {
  private mapRowToPack(row: PackRow): Pack {
    return {
      id: row.id,
      storeId: row.store_id,
      storeName: row.store_name,
      name: row.name,
      description: row.description,
      imageUrl: row.image_url,
      originalPrice: Number(row.original_price),
      discountedPrice: Number(row.discounted_price),
      stock: Number(row.stock),
      collectionTime: row.collection_time,
      isUrgent: row.is_urgent,
      co2SavedKg: Number(row.co2_saved_kg),
      category: row.category,
    };
  }

  private mapPackToRow(pack: Omit<Pack, 'id'>): Omit<PackRow, 'id'> {
    return {
      store_id: pack.storeId,
      store_name: pack.storeName,
      name: pack.name,
      description: pack.description,
      image_url: pack.imageUrl,
      original_price: pack.originalPrice,
      discounted_price: pack.discountedPrice,
      stock: pack.stock,
      collection_time: pack.collectionTime,
      is_urgent: pack.isUrgent,
      co2_saved_kg: pack.co2SavedKg,
      category: pack.category,
    };
  }

  async getPacks(): Promise<Pack[]> {
    const { data, error } = await supabase
      .from('packs')
      .select('*')
      .order('is_urgent', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener packs: ${error.message}`);
    }

    return (data || []).map(this.mapRowToPack);
  }

  async getPackById(id: string): Promise<Pack | null> {
    const { data, error } = await supabase
      .from('packs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapRowToPack(data);
  }

  async getPacksByStore(storeId: string): Promise<Pack[]> {
    const { data, error } = await supabase
      .from('packs')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener packs de la tienda: ${error.message}`);
    }

    return (data || []).map(this.mapRowToPack);
  }

  async updateStock(packId: string, newStock: number): Promise<Pack> {
    const { data, error } = await supabase
      .from('packs')
      .update({ stock: newStock })
      .eq('id', packId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al actualizar stock');
    }

    return this.mapRowToPack(data);
  }

  async addPack(packData: Omit<Pack, 'id'>): Promise<Pack> {
    const newId = `pack-${Date.now()}`;
    const row = {
      id: newId,
      ...this.mapPackToRow(packData),
    };

    const { data, error } = await supabase
      .from('packs')
      .insert(row)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error al agregar pack');
    }

    return this.mapRowToPack(data);
  }
}
