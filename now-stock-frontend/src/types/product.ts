export interface Product {
  id: number;
  tagId: string;
  identifier: string;
  name: string;
  description: string | null;
  quantity: number;
  location: string | null;
  createdAt: string;
  updatedAt: string;
}