export interface Category {
  _id?: string;
  type: string;
  shop: string;
  createdAt?: Date;
}

export interface SubCategory {
  _id?: string;
  name: string;
  category: string;
  shop: string;
  grade: string;
  unit: string;
  createdAt?: Date;
}

export const fetchCategoryData = async () => {
  try {
    const response = await fetch('/api/categories');
    if (!response.ok) {
      throw new Error('Failed to fetch categories data');
    }
    const data = await response.json();
    return {
      categories: data.categories || [],
      subcategories: data.subcategories || []
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { categories: [], subcategories: [] };
  }
};

export const getUniqueShops = (categories: Category[]) => {
  return [...new Set(categories.map(cat => cat.shop))];
};

export const getCategoriesByShop = (categories: Category[], shop: string) => {
  return categories.filter(cat => cat.shop === shop);
};

export const getSubcategoriesByCategory = (subcategories: SubCategory[], category: string) => {
  return subcategories.filter(sub => sub.category === category);
};