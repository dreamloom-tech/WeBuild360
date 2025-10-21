"use client";

import { useState, useEffect } from "react";
import { fetchProjectDropdownItems, ProjectDropdownItem } from '@/lib/fetchProjectDropdownItems';
import fetchWithAuth from '@/lib/fetchWithAuth';
import styles from "./transfer.module.css";

export default function TransferStock() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<any | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    fromProject: "",
    toProject: "",
    category: "",
    subCategory: "",
    price: "",
    quantity: "",
  });

  const [categories, setCategories] = useState<{ type: string; shop: string }[]>([]);
  const [subCategories, setSubCategories] = useState<{ name: string; category: string; shop: string; unit: string }[]>([]);
  const [projects, setProjects] = useState<ProjectDropdownItem[]>([]);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/material-menus');
        const json = await res.json();
        if (mounted && json) {
          setCategories(json.categories || []);
          setSubCategories(json.subCategories || []);
        }
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await fetchProjectDropdownItems();
        if (mounted) setProjects(items);
      } catch (err) { }
    })();
    return () => { mounted = false; };
  }, []);

  const loadRecords = async () => {
    try {
      const res = await fetchWithAuth('/api/material-transfers');
      if (!res.ok) return;
      const data = await res.json();
      setRecords(data || []);
    } catch (err) {
      // ignore
    }
  };

  // Auto-clear toast after show
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => { loadRecords(); }, []);

  const resetForm = () => {
    setFormData({ date: "", fromProject: "", toProject: "", category: "", subCategory: "", price: "", quantity: "" });
    setShowModal(false);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleView = async (id: string) => {
    setViewing('loading');
    try {
      const res = await fetchWithAuth(`/api/material-transfers/${id}`);
      if (!res.ok) {
        setViewing(null);
        return;
      }
      const data = await res.json();
      setViewing(data);
    } catch (err) {
      setViewing(null);
      console.error('View failed', err);
      setToast({ type: 'error', message: 'Unable to load details' });
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item._id);
    setFormData({ date: item.date || "", fromProject: item.fromProject || "", toProject: item.toProject || "", category: item.category || "", subCategory: item.subCategory || "", price: item.price || "", quantity: item.quantity || "" });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetchWithAuth(`/api/material-transfers/${deleteTarget}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: 'error', message: data.error || 'Failed to delete' });
        setDeleteTarget(null);
        return;
      }
      setRecords(prev => prev.filter(r => r._id !== deleteTarget));
      setToast({ type: 'success', message: 'Transfer deleted successfully' });
    } catch (err) {
      setToast({ type: 'error', message: 'Delete failed' });
    }
    setDeleteTarget(null);
  };

  // ...existing code...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = (Number(formData.price) || 0) * (Number(formData.quantity) || 0);
    const payload = { ...formData, total };

    try {
      const endpoint = editingId ? `/api/material-transfers/${editingId}` : '/api/material-transfers';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetchWithAuth(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save transfer');

      if (editingId) {
        const updated = data.data || { ...payload, _id: editingId };
        setRecords(prev => prev.map(r => r._id === editingId ? updated : r));
        setToast({ type: 'success', message: 'Transfer updated successfully' });
      } else {
        const created = data.data || data;
        setRecords(prev => [...prev, created]);
        setToast({ type: 'success', message: 'Transfer created successfully' });
      }

      resetForm();
    } catch (err) {
      console.error('Save failed', err);
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save transfer' });
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Transfer Stock</h2>
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>+ Transfer</button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>From</th>
              <th>To</th>
              <th>Category</th>
              <th>Sub Category</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={10} className={styles.empty}>No transfer records found.</td>
              </tr>
            ) : records.map((item, idx) => (
              <tr key={item._id || idx}>
                <td>{idx + 1}</td>
                <td>{item.date}</td>
                <td>{item.fromProject}</td>
                <td>{item.toProject}</td>
                <td>{item.category}</td>
                <td>{item.subCategory}</td>
                <td>{item.unit || 'Unit'}</td>
                <td>{item.price}</td>
                <td>{item.total}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button className={`${styles.actionButton} ${styles.view}`} title="View" onClick={() => handleView(item._id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <button className={`${styles.actionButton} ${styles.edit}`} title="Edit" onClick={() => handleEdit(item)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button className={`${styles.actionButton} ${styles.delete}`} title="Delete" onClick={() => handleDelete(item._id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button type="button" onClick={resetForm} className={styles.closeBtn}>&times;</button>
            <h3>{editingId ? 'Edit Transfer' : 'New Transfer'}</h3>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div>
                <label>Transaction Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required />
              </div>
              <div>
                <label>From Project</label>
                <select name="fromProject" value={formData.fromProject} onChange={handleChange} required>
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label>To Project</label>
                <select name="toProject" value={formData.toProject} onChange={handleChange} required>
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  {categories.map((c, i) => <option key={i} value={c.type}>{c.type}</option>)}
                </select>
              </div>

              <div>
                <label>Sub Category</label>
                <select name="subCategory" value={formData.subCategory} onChange={handleChange} required>
                  <option value="">Select Sub Category</option>
                  {subCategories.filter(s => s.category === formData.category).map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label>Per Item Price</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Enter price" required />
              </div>

              <div className={styles['span-3']}>
                <label>Quantity</label>
                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Enter quantity" required />
              </div>

              <div className={styles.buttonContainer}>
                <button type="submit" className={styles.submitBtn}>{editingId ? 'Update' : 'Transfer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View modal */}
      {viewing && (
        <div className={styles.modalOverlay}>
          <div className={styles.viewModal}>
            <button type="button" onClick={() => setViewing(null)} className={styles.closeBtn}>&times;</button>
            <h3 className={styles.viewTitle}>Transfer Details</h3>
            {viewing === 'loading' ? (
              <div className={styles.loadingSpinner}></div>
            ) : (
              <div className={styles.viewContent}>
                <div className={styles.viewRow}><label>Date</label><div className={styles.viewValue}>{viewing.date}</div></div>
                <div className={styles.viewRow}><label>From</label><div className={styles.viewValue}>{viewing.fromProject}</div></div>
                <div className={styles.viewRow}><label>To</label><div className={styles.viewValue}>{viewing.toProject}</div></div>
                <div className={styles.viewRow}><label>Category</label><div className={styles.viewValue}>{viewing.category}</div></div>
                <div className={styles.viewRow}><label>Sub Category</label><div className={styles.viewValue}>{viewing.subCategory}</div></div>
                <div className={styles.viewRow}><label>Price</label><div className={styles.viewValue}>{viewing.price}</div></div>
                <div className={styles.viewRow}><label>Quantity</label><div className={styles.viewValue}>{viewing.quantity}</div></div>
                <div className={styles.viewRow}><label>Total</label><div className={styles.viewValue}>{viewing.total}</div></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ minWidth: 340, textAlign: 'center' }}>
            <button type="button" onClick={() => setDeleteTarget(null)} className={styles.closeBtn}>&times;</button>
            <h3 style={{ marginBottom: 18 }}>Are you sure you want to delete this transfer?</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 18 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: '8px 22px', borderRadius: 6, border: '1px solid #ccc', background: '#f8f8f8', color: '#333', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ padding: '8px 22px', borderRadius: 6, border: 'none', background: '#ff4444', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.success : ''}`} role="status">
          <div>{toast.message}</div>
        </div>
      )}
    </div>
  );
}




//   const handleChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
//     >
//   ) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const total = (Number(formData.price) || 0) * (Number(formData.quantity) || 0);

//     const newRecord = {
//       date: formData.date,
//       fromProject: formData.fromProject,
//       toProject: formData.toProject,
//       category: formData.category,
//       subCategory: formData.subCategory,
//       price: formData.price,
//       quantity: formData.quantity,
//       total: total,
//       comments: formData.comments,
//     };

//     setRecords([...records, newRecord]);
//     setFormData({
//       date: "",
//       fromProject: "",
//       toProject: "",
//       category: "",
//       subCategory: "",
//       price: "",
//       quantity: "",
//       comments: "",
//     });
//     setShowModal(false);
//   };

// }
