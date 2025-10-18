// categories/page.tsx

"use client";
import { useState } from "react";
import styles from "../categories/category.module.css";

export default function CategoryPage() {
  const [categories, setCategories] = useState<{ type: string; shop: string }[]>([]);
  const [subCategories, setSubCategories] = useState<
    { name: string; category: string; shop: string; grade: string; unit: string }[]
  >([]);

  const [catForm, setCatForm] = useState({ type: "", shop: "" });
  const [subForm, setSubForm] = useState({ name: "", category: "", shop: "", grade: "", unit: "" });

  const [catPage, setCatPage] = useState(1);
  const [subPage, setSubPage] = useState(1);
  const itemsPerPage = 5;

  const unitOptions = [
    "Bag", "Box", "Cft", "Cubic Meter", "Feet", "Kg", "Litre", "Meter", "Nos", "Packet", "Piece", "Roll", "Sqft", "Ton"
  ];

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.type || !catForm.shop) return alert("Please fill all fields!");
    setCategories([...categories, { ...catForm }]);
    setCatForm({ type: "", shop: "" });
  };

  const handleSubCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.name || !subForm.category || !subForm.shop || !subForm.unit)
      return alert("Please fill all required fields!");
    setSubCategories([...subCategories, { ...subForm }]);
    setSubForm({ name: "", category: "", shop: "", grade: "", unit: "" });
  };

  // Pagination Logic
  const paginatedCategories = categories.slice((catPage - 1) * itemsPerPage, catPage * itemsPerPage);
  const totalCatPages = Math.ceil(categories.length / itemsPerPage);

  const paginatedSubs = subCategories.slice((subPage - 1) * itemsPerPage, subPage * itemsPerPage);
  const totalSubPages = Math.ceil(subCategories.length / itemsPerPage);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Material Categories</h2>

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
          <button type="submit">Add Category</button>
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

          <button type="submit">Add Subcategory</button>
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
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.length ? (
                paginatedCategories.map((cat, i) => (
                  <tr key={i}>
                    <td>{(catPage - 1) * itemsPerPage + i + 1}</td>
                    <td>{cat.type}</td>
                    <td>{cat.shop}</td>
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
              </tr>
            </thead>
            <tbody>
              {paginatedSubs.length ? (
                paginatedSubs.map((sub, i) => (
                  <tr key={i}>
                    <td>{(subPage - 1) * itemsPerPage + i + 1}</td>
                    <td>{sub.name}</td>
                    <td>{sub.category}</td>
                    <td>{sub.shop}</td>
                    <td>{sub.grade || "-"}</td>
                    <td>{sub.unit}</td>
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
