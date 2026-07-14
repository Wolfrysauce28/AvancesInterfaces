export interface Store {
  id: string;
  name: string;
  logoUrl?: string;
  category: string;
  address: string;
  distanceKm: number;
  rating: number;
  reviewsCount: number;
  co2SavedKg: number;
}
