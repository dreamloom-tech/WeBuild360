"use client";
import { useEffect, useMemo, useState } from 'react';
import fetchWithAuth from '@/lib/fetchWithAuth';
import { fetchProjectDropdownItems, ProjectDropdownItem } from '@/lib/fetchProjectDropdownItems';
import Link from 'next/link';
import styles from './inflow.module.css';
import { FiEdit, FiTrash2, FiEye, FiPlus, FiSearch } from 'react-icons/fi';
import Toast from '@/components/Toast';
import { useSearchParams } from 'next/navigation';

type Inflow = any;

export default function InflowPage() {
  const [data, setData] = useState<Inflow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [q, setQ] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type?: 'success'|'error' }>(() => ({ show: false, message: '' }));

  // modal state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'add'|'edit'|'view'>('add');
  const [current, setCurrent] = useState<Inflow | null>(null);
  const [projects, setProjects] = useState<ProjectDropdownItem[]>([]);
  const [projectMap, setProjectMap] = useState<Record<string,string>>({});
  const searchParams = useSearchParams();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (q) params.set('q', q);
      if (year) params.set('year', year);
      if (month) params.set('month', month);
      const url = `/api/funds/inflow?${params.toString()}`;
      const res = await fetchWithAuth(url);
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when pagination, limit, search or year/month filters change
  useEffect(() => { fetchData(); }, [page, limit, q, year, month]);

  useEffect(() => {
    (async () => {
      try {
        const items = await fetchProjectDropdownItems();
        setProjects(items);
        const map: Record<string,string> = {};
        items.forEach(it => map[it._id] = it.name);
        setProjectMap(map);
      } catch (err) { console.warn('Failed to load projects', err); }
    })();
    // If page is opened with ?projectId=... then auto-open add modal and preselect
    try {
      const pid = searchParams?.get?.('projectId');
      if (pid) {
        setMode('add'); setCurrent(null); setOpen(true);
        // set in initial state of form by passing current when opening
      }
    } catch (e) {}
  }, []);

  const openAdd = () => { setMode('add'); setCurrent(null); setOpen(true); };

  const handleSubmit = async (formData: any) => {
    try {
      let res;
      if (formData._id) {
        res = await fetchWithAuth(`/api/funds/inflow/${formData._id}`, { method: 'PUT', body: JSON.stringify(formData) } as any);
      } else {
        res = await fetchWithAuth('/api/funds/inflow', { method: 'POST', body: JSON.stringify(formData) });
      }
      const json = await res.json();
      if (json._id) {
        setToast({ show: true, message: 'Inflow record created successfully.', type: 'success' });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
        setOpen(false);
        fetchData();
      } else {
        setToast({ show: true, message: json.error || 'Failed', type: 'error' });
        setTimeout(() => setToast({ show: false, message: '' }), 4000);
      }
    } catch (err) { console.error(err); alert('Failed'); }
  };

  const handleDelete = async (id: string) => {
    // trigger modal confirm
    setDeletePendingId(id);
  };

  const [deletePendingId, setDeletePendingId] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deletePendingId) return;
    try {
      const res = await fetchWithAuth(`/api/funds/inflow/${deletePendingId}`, { method: 'DELETE' } as any);
      const json = await res.json();
      if (json.success) {
        setToast({ show: true, message: 'Inflow record deleted successfully.', type: 'success' });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
        setDeletePendingId(null);
        fetchData();
      } else {
        setToast({ show: true, message: json.error || 'Failed', type: 'error' });
        setTimeout(() => setToast({ show: false, message: '' }), 4000);
        setDeletePendingId(null);
      }
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Failed', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '' }), 4000);
      setDeletePendingId(null);
    }
  };

  const cancelDelete = () => setDeletePendingId(null);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.left}>
            <div className={styles.searchWrap}>
              <FiSearch className={styles.searchIcon} />
              <input className={styles.searchInput} placeholder="Search inflows" value={q} onChange={e => setQ(e.target.value)} />
            </div>
          </div>
          <div className={styles.center}>
            <label>Year:
              <select value={year} onChange={e => { setYear(e.target.value); setPage(1); }}>
                <option value="">All</option>
                {new Array(5).fill(0).map((_,i)=>{
                  const y = new Date().getFullYear() - i;
                  return <option key={y} value={String(y)}>{y}</option>
                })}
              </select>
            </label>
            <label>Month:
              <select value={month} onChange={e => { setMonth(e.target.value); setPage(1); }}>
                <option value="">All</option>
                {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m=> <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
          </div>
        </div>
        <div className={styles.right}>
          <button className={`${styles.add} ${styles.btn} ${styles.btnPrimary}`} onClick={openAdd}><FiPlus /> Add Inflow</button>
        </div>
      </header>

      <div className={styles.controls}>
        <div className={styles.recordsControl}>
          <label className={styles.recordsLabel}>Records per page: <span className="hint">(items)</span></label>
          <select className={styles.recordsSelect} value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}>
            {[5,10,15,25,50,100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.tableWrap}>
        {loading ? <div>Loading...</div> : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Project</th>
                <th>Amount (₹)</th>
                <th>Mode</th>
                <th>Bank / UPI</th>
                <th>Comments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row: any) => (
                <tr key={row._id}>
                <td>{new Date(row.date).toLocaleDateString()}</td>
                <td>{projectMap[row.projectId] || row.projectId}</td>
                <td>{row.amount}</td>
                <td>{row.mode === 'bank' ? 'BANK' : row.mode === 'upi' ? 'UPI' : 'CASH'}</td>
                <td>{
                  row.mode === 'bank' ? 
                    `${row.bankName || ''} / ${row.ifsc || ''}` : 
                  row.mode === 'upi' ? 
                    `GPAY/${row.mobileNumber || ''}` : 
                  ''
                }</td>
                <td>{row.comments}</td>
                  <td>
                    <div className="actionsRow">
                      <button title="View" className={styles.iconBtn} onClick={() => { setMode('view'); setCurrent(row); setOpen(true); }}><FiEye /></button>
                      <button title="Edit" className={styles.iconBtn} onClick={() => { setMode('edit'); setCurrent(row); setOpen(true); }}><FiEdit /></button>
                      <button title="Delete" className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => handleDelete(row._id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

  <Toast show={toast.show} message={toast.message} type={toast.type} />

      {open && (
        <div className={styles.modal} role="dialog">
          <div className={styles.modalContent}>
            <h3>{mode === 'add' ? 'Add Inflow' : mode === 'edit' ? 'Edit Inflow' : 'View Inflow'}</h3>
            <InflowForm mode={mode} initial={current} onCancel={() => setOpen(false)} onSubmit={handleSubmit} projects={projects} />
          </div>
        </div>
      )}
      {deletePendingId && (
        <div className={styles.modal} role="dialog">
          <div className={styles.modalContent}>
            <h3>Confirm delete</h3>
            <p>Are you sure you want to delete this record?</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
              <button type="button" onClick={cancelDelete}>Cancel</button>
              <button type="button" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InflowForm({ mode, initial, onCancel, onSubmit, projects }: any & { projects: ProjectDropdownItem[] }) {
  const [projectId, setProjectId] = useState(initial?.projectId || '');
  // allow preselect from URL if provided
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search || '');
      const pid = sp.get('projectId');
      if (!projectId && pid) setProjectId(pid);
    } catch (e) {}
  }, []);
  const [date, setDate] = useState(initial?.date ? initial.date.slice(0,10) : new Date().toISOString().slice(0,10));
  const [amount, setAmount] = useState(initial?.amount || '');
  const [payMode, setPayMode] = useState(initial?.mode || 'bank');
  const [comments, setComments] = useState(initial?.comments || '');
  const [bankName, setBankName] = useState(initial?.bankName || '');
  const [ifsc, setIfsc] = useState(initial?.ifsc || '');
  const [upiId, setUpiId] = useState(initial?.upiId || '');
  const [whoPaid, setWhoPaid] = useState(initial?.whoPaid || '');
  const [whoReceived, setWhoReceived] = useState(initial?.whoReceived || '');
  const [upiApp, setUpiApp] = useState(initial?.upiApp || 'gpay');
  const [mobileNumber, setMobileNumber] = useState(initial?.mobileNumber || '');

  const readOnly = mode === 'view';

  const submit = async (e: any) => {
    e.preventDefault();
    if (readOnly) return onCancel();
    const payload: any = { projectId, date, amount, mode: payMode, comments };
    if (initial?._id) payload._id = initial._id;
    if (payMode === 'bank') { payload.bankName = bankName; payload.ifsc = ifsc; }
    if (payMode === 'upi') { 
      if (!mobileNumber) {
        alert('UPI Mobile Number is required');
        return;
      }
      payload.mobileNumber = mobileNumber;
      payload.upiId = upiId || ''; // Optional UPI ID
      payload.whoPaid = whoPaid || '';
      payload.whoReceived = whoReceived || '';
      payload.upiApp = 'GPAY'; // Always set GPAY
      console.log('Submitting UPI payload:', payload); // Debug log
    }
    await onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <div className={styles.col}>
        <label>Project Name
          <select value={projectId} onChange={e=>setProjectId(e.target.value)} disabled={readOnly}>
            <option value="">-- Select project --</option>
            {projects.map((p: ProjectDropdownItem) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </label>
        <label>Payment Date
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} readOnly={readOnly} />
        </label>
        <label>Fund Received (₹)
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} readOnly={readOnly} />
        </label>
      </div>
      <div className={styles.col}>
        <label>Payment Mode
          <select value={payMode} onChange={e=>setPayMode(e.target.value)} disabled={readOnly}>
            <option value="bank">Bank Transfer</option>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
          </select>
        </label>
        <label>Comments
          <input value={comments} onChange={e=>setComments(e.target.value)} readOnly={readOnly} />
        </label>
      </div>
      <div className={styles.col}>
        {payMode === 'bank' && (
          <>
            <label>Bank Name
              <input value={bankName} onChange={e=>setBankName(e.target.value)} readOnly={readOnly} />
            </label>
            <label>IFSC Code
              <input value={ifsc} onChange={e=>setIfsc(e.target.value)} readOnly={readOnly} />
            </label>
          </>
        )}
        {payMode === 'upi' && (
          <>
            <label>UPI Mobile Number *
              <input 
                type="text"
                value={mobileNumber}
                onChange={e=>setMobileNumber(e.target.value)}
                placeholder="Enter mobile number"
                required={payMode === 'upi'}
                readOnly={readOnly}
              />
            </label>
            <label>UPI ID (Optional)
              <input 
                value={upiId} 
                onChange={e=>setUpiId(e.target.value)} 
                placeholder="Optional UPI ID"
                readOnly={readOnly} 
              />
            </label>
            <label>Who Paid
              <input value={whoPaid} onChange={e=>setWhoPaid(e.target.value)} readOnly={readOnly} />
            </label>
            <label>Who Received
              <input value={whoReceived} onChange={e=>setWhoReceived(e.target.value)} readOnly={readOnly} />
            </label>
            <label>UPI App
              <select value={upiApp} onChange={e=>setUpiApp(e.target.value)} disabled={readOnly}>
                <option value="gpay">GPay</option>
                <option value="paytm">Paytm</option>
                <option value="phonepe">PhonePe</option>
              </select>
            </label>
          </>
        )}
      </div>

      <div className={styles.actions}>
        <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onCancel}>Cancel</button>
        {!readOnly && <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Save</button>}
      </div>
    </form>
  );
}
