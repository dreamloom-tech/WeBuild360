// categories/page.tsx

"use client";
import { useState, useEffect } from "react";
import styles from "../categories/category.module.css";

interface Category {
  _id?: string;
  type: string;
  shop: string;
  createdAt?: Date;
}

interface SubCategory {
  _id?: string;
  name: string;
  category: string;
  shop: string;
  grade: string;
  unit: string;
  createdAt?: Date;
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const [catForm, setCatForm] = useState({ type: "", shop: "" });
  const [subForm, setSubForm] = useState({ name: "", category: "", shop: "", grade: "", unit: "" });
  const [error, setError] = useState("");

  // Fetch all data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setCategories(data.categories || []);
      setSubCategories(data.subcategories || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Replace separate fetch functions with single fetchData
  const fetchCategories = fetchData;
  const fetchSubCategories = fetchData;

  const [catPage, setCatPage] = useState(1);
  const [subPage, setSubPage] = useState(1);
  const itemsPerPage = 5;

  const unitOptions = [
    "Bag", "Box", "Cft", "Cubic Meter", "Feet", "Kg", "Litre", "Meter", "Nos", "Packet", "Piece", "Roll", "Sqft", "Ton"
  ];

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.type || !catForm.shop) return alert("Please fill all fields!");
    
    try {
      setLoading(true);
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(catForm),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      await fetchCategories();
      setCatForm({ type: "", shop: "" });
    } catch (err: any) {
      setError(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.name || !subForm.category || !subForm.shop || !subForm.unit)
      return alert("Please fill all required fields!");
    
    try {
      setLoading(true);
      const response = await fetch('/api/categories?type=sub', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subForm),
      });

      if (!response.ok) {
        throw new Error('Failed to create subcategory');
      }

      await fetchSubCategories();
      setSubForm({ name: "", category: "", shop: "", grade: "", unit: "" });
    } catch (err: any) {
      setError(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
  const paginatedCategories = categories.slice((catPage - 1) * itemsPerPage, catPage * itemsPerPage);
  const totalCatPages = Math.ceil(categories.length / itemsPerPage);

  const paginatedSubs = subCategories.slice((subPage - 1) * itemsPerPage, subPage * itemsPerPage);
  const totalSubPages = Math.ceil(subCategories.length / itemsPerPage);

  const handleDeleteCategory = async (type: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/categories?type=${type}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      await fetchCategories();
    } catch (err: any) {
      setError(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/categories?type=sub&id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete subcategory');
      }

      await fetchSubCategories();
    } catch (err: any) {
      setError(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Material Categories</h2>
      {error && <div className={styles.error}>{error}</div>}

      {/* Category Form */}
      <form className={styles.formBox} onSubmit={handleCategorySubmit}>
        <h3 className={styles.subTitle}>Add Category</h3>
        <div className={styles.formGrid}>
          <input
            type="text"
            placeholder="Category Type"
            value={catForm.type}
            onChange={(e) => setCatForm({ ...catForm, type: e.target.value })}
          />
          <input
            type="text"
            placeholder="Shop Name"
            value={catForm.shop}
            onChange={(e) => setCatForm({ ...catForm, shop: e.target.value })}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Category'}
          </button>
        </div>
      </form>

      {/* Subcategory Form */}
      <form className={styles.formBox} onSubmit={handleSubCategorySubmit}>
        <h3 className={styles.subTitle}>Add Subcategory</h3>
        <div className={styles.formGrid}>
          <input
            type="text"
            placeholder="Subcategory Name"
            value={subForm.name}
            onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
          />

          <select
            value={subForm.category}
            onChange={(e) => setSubForm({ ...subForm, category: e.target.value })}
          >
            <option value="">Select Category</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat.type}>{cat.type}</option>
            ))}
          </select>

          <select
            value={subForm.shop}
            onChange={(e) => setSubForm({ ...subForm, shop: e.target.value })}
          >
            <option value="">Select Shop</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat.shop}>{cat.shop}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Grade"
            value={subForm.grade}
            onChange={(e) => setSubForm({ ...subForm, grade: e.target.value })}
          />

          <select
            value={subForm.unit}
            onChange={(e) => setSubForm({ ...subForm, unit: e.target.value })}
          >
            <option value="">Select Unit</option>
            {unitOptions.map((unit, i) => (
              <option key={i} value={unit}>{unit}</option>
            ))}
          </select>

          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Subcategory'}
          </button>
        </div>
      </form>

      {/* Data Preview */}
      <div className={styles.previewBox}>
        <h3 className={styles.subTitle}>Preview Data</h3>

        {/* Category Table */}
        <div className={styles.tableWrapper}>
          <h4>Categories</h4>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Category Type</th>
                <th>Shop Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className={styles.emptyRow}>Loading...</td>
                </tr>
              ) : paginatedCategories.length ? (
                paginatedCategories.map((cat, i) => (
                  <tr key={i}>
                    <td>{(catPage - 1) * itemsPerPage + i + 1}</td>
                    <td>{cat.type}</td>
                    <td>{cat.shop}</td>
                    <td>
                      <button 
                        onClick={() => handleDeleteCategory(cat.type)}
                        className={styles.deleteBtn}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className={styles.emptyRow}>No categories added</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalCatPages > 1 && (
            <div className={styles.pagination}>
              <button disabled={catPage === 1} onClick={() => setCatPage(catPage - 1)}>Prev</button>
              <span>Page {catPage} of {totalCatPages}</span>
              <button disabled={catPage === totalCatPages} onClick={() => setCatPage(catPage + 1)}>Next</button>
            </div>
          )}
        </div>

        {/* Subcategory Table */}
        <div className={styles.tableWrapper}>
          <h4>Subcategories</h4>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Subcategory Name</th>
                <th>Category</th>
                <th>Shop</th>
                <th>Grade</th>
                <th>Unit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className={styles.emptyRow}>Loading...</td>
                </tr>
              ) : paginatedSubs.length ? (
                paginatedSubs.map((sub, i) => (
                  <tr key={i}>
                    <td>{(subPage - 1) * itemsPerPage + i + 1}</td>
                    <td>{sub.name}</td>
                    <td>{sub.category}</td>
                    <td>{sub.shop}</td>
                    <td>{sub.grade || "-"}</td>
                    <td>{sub.unit}</td>
                    <td>
                      <button 
                        onClick={() => handleDeleteSubCategory(sub._id!)}
                        className={styles.deleteBtn}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={styles.emptyRow}>No subcategories added</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalSubPages > 1 && (
            <div className={styles.pagination}>
              <button disabled={subPage === 1} onClick={() => setSubPage(subPage - 1)}>Prev</button>
              <span>Page {subPage} of {totalSubPages}</span>
              <button disabled={subPage === totalSubPages} onClick={() => setSubPage(subPage + 1)}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
