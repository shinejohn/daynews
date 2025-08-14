export interface Seller {
  name: string;
  rating: number;
  memberSince: string;
  responseRate: number;
  responseTime: string;
}

export interface Classified {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  price: number;
  priceType?: string;
  location: string;
  postedDate: string;
  description: string;
  images: string[];
  featured: boolean;
  condition?: string;
  seller: Seller;
}

export type CategoryFilter = 'all' | 'forSale' | 'housing' | 'jobs' | 'services' | 'community';