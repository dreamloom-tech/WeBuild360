"use client";

import { useState, useEffect } from "react";
import fetchWithAuth from '@/lib/fetchWithAuth';
import { fetchProjectDropdownItems, ProjectDropdownItem } from '@/lib/fetchProjectDropdownItems';
import styles from "../inflow/inflow.module.css";
import InflowForm from "@/components/InflowForm";
import InflowList from "@/components/InflowList";

export default function InflowTablePage() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState({
    paymentDate: "",
    projectName: "",
    fundReceived: "",
    paymentMode: "",
    bankName: "",
    upiNumber: "",
    upiId: "",
    upiName: "",
    comments: "",
  });
  const [projects, setProjects] = useState<ProjectDropdownItem[]>([]);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await fetchProjectDropdownItems();
          if (mounted) setProjects(items);
        } catch {}
      })();
      return () => { mounted = false; };
    }, []);

    const loadRecords = async () => {
      try {
        const res = await fetchWithAuth('/api/inflows/table-route');
        if (!res.ok) return;
        const data = await res.json();
        setRecords(data || []);
      } catch {}
    };

    useEffect(() => { loadRecords(); }, []);

    // Auto-clear toast after show
    useEffect(() => {
      if (!toast) return;
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }, [toast]);

    const resetForm = () => {
    setFormData({ paymentDate: "", projectName: "", fundReceived: "", paymentMode: "", bankName: "", upiNumber: "", upiId: "", upiName: "", comments: "" });
      setShowModal(false);
      setEditingId(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (item: any) => {
      setEditingId(item._id);
      setFormData({
    paymentDate: item.paymentDate || "",
    projectName: item.projectName || "",
    fundReceived: item.fundReceived || "",
    paymentMode: item.paymentMode || "",
    bankName: item.bankName || "",
    upiNumber: item.upiNumber || "",
    upiId: item.upiId || "",
    upiName: item.upiName || "",
    comments: item.comments || "",
      });
      setShowModal(true);
    };

    const handleDelete = async (id: string) => {
      if (!confirm('Are you sure you want to delete this inflow?')) return;
      try {
        const res = await fetchWithAuth(`/api/inflows/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) {
          setToast({ type: 'error', message: data.error || 'Failed to delete' });
          return;
        }
        setRecords(prev => prev.filter(r => r._id !== id));
        setToast({ type: 'success', message: 'Inflow deleted successfully' });
      } catch {
        setToast({ type: 'error', message: 'Delete failed' });
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const payload = { ...formData, fundReceived: Number(formData.fundReceived) };
      try {
        const endpoint = editingId ? `/api/inflows/${editingId}` : '/api/inflows';
        const method = editingId ? 'PUT' : 'POST';
        const res = await fetchWithAuth(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save inflow');
        if (editingId) {
          setRecords(prev => prev.map(r => r._id === editingId ? data : r));
          setToast({ type: 'success', message: 'Inflow updated successfully' });
        } else {
          setRecords(prev => [...prev, data]);
          setToast({ type: 'success', message: 'Inflow created successfully' });
        }
        resetForm();
      } catch (err: any) {
        setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save inflow' });
      }
    };

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Fund Inflows</h2>
          <button className={styles.addBtn} onClick={() => setShowModal(true)}>+ Add Inflow</button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Date</th>
                <th>Project</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Bank</th>
                <th>UPI App</th>
                <th>UPI ID</th>
                <th>Comments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={10} className={styles.empty}>No inflow records found.</td>
                </tr>
              ) : records.map((item, idx) => (
                <tr key={item._id || idx}>
                  <td>{idx + 1}</td>
                  <td>{item.paymentDate?.slice(0, 10)}</td>
                  <td>{item.projectName}</td>
                  <td>{item.fundReceived}</td>
                  <td>{item.paymentMode}</td>
                  <td>{item.bankName}</td>
                  <td>{item.upiApp}</td>
                  <td>{item.upiId}</td>
                  <td>{item.comments}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={styles.actionButton} title="Edit" onClick={() => handleEdit(item)}>
                        Edit
                      </button>
                      <button className={styles.actionButton} title="Delete" onClick={() => handleDelete(item._id)}>
                        Delete
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
              <h3>{editingId ? 'Edit Inflow' : 'New Inflow'}</h3>
              <form onSubmit={handleSubmit} className={styles.formGrid}>
                <div>
                  <label>Date</label>
                  <input type="date" name="paymentDate" value={formData.paymentDate} onChange={handleChange} required />
                </div>
                <div>
                  <label>Project</label>
                  <select name="projectName" value={formData.projectName} onChange={handleChange} required>
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label>Amount</label>
                  <input type="number" name="fundReceived" value={formData.fundReceived} onChange={handleChange} required />
                </div>
                <div>
                  <label>Payment Mode</label>
                  <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} required>
                    <option value="">Select Mode</option>
                    <option value="Bank">Bank</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                {formData.paymentMode === 'Bank' && (
                  <div>
                    <label>Bank Name</label>
                    <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} required />
                  </div>
                )}
                {formData.paymentMode === 'UPI' && (
                  <>
                    <div>
                      <label>UPI Number</label>
                      <input type="text" name="upiNumber" value={formData.upiNumber} onChange={handleChange} required />
                    </div>
                    <div>
                      <label>UPI Name</label>
                      <input type="text" name="upiName" value={formData.upiName} onChange={handleChange} required />
                    </div>
                    <div>
                      <label>UPI ID (optional)</label>
                      <input type="text" name="upiId" value={formData.upiId} onChange={handleChange} />
                    </div>
                  </>
                )}
                <div className={styles['span-2']}>
                  <label>Comments</label>
                  <textarea name="comments" value={formData.comments} onChange={handleChange} />
                </div>
                <div className={styles.buttonContainer}>
                  <button type="submit" className={styles.submitBtn}>{editingId ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {toast && (
          <div className={`${styles.toast} ${toast.type === 'success' ? styles.success : ''}`} role="status">
            <div>{toast.message}</div>
          </div>
        )}
      </div>
    );
  }
