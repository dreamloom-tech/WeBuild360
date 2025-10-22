"use client";
import { useEffect, useState } from 'react';
import styles from './expensePage.module.css';
import fetchWithAuth from '@/lib/fetchWithAuth';
import { fetchProjectDropdownItems } from '@/lib/fetchProjectDropdownItems';
import Toast from '@/components/Toast';

export default function ExpensePage() {
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [project, setProject] = useState('');
  const [source, setSource] = useState('');
  const [activeTab, setActiveTab] = useState<'all'|'materials'|'salary'|'manual'>('all');
  const [materialType, setMaterialType] = useState<'all'|'purchase'|'return'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [toast, setToast] = useState<{ show: boolean; message: string; type?: 'success'|'error' }>(() => ({ show: false, message: '' }));
  const [searchBy, setSearchBy] = useState<'all'|'project'|'category'|'description'>('all');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [newExpense, setNewExpense] = useState({ date: '', amount: '', project: '', category: '', comments: '' });

    // Toast utility function
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ show: true, message, type });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

  useEffect(() => { (async () => {
    try { const items = await fetchProjectDropdownItems(); setProjects(items); } catch(e) {}
  })(); }, []);
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (project) params.set('project', project);
      // source is controlled by tab if tab selected
      const src = source || (activeTab === 'all' ? '' : activeTab);
      if (src) params.set('source', src);
      const res = await fetchWithAuth(`/api/reports/expenses?${params.toString()}`);
      const json = await res.json();
      const baseRows = json.rows || [];

      // Additionally fetch material returns/purchases and map them so we can display separately
      try {
        const [returnsRes, purchasesRes] = await Promise.all([
          fetchWithAuth('/api/materials/return-details'),
          fetchWithAuth('/api/materials/purchase-details'),
        ]);

        const returnsJson = await returnsRes.json().catch(() => []);
        const purchasesJson = await purchasesRes.json().catch(() => []);

        // Map returns
        const mappedReturns = (returnsJson || [])
          .filter((r: any) => {
            if (!project) return true;
            const proj = project;
            return (r.project && r.project === proj) || (r.projectId && r.projectId === proj);
          })
          .map((r: any) => ({
            _id: r._id,
            date: r.date || r.creditedAt || r.createdAt || null,
            amount: -(Number(r.total || r.amount || 0)),
            source: 'materials',
            materialAction: 'return' as const,
            project: r.project || r.projectName || r.projectId || null,
            category: r.category || null,
            description: r.note || r.comments || 'Return',
            receiptUrl: r.receiptUrl || null,
            raw: r,
          }));

        // Map purchases
        const mappedPurchases = (purchasesJson || [])
          .filter((p: any) => {
            if (!project) return true;
            const proj = project;
            return (p.project && p.project === proj) || (p.projectId && p.projectId === proj);
          })
          .map((p: any) => {
            if (!p.type) p.type = 'purchase';
            return {
              _id: p._id,
              date: p.date || p.creditedAt || p.createdAt || null,
              amount: Number(p.total || p.amount || 0),
              source: 'materials',
              materialAction: 'purchase' as const,
              project: p.project || p.projectName || p.projectId || null,
              category: p.category || null,
              description: p.description || p.item || p.itemName || p.materialName || p.note || p.comments || 'Purchase',
              receiptUrl: p.receiptUrl || null,
              type: 'purchase',
              raw: { ...p, type: 'purchase' },
            };
          });

        // Merge and dedupe
        const existingIds = new Set(baseRows.map((r: any) => String(r._id)));
        const combined = [...baseRows];
        for (const ret of mappedReturns) {
          if (!existingIds.has(String(ret._id))) { combined.push(ret); existingIds.add(String(ret._id)); }
        }
        for (const p of mappedPurchases) {
          if (!existingIds.has(String(p._id))) { combined.push(p); existingIds.add(String(p._id)); }
        }

        combined.sort((a: any, b: any) => {
          const da = a.date ? new Date(a.date).getTime() : 0;
          const db_ = b.date ? new Date(b.date).getTime() : 0;
          return db_ - da;
        });

        // client-side filters (materialType, activeTab & search)
        const filtered = combined.filter((r: any) => {
          // Filter by activeTab first
          if (activeTab === 'manual' && r.source !== 'manual') return false;
          if (activeTab === 'materials' && r.source !== 'materials') return false;
          if (activeTab === 'salary' && r.source !== 'salary') return false;

          // Then apply materialType filter only for materials
          if (r.source === 'materials') {
            if (materialType !== 'all' && r.type !== materialType) return false;
          }
          if ((source === 'materials' || activeTab === 'materials') && materialType !== 'all') {
            const isPurchase = r.materialAction === 'purchase' || r.type === 'purchase' || (r.raw && r.raw.type === 'purchase') || (r.source === 'materials' && !r.materialAction && !r.type);
            const isReturn = r.materialAction === 'return' || r.type === 'return' || (r.raw && (r.raw.type === 'return' || r.raw.isReturn)) || (Number(r.amount) < 0);
            if (materialType === 'purchase' && !isPurchase) return false;
            if (materialType === 'return' && !isReturn) return false;
          }

          if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            const proj = String(r.project || r.projectId || '').toLowerCase();
            const cat = String(r.category || r.materialCategory || '').toLowerCase();
            const desc = String(r.description || r.note || r.comments || r.item || r.itemName || r.materialName || '').toLowerCase();
            const type = (r.materialAction === 'purchase' || r.type === 'purchase') ? 'purchase' : (r.materialAction === 'return' || r.type === 'return') ? 'return' : (r.source || '');
            if (searchBy === 'all') {
              if (!proj.includes(q) && !cat.includes(q) && !desc.includes(q) && !type.includes(q)) return false;
            } else if (searchBy === 'project') { if (!proj.includes(q)) return false; }
            else if (searchBy === 'category') { if (!cat.includes(q)) return false; }
            else if (searchBy === 'description') { if (!desc.includes(q) && !type.includes(q)) return false; }
          }

          return true;
        });

        setRows(filtered);
        setTotal(filtered.reduce((sum: number, r: any) => sum + (Number(r.amount) || 0), 0));
      } catch (err) {
        console.error('Error fetching returns/purchases:', err);
        setRows(baseRows);
        setTotal(json.total || 0);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Refetch when tab changes
  useEffect(() => {
    // sync source with activeTab
    setSource(activeTab === 'all' ? '' : activeTab);
    fetchData();
  }, [activeTab]);

  // Refetch when source/materialType/searchTerm change (materialType only affects client filtering but we refresh to show latest data)
  useEffect(() => {
    // avoid calling twice when activeTab already changed source — small debounce could be added later
    fetchData();
  }, [source, materialType, searchTerm]);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    try {
      const payload = { date: newExpense.date || new Date().toISOString(), amount: Number(newExpense.amount), project: newExpense.project, category: newExpense.category, comments: newExpense.comments };
      const res = await fetchWithAuth('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (res.ok) {
         showToast('Expense added successfully');
        setOpenAdd(false);
        setNewExpense({ date: '', amount: '', project: '', category: '', comments: '' });
        fetchData();
      } else {
         showToast(json.error || 'Failed to add expense', 'error');
      }
    } catch (err) { console.error('Error adding expense:', err); showToast('Failed to add expense', 'error'); }
  };
  const clearFilters = () => {
    setFrom('');
    setTo('');
    setProject('');
    setSource('');
    setMaterialType('all');
    setSearchTerm('');
    setSearchBy('all');
    setActiveTab('all');
    // allow state to settle then refresh
    setTimeout(() => fetchData(), 0);
    showToast('Filters cleared');
  };

  // Debounce searchTerm into debouncedSearch (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.filterContainer}>
          <div className={styles.tabRow}>
            <button className={`${styles.tabBtn} ${activeTab === 'all' ? styles.active : ''}`} onClick={() => setActiveTab('all')}>All</button>
            <button className={`${styles.tabBtn} ${activeTab === 'materials' ? styles.active : ''}`} onClick={() => setActiveTab('materials')}>Materials</button>
            <button className={`${styles.tabBtn} ${activeTab === 'salary' ? styles.active : ''}`} onClick={() => setActiveTab('salary')}>Salary</button>
            <button className={`${styles.tabBtn} ${activeTab === 'manual' ? styles.active : ''}`} onClick={() => setActiveTab('manual')}>Manual</button>
          </div>
          <div className={styles.filterControls}>
            <div className={styles.filterRow}>
              <label>From: <input type="date" value={from} onChange={e=>setFrom(e.target.value)} /></label>
              <label>To: <input type="date" value={to} onChange={e=>setTo(e.target.value)} /></label>
              <label>Project:
                <select value={project} onChange={e=>setProject(e.target.value)}>
                  <option value="">All</option>
                  {projects.map(p=> <option key={p._id} value={p.name}>{p.name}</option>)}
                </select>
              </label>
              <label>Source:
                <select value={source} onChange={e=>{
                    const v = e.target.value;
                    if (v === 'purchase') { setSource('materials'); setMaterialType('purchase'); }
                    else if (v === 'return') { setSource('materials'); setMaterialType('return'); }
                    else { setSource(v); setMaterialType('all'); }
                  }}>
                  <option value="">All</option>
                  <option value="manual">Manual</option>
                  <option value="materials">Materials</option>
                  <option value="purchase">Purchase</option>
                  <option value="return">Return</option>
                  <option value="salary">Salary</option>
                </select>
              </label>
            </div>

            <div className={styles.filterRow}>
              {(source === 'materials' || activeTab === 'materials') && (
                <label>Material Type:
                  <select value={materialType} onChange={e => setMaterialType(e.target.value as any)}>
                    <option value="all">All</option>
                    <option value="purchase">Purchase</option>
                    <option value="return">Return</option>
                  </select>
                </label>
              )}

              <label>Search By:
                <select value={searchBy} onChange={e => setSearchBy(e.target.value as any)}>
                  <option value="all">All</option>
                  <option value="project">Project</option>
                  <option value="category">Category</option>
                  <option value="description">Description</option>
                </select>
              </label>
              <label>Search:
                <input type="search" placeholder="Search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </label>
            </div>

            <div className={styles.buttonRow}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={fetchData}>Refresh</button>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={clearFilters}>Clear</button>
            </div>
          </div>
        </div>
        <div className={styles.right}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Total: ₹{total.toLocaleString()}</div>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={()=>setOpenAdd(true)}>Add Expense</button>
        </div>
      </header>

      {/* Toast */}
      <Toast show={toast.show} message={toast.message} type={toast.type} action={activeTab === 'manual' ? 'manual' : materialType === 'all' ? undefined : materialType} />

      <div className={styles.tableWrap}>
        {loading ? <div>Loading...</div> : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Project</th>
                <th>Category/Staff</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r:any)=> (
                <tr key={String(r._id)}>
                  <td>{r.date ? new Date(r.date).toLocaleDateString() : '-'}</td>
                  <td>
                    {typeof r.source === 'string' ? (r.source.charAt(0).toUpperCase() + r.source.slice(1)) : r.source}
                    {r.source === 'materials' && (
                      (() => {
                        // infer action: prefer explicit materialAction, else use amount sign
                        const action = r.materialAction || (Number(r.amount) < 0 ? 'return' : 'purchase');
                        const label = action.charAt(0).toUpperCase() + action.slice(1);
                        return (
                          <span
                            className={`${styles.badge} ${
                              r.source === 'manual' ? styles.badgeManual :
                              action === 'purchase' ? styles.badgePurchase : styles.badgeReturn
                            }`}
                            onClick={() => {
                              setSource('materials');
                              setMaterialType(action as any);
                              showToast(`${label} filter applied`);
                            }}
                          >
                            {label}
                          </span>
                        );
                      })()
                    )}
                  </td>
                  <td>{r.project || '-'}</td>
                  <td>{r.category || '-'}</td>
                  <td>{r.description || ''}</td>
                  <td>₹{Number(r.amount || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {openAdd && (
        <div className={styles.modal} role="dialog">
          <div className={styles.modalContent}>
            <h3>Add Expense</h3>
            <form onSubmit={handleAdd}>
              <label>Date<input type="date" value={newExpense.date} onChange={e=>setNewExpense({...newExpense, date: e.target.value})} /></label>
              <label>Amount<input type="number" value={newExpense.amount} onChange={e=>setNewExpense({...newExpense, amount: e.target.value})} required /></label>
              <label>Project
                <select value={newExpense.project} onChange={e=>setNewExpense({...newExpense, project: e.target.value})}>
                  <option value="">-- Select --</option>
                  {projects.map(p=> <option key={p._id} value={p.name}>{p.name}</option>)}
                </select>
              </label>
              <label>Category<input value={newExpense.category} onChange={e=>setNewExpense({...newExpense, category: e.target.value})} /></label>
              <label>Comments<textarea value={newExpense.comments} onChange={e=>setNewExpense({...newExpense, comments: e.target.value})} /></label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={()=>setOpenAdd(false)}>Cancel</button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
