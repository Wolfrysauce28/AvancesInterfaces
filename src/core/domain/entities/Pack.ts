export interface Pack {
  id: string;
  storeId: string;
  storeName: string; // Desnormalizado para simplificar el frontend mockup
  name: string;
  description: string;
  imageUrl: string;
  originalPrice: number;
  discountedPrice: number;
  stock: number;
  collectionTime: string; // ej. "19:30 - 20:30"
  isUrgent: boolean;
  co2SavedKg: number;
  category: string; // ej. "panaderia", "pizza", "saludable"
}
