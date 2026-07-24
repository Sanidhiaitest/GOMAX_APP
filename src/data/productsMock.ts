import { Ionicons } from '@expo/vector-icons';

export type ProductCategory = 'Adhesive' | 'Waterproofing' | 'Putty' | 'Cement' | 'Mortar';

export type CatalogProduct = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  usedFor: string[];
};

export const CATEGORY_COLOR: Record<ProductCategory, { bg: string; fg: string }> = {
  Adhesive: { bg: '#fff4ec', fg: '#c05336' },
  Waterproofing: { bg: '#eaf6fb', fg: '#1e7fa8' },
  Putty: { bg: '#f2eefc', fg: '#6b4fc0' },
  Cement: { bg: '#eef1f4', fg: '#4a5568' },
  Mortar: { bg: '#fff8e6', fg: '#b8860b' },
};

export const catalogProducts: CatalogProduct[] = [
  {
    id: 'p1',
    name: 'GoMax Tile Adhesive',
    category: 'Adhesive',
    price: 450,
    unit: '20kg bag',
    icon: 'grid-outline',
    description: 'High-bond polymer adhesive for ceramic, vitrified & natural stone tiles.',
    usedFor: ['Floor tiles', 'Wall tiles', 'Vitrified'],
  },
  {
    id: 'p2',
    name: 'GoMax Waterproofing',
    category: 'Waterproofing',
    price: 275,
    unit: '5kg bag',
    icon: 'water-outline',
    description: 'Crystalline waterproof coating for terraces, bathrooms & water tanks.',
    usedFor: ['Terrace', 'Bathroom', 'Water tank'],
  },
  {
    id: 'p3',
    name: 'GoMax Wall Putty',
    category: 'Putty',
    price: 380,
    unit: '40kg bag',
    icon: 'brush-outline',
    description: 'White cement-based putty for a smooth, paint-ready wall finish.',
    usedFor: ['Interior walls', 'Exterior walls'],
  },
  {
    id: 'p4',
    name: 'GoMax White Cement',
    category: 'Cement',
    price: 210,
    unit: '5kg bag',
    icon: 'cube-outline',
    description: 'Premium white cement for tile joints, art work & decorative finishes.',
    usedFor: ['Tile joints', 'Decorative work'],
  },
  {
    id: 'p5',
    name: 'GoMax Block Jointing Mortar',
    category: 'Mortar',
    price: 340,
    unit: '20kg bag',
    icon: 'layers-outline',
    description: 'Thin-bed mortar for AAC block masonry — faster than traditional mortar.',
    usedFor: ['AAC blocks', 'Masonry'],
  },
];
