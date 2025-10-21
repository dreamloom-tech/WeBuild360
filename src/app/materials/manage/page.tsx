"use client";
import { useState, useEffect, useRef } from "react";
import fetchWithAuth from '@/lib/fetchWithAuth';
import { fetchProjectDropdownItems, ProjectDropdownItem } from '@/lib/fetchProjectDropdownItems';
import styles from "../manage/manageStock.module.css";
import { FaTrash, FaEye, FaUpload, FaPlus, FaFileUpload, FaTimes, FaCheckCircle, FaTimesCircle, FaEdit } from "react-icons/fa";

export default function ManageStockPage() {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; row: any; tab?: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation: Used + Returned quantity must not exceed Purchased quantity
    if (eventType === 'Used' || eventType === 'Return') {
      const project = form.project;
      const category = form.category;
      const requestedQty = Number(form.quantity);
      // Find purchased quantity for this project/category
      const purchasedQty = purchases
        .filter(p => p.project === project && p.category === category)
        .reduce((sum, p) => sum + Number(p.quantity), 0);
      // Find already used quantity for this project/category
      const usedQty = uses
        .filter(u => u.project === project && u.category === category)
        .reduce((sum, u) => sum + Number(u.quantity), 0);
      // Find already returned quantity for this project/category
      const returnedQty = returns
        .filter(r => r.project === project && r.category === category)
        .reduce((sum, r) => sum + Number(r.quantity), 0);
      const availableQty = purchasedQty - usedQty - returnedQty;
      if (requestedQty > availableQty) {
        alert(`Requested quantity (${requestedQty}) exceeds available (${availableQty}).`);
        return;
      }
    }
    (async () => {
      try {
        const total = Number(form.price) * Number(form.quantity);
        const payload = { type: eventType, ...form, total, creditedAt: new Date().toLocaleDateString() };
        // choose endpoint based on event type
        const endpoint = eventType === 'Purchase' ? '/api/materials/purchase-details'
          : eventType === 'Used' ? '/api/materials/use-details'
          : '/api/materials/return-details';
        const res = await fetchWithAuth(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed');
        // update corresponding local state
        if (eventType === 'Purchase') setPurchases((p) => [...p, json]);
        if (eventType === 'Used') setUses((u) => [...u, json]);
        if (eventType === 'Return') setReturns((r) => [...r, json]);
        setTransactions((t) => [...t, json]);
        setShowPopup(false);
      } catch (err: any) {
        alert(err.message || 'Error');
      }
    })();
    setForm({
      date: "",
      project: "",
      category: "",
      subcategory: "",
      shop: "",
      price: "",
      quantity: "",
      unit: "",
      comments: "",
    });
  };

  const [eventType, setEventType] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [uses, setUses] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("Purchase");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => { setCurrentPage(1); }, [activeTab]);

  const [categories, setCategories] = useState<{ type: string; shop: string }[]>([]);
  const [subCategories, setSubCategories] = useState<{ name: string; category: string; shop: string; unit: string }[]>([]);
  const [shops, setShops] = useState<{ name: string }[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/material-menus');
        const json = await res.json();
        if (mounted && json) {
          setCategories(json.categories || []);
          setSubCategories(json.subCategories || []);
          setShops(json.shops || []);
        }
      } catch (err) {}
    })();
    return () => { mounted = false; };
  }, []);

  const [form, setForm] = useState({
    date: "",
    project: "",
    category: "",
    subcategory: "",
    shop: "",
    price: "",
    quantity: "",
    unit: "",
    comments: "",
  });
  const [projects, setProjects] = useState<ProjectDropdownItem[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await fetchProjectDropdownItems();
        if (mounted) setProjects(items);
      } catch (err) {}
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const endpoints = [
          '/api/materials/purchase-details',
          '/api/materials/use-details',
          '/api/materials/return-details',
        ];
        const calls = endpoints.map((ep) => fetchWithAuth(ep).then((r) => r.json()).catch(() => []));
        const [pJson, uJson, rJson] = await Promise.all(calls);
        if (mounted) {
          setPurchases(Array.isArray(pJson) ? pJson : []);
          setUses(Array.isArray(uJson) ? uJson : []);
          setReturns(Array.isArray(rJson) ? rJson : []);
          setTransactions([...(Array.isArray(pJson) ? pJson : []), ...(Array.isArray(uJson) ? uJson : []), ...(Array.isArray(rJson) ? rJson : [])]);
        }
      } catch (err) {
        try {
          const res = await fetchWithAuth('/api/material-transfers');
          const json = await res.json();
          if (mounted && Array.isArray(json)) setTransactions(json);
        } catch (e) {}
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Helper to get API endpoint by tab/type
  function getEndpointByTab(tab: 'Purchase' | 'Used' | 'Return' | string): string {
    if (tab === 'Purchase') return '/api/materials/purchase-details';
    if (tab === 'Used') return '/api/materials/use-details';
    if (tab === 'Return') return '/api/materials/return-details';
    return '';
  }
  function handleView(row: any) {
    setSelectedRow(row);
    setShowViewModal(true);
  }

  function openReceiptInNewTab(url?: string) {
    const u = url || selectedRow?.receiptUrl;
    if (!u) return;
    // open absolute or relative path
    if (u.startsWith('http')) window.open(u, '_blank');
    else window.open(u, '_blank');
  }

  function handleUpload(row: any) {
    setSelectedRow(row);
    setShowUploadModal(true);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceipt(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!receipt || !selectedRow) return;
    try {
      // convert to base64
      const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64 = await toBase64(receipt);
      const payload = {
        recordId: selectedRow._id,
        type: selectedRow.type || activeTab || 'Purchase',
        filename: receipt.name,
        data: base64,
      };

      const res = await fetchWithAuth('/api/materials/upload-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.updated) {
        const updated = json.updated;
        setSelectedRow(updated);
        if (updated.type === 'Purchase' || activeTab === 'Purchase') setPurchases((arr) => arr.map(a => a._id === updated._id ? updated : a));
        if (updated.type === 'Used' || activeTab === 'Used') setUses((arr) => arr.map(a => a._id === updated._id ? updated : a));
        if (updated.type === 'Return' || activeTab === 'Return') setReturns((arr) => arr.map(a => a._id === updated._id ? updated : a));
  setStatusMessage({ text: 'Receipt uploaded successfully', type: 'success' });
  setTimeout(() => setStatusMessage(null), 3000);
        setShowUploadModal(false);
        setReceipt(null);
      } else {
  setStatusMessage({ text: 'Failed to upload receipt: ' + (json.error || 'Unknown'), type: 'error' });
  setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (error) {
  setStatusMessage({ text: 'Error uploading receipt', type: 'error' });
  setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  async function handleDeleteConfirmed(row: any, tab: string) {
    const endpoint = getEndpointByTab(tab);
    try {
      const res = await fetchWithAuth(`${endpoint}?id=${row._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.deleted === 1) {
        if (tab === 'Purchase') setPurchases((arr) => arr.filter((r) => r._id !== row._id));
        if (tab === 'Used') setUses((arr) => arr.filter((r) => r._id !== row._id));
        if (tab === 'Return') setReturns((arr) => arr.filter((r) => r._id !== row._id));
  setStatusMessage({ text: 'Record deleted successfully', type: 'success' });
  setTimeout(() => setStatusMessage(null), 3000);
      } else {
  setStatusMessage({ text: 'Delete failed', type: 'error' });
  setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
  setStatusMessage({ text: 'Delete error', type: 'error' });
  setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setConfirmDelete(null);
    }
  }

  function requestDelete(row: any, tab: string) {
    setConfirmDelete({ open: true, row, tab });
  }

  // Table data logic
  const tableData = activeTab === 'Purchase' ? purchases : activeTab === 'Used' ? uses : returns;
  const paginatedData = tableData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  return (
    <div className={styles.container}>
       <h2 className={styles.title}>Manage Stock</h2>
      <div className={styles.headerRow}>
       
        <div className={styles.tabContainer}>
          {['Purchase', 'Used', 'Return'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                styles.tabBtn +
                (activeTab === tab ? ' ' + styles.active : '')
              }
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          className={styles.eventBtn}
          onClick={() => setShowPopup(true)}
        >
          <FaPlus /> Event Type
        </button>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3>Add Event Type Entry</h3>
              <button className={styles.closeBtn} onClick={() => setShowPopup(false)}>✕</button>
            </div>

            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className={styles.selectType}
            >
              <option value="">Select Type</option>
              <option value="Purchase">Purchase</option>
              <option value="Used">Used</option>
              <option value="Return">Return</option>
            </select>

            {eventType && (
                <form onSubmit={handleSubmit} className={styles.editForm}>
                <div className={styles.formGrid}>
                  {/* Common fields */}
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  <select value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}>
                    <option value="">Select Project</option>
                    {projects.map((p) => <option key={p._id} value={p.name}>{p.name}</option>)}
                  </select>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select Category</option>
                    {categories.map((c, i) => <option key={i} value={c.type}>{c.type}</option>)}
                  </select>
                  <select value={form.shop} onChange={(e) => setForm({ ...form, shop: e.target.value })}>
                    <option value="">Select Shop</option>
                    {shops.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                  </select>
                  <select value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })}>
                    <option value="">Select Subcategory</option>
                    {subCategories.filter(sub => sub.category === form.category && sub.shop === form.shop).map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                  </select>

                  {/* Conditionally render fields based on eventType */}
                  {(eventType === 'Purchase' || eventType === 'Return') && (
                    <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  )}
                  <input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                  <textarea placeholder="Comments" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })}></textarea>
                </div>

                    <button type="submit" className={styles.editSubmitBtn}>Add {eventType}</button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className={styles.tableWrapper}>
        {activeTab === 'Purchase' && (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Purchase Date</th>
                <th>Project Name</th>
                <th>Shop Name</th>
                <th>Category</th>
                <th>Total Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length ? (
                paginatedData.map((row, i) => (
                  <tr key={i}>
                    <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                    <td>{row.creditedAt}</td>
                    <td>{row.project}</td>
                    <td>{row.shop}</td>
                    <td>{row.category}</td>
                    <td>{row.total}</td>
                    <td className={styles.actionBtns}>
                      <FaEye onClick={() => handleView(row)} style={{ cursor: 'pointer', }} title="View Receipt" />
                      <FaUpload onClick={() => handleUpload(row)} style={{ cursor: 'pointer' }} title="Upload Receipt" />
                      <FaEdit onClick={() => { setSelectedRow(row); setShowEditModal(true); }} style={{ cursor: 'pointer' }} title="Edit" />
                      <FaTrash onClick={() => requestDelete(row, 'Purchase')} style={{ cursor: 'pointer' }} title="Delete" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className={styles.emptyRow}>
                    No purchase records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        {activeTab === 'Used' && (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Project Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length ? (
                paginatedData.map((row, i) => (
                  <tr key={i}>
                    <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                    <td>{row.project}</td>
                    <td>{row.category}</td>
                    <td>{row.quantity}</td>
                    <td>{row.total}</td>
                      <td className={styles.actionBtns}>
                      <FaEye onClick={() => handleView(row)} style={{ cursor: 'pointer', }} title="View Receipt" />
                      <FaUpload onClick={() => handleUpload(row)} style={{ cursor: 'pointer' }} title="Upload Receipt" />
                      <FaEdit onClick={() => { setSelectedRow(row); setShowEditModal(true); }} style={{ cursor: 'pointer' }} title="Edit" />
                      <FaTrash onClick={() => requestDelete(row, 'Used')} style={{ cursor: 'pointer' }} title="Delete" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className={styles.emptyRow}>
                    No used records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        {activeTab === 'Return' && (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Return Date</th>
                <th>Project Name</th>
                <th>Shop Name</th>
                <th>Category</th>
                <th>Total Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length ? (
                paginatedData.map((row, i) => (
                  <tr key={i}>
                    <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                    <td>{row.creditedAt}</td>
                    <td>{row.project}</td>
                    <td>{row.shop}</td>
                    <td>{row.category}</td>
                    <td>{row.total}</td>
                      <td className={styles.actionBtns}>
                      <FaEye onClick={() => handleView(row)} style={{ cursor: 'pointer', }} title="View Receipt" />
                      <FaUpload onClick={() => handleUpload(row)} style={{ cursor: 'pointer' }} title="Upload Receipt" />
                      <FaEdit onClick={() => { setSelectedRow(row); setShowEditModal(true); }} style={{ cursor: 'pointer' }} title="Edit" />
                      <FaTrash onClick={() => requestDelete(row, 'Return')} style={{ cursor: 'pointer' }} title="Delete" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className={styles.emptyRow}>
                    No return records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
      {/* View Modal */}
      {showViewModal && selectedRow && (
        <div className={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>View Details</h3>
              <button className={styles.closeBtn} onClick={() => setShowViewModal(false)}>✕</button>
            </div>
            <div>
              <div className={styles.viewGrid}>
                {Object.entries(selectedRow).map(([key, value]) => (
                  key !== '_id' && key !== '__v' && (
                    <div className={styles.viewItem} key={key}>
                      <div className={styles.detailLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                      <div className={styles.detailValue}>{String(value)}</div>
                    </div>
                  )
                ))}
              </div>

              {selectedRow.receiptUrl && (
                <div className={styles.receiptPreview}>
                  <h4>Receipt</h4>
                  <img src={selectedRow.receiptUrl} alt="Receipt thumbnail" className={styles.thumbnailSmall} onClick={() => { setImagePreviewUrl(selectedRow.receiptUrl); setShowImageModal(true); }} style={{ cursor: 'pointer' }} />
                  <div style={{ fontSize: '0.9em', color: '#666', marginTop: 6 }}>Click thumbnail to open full preview</div>
                </div>
              )}

              {showImageModal && imagePreviewUrl && (
                <div className={styles.imageModalOverlay} onClick={() => setShowImageModal(false)}>
                  <div className={styles.imageModalBox} onClick={(e) => e.stopPropagation()}>
                    <button className={styles.closeBtn} onClick={() => setShowImageModal(false)}>✕</button>
                    <img src={imagePreviewUrl} alt="Full receipt" className={styles.thumbnailLarge} onClick={() => openReceiptInNewTab(imagePreviewUrl)} style={{ cursor: 'pointer' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedRow && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Edit Record</h3>
              <button className={styles.closeBtn} onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form
              className={styles.editForm}
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const price = Number(formData.get('price')) || selectedRow.price;
                const quantity = Number(formData.get('quantity')) || selectedRow.quantity;
                const updated = {
                  id: selectedRow._id,
                  date: formData.get('date') || selectedRow.date,
                  project: formData.get('project') || selectedRow.project,
                  category: formData.get('category') || selectedRow.category,
                  shop: formData.get('shop') || selectedRow.shop,
                  subcategory: formData.get('subcategory') || selectedRow.subcategory,
                  price,
                  quantity,
                  total: (selectedRow.type === 'Purchase' || selectedRow.type === 'Return' || activeTab === 'Purchase' || activeTab === 'Return') ? price * quantity : undefined,
                  comments: formData.get('comments') || selectedRow.comments,
                };
                try {
                  const endpoint = getEndpointByTab(selectedRow.type || activeTab);
                  const res = await fetchWithAuth(endpoint, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updated),
                  });
                  const json = await res.json();
                  if (res.ok && json.updated) {
                    setSelectedRow(json.updated);
                    if (selectedRow.type === 'Purchase' || activeTab === 'Purchase') setPurchases((arr) => arr.map(a => a._id === json.updated._id ? json.updated : a));
                    if (selectedRow.type === 'Used' || activeTab === 'Used') setUses((arr) => arr.map(a => a._id === json.updated._id ? json.updated : a));
                    if (selectedRow.type === 'Return' || activeTab === 'Return') setReturns((arr) => arr.map(a => a._id === json.updated._id ? json.updated : a));
                    setStatusMessage({ text: 'Record updated successfully', type: 'success' });
                    setTimeout(() => setStatusMessage(null), 3000);
                    setShowEditModal(false);
                  } else {
                    setStatusMessage({ text: 'Failed to update record', type: 'error' });
                    setTimeout(() => setStatusMessage(null), 3000);
                  }
                } catch (err) {
                  setStatusMessage({ text: 'Error updating record', type: 'error' });
                  setTimeout(() => setStatusMessage(null), 3000);
                }
              }}
            >
              <div className={styles.formGrid}>
                <input name="date" type="date" defaultValue={selectedRow.date} className={styles.editInput} />
                <select name="project" defaultValue={selectedRow.project} className={styles.editInput}>
                  <option value="">Select Project</option>
                  {projects.map((p) => <option key={p._id} value={p.name}>{p.name}</option>)}
                </select>
                <select name="category" defaultValue={selectedRow.category} className={styles.editInput}>
                  <option value="">Select Category</option>
                  {categories.map((c, i) => <option key={i} value={c.type}>{c.type}</option>)}
                </select>
                <select name="shop" defaultValue={selectedRow.shop} className={styles.editInput}>
                  <option value="">Select Shop</option>
                  {shops.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                </select>
                <select name="subcategory" defaultValue={selectedRow.subcategory} className={styles.editInput}>
                  <option value="">Select Subcategory</option>
                  {subCategories.filter(sub => sub.category === (selectedRow.category || '') && sub.shop === (selectedRow.shop || '')).map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                </select>
                {(selectedRow.type === 'Purchase' || selectedRow.type === 'Return' || activeTab === 'Purchase' || activeTab === 'Return') && (
                  <input name="price" type="number" defaultValue={selectedRow.price} placeholder="Price" className={styles.editInput} />
                )}
                <input name="quantity" type="number" defaultValue={selectedRow.quantity} placeholder="Quantity" className={styles.editInput} />
                {/* Removed unit field as requested */}
                <textarea name="comments" defaultValue={selectedRow.comments} placeholder="Comments" className={styles.editTextarea} />
              </div>
              <button type="submit" className={styles.editSubmitBtn}>Save Changes</button>
            </form>
          </div>
        </div>

      )}

      {/* Upload Modal */}
      {showUploadModal && selectedRow && (
        <div className={styles.modalOverlay} onClick={() => setShowUploadModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Upload / Replace Receipt</h3>
              <button className={styles.closeBtn} onClick={() => setShowUploadModal(false)}>✕</button>
            </div>
            <div>
              {selectedRow.receiptUrl && (
                <div className={styles.currentReceipt}>
                  <h4>Current Receipt</h4>
                  <img src={selectedRow.receiptUrl} alt="current receipt" className={styles.receiptLarge} onClick={() => openReceiptInNewTab(selectedRow.receiptUrl)} />
                  <div style={{ marginTop: 8 }}>
                    <button className={styles.uploadBtn} onClick={() => fileInputRef.current?.click()}>Replace File</button>
                    <button className={styles.uploadBtn} onClick={() => openReceiptInNewTab(selectedRow.receiptUrl)} style={{ marginLeft: 8 }}>Open</button>
                  </div>
                </div>
              )}

              <div className={styles.uploadContainer} style={{ marginTop: 12 }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                />
                <div className={styles.uploadIcon}>
                  <FaFileUpload />
                </div>
                <p className={styles.uploadText}>
                  {receipt ? receipt.name : 'Choose a file to upload or click Replace above'}
                </p>
                <button
                  className={styles.uploadBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </button>
                {receipt && (
                  <button
                    className={`${styles.uploadBtn} ${styles.submitBtn}`}
                    onClick={handleUploadSubmit}
                    style={{ marginLeft: 8 }}
                  >
                    Save Upload
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && confirmDelete.open && (
        <div className={styles.modalOverlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Confirm Delete</h3>
              <button className={styles.closeBtn} onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <p>Are you sure you want to delete this record?</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button className={styles.submitBtn} onClick={() => setConfirmDelete(null)} style={{ background: '#6c757d' }}>Cancel</button>
              <button className={styles.submitBtn} onClick={() => handleDeleteConfirmed(confirmDelete.row, confirmDelete.tab || activeTab)} style={{ background: '#d9534f' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Status message banner */}
      {statusMessage && (
        <div style={{ position: 'fixed', right: 20, top: 20, zIndex: 2000 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: statusMessage.type === 'success' ? '#1b5e20' : '#6b1b1b', color: '#fff', padding: '10px 16px', borderRadius: 6, boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            {statusMessage.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
            <div>{statusMessage.text}</div>
          </div>
        </div>
      )}

      {/* ...popup modal and other UI... */}
    </div>
  );

}