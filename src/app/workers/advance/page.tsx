"use client";

import { useState, useEffect } from "react";
import styles from "./advance.module.css";
import fetchWithAuth from '@/lib/fetchWithAuth';
import { FaPlus, FaTrashAlt, FaPencilAlt } from 'react-icons/fa';
import { getStaff, saveStaff } from '@/lib/storage';

export default function CashAdvancePage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [advanceInput, setAdvanceInput] = useState("");

  // Load staff data from API (fall back to localStorage if API fails)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetchWithAuth('/api/workers');
        const json = await res.json();
        if (res.ok && Array.isArray(json)) {
          let withAdvance = json.map((s: any) => ({ ...s, advance: s.advance ?? 0 }));
          // merge any pending local updates
          const pending = loadPending();
          if (pending && pending.length > 0) {
            withAdvance = withAdvance.map((s: any) => {
              const p = pending.find(pp => pp.workerId === (s._id || s.id));
              if (p) return { ...s, advance: p.amount };
              return s;
            });
          }
          if (mounted) setStaffList(withAdvance as any[]);
          // persist local copy
          saveStaff(withAdvance as any[]);
          return;
        }
      } catch (err) {
        // ignore, fallback to storage
      }

      const stored = getStaff();
      if (mounted) {
        if (stored && stored.length > 0) {
          const withAdvance = stored.map(s => ({ ...s, advance: (s as any).advance ?? 0 }));
          setStaffList(withAdvance as any[]);
        }
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  // Helper to normalize Mongo _id which may be an object or string
  const normalizeId = (idAny: any): string | null => {
    if (!idAny) return null;
    if (typeof idAny === 'string') return idAny;
    if (typeof idAny === 'object') {
      if ((idAny as any).$oid) return (idAny as any).$oid;
      if ((idAny as any).oid) return (idAny as any).oid;
      try {
        const s = idAny.toString();
        const m = s.match(/[a-fA-F0-9]{24}/);
        if (m) return m[0];
        return s;
      } catch (e) {
        return String(idAny);
      }
    }
    return String(idAny);
  };

  // Pending advances stored in localStorage under this key when server update fails
  const PENDING_KEY = 'webuild:pending_advances';

  const loadPending = (): { workerId: string; amount: number; updatedAt: string }[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as any[];
    } catch (e) {
      return [];
    }
  };

  const savePending = (entry: { workerId: string; amount: number; updatedAt: string }) => {
    if (typeof window === 'undefined') return;
    const current = loadPending();
    const filtered = current.filter(p => p.workerId !== entry.workerId);
    filtered.push(entry);
    localStorage.setItem(PENDING_KEY, JSON.stringify(filtered));
  };

  const clearPending = (workerId: string) => {
    if (typeof window === 'undefined') return;
    const current = loadPending();
    const filtered = current.filter(p => p.workerId !== workerId);
    localStorage.setItem(PENDING_KEY, JSON.stringify(filtered));
  };

  const openModal = (staff: any) => {
    setSelectedStaff(staff);
    setAdvanceInput(staff.advance || "");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStaff(null);
    setAdvanceInput("");
  };

  const handleAdvanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    const newValue = Number(advanceInput || 0);
    const updatedList = staffList.map(staff =>
      staff === selectedStaff ? { ...staff, advance: newValue } : staff
    );
    setStaffList(updatedList);

    // persist to server via PUT /api/workers?id=... if possible
    (async () => {
      try {
        const idRaw = selectedStaff._id || selectedStaff.id;
        const id = normalizeId(idRaw);
        if (id) {
          // create advance record (audit)
          try {
            await fetchWithAuth('/api/workers/advance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ workerId: id, amount: newValue, note: 'Manual advance' })
            });
          } catch (err) {
            // ignore, still try update worker
          }

          const res = await fetchWithAuth(`/api/workers?id=${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ advance: newValue })
          });
          if (res.ok) {
            const updated = await res.json();
            // update local copy with whatever server returns
            const merged = staffList.map(s => s === selectedStaff ? updated : s);
            setStaffList(merged as any[]);
            saveStaff(merged as any[]);
            // clear any pending entry for this worker
            clearPending(id);
          } else {
            // fallback: save local and mark pending
            saveStaff(updatedList as any[]);
            savePending({ workerId: id, amount: newValue, updatedAt: new Date().toISOString() });
          }
        } else {
          saveStaff(updatedList as any[]);
        }
      } catch (err) {
        // fallback to local and save pending
        saveStaff(updatedList as any[]);
        const idRaw = selectedStaff?._id || selectedStaff?.id;
        const id = normalizeId(idRaw);
        if (id) savePending({ workerId: id, amount: newValue, updatedAt: new Date().toISOString() });
      }
    })();

    closeModal();
  };

  const clearAdvance = async (staff: any) => {
    const id = staff._id || staff.id;
    const updatedList = staffList.map(s => s === staff ? { ...s, advance: 0 } : s);
    setStaffList(updatedList);
    try {
      if (id) {
        const nid = normalizeId(id);
        const res = await fetchWithAuth(`/api/workers?id=${encodeURIComponent(nid as string)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ advance: 0 })
        });
        if (res.ok) {
          const updated = await res.json();
          const merged = staffList.map(s => s === staff ? updated : s);
          setStaffList(merged as any[]);
          saveStaff(merged as any[]);
        } else {
          saveStaff(updatedList as any[]);
        }
      } else {
        saveStaff(updatedList as any[]);
      }
    } catch (err) {
      saveStaff(updatedList as any[]);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cash Advance</h1>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Advance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff, i) => (
              <tr key={i}>
                <td>{staff.firstName} {staff.lastName}</td>
                <td>{staff.workerType}</td>
                <td>₹{staff.advance}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button className={styles.iconBtn} title="Edit Advance" aria-label="Edit Advance" onClick={() => openModal(staff)}>
                    <FaPencilAlt />
                  </button>
                  <button className={styles.iconBtn} title="Clear Advance" aria-label="Clear Advance" onClick={() => clearAdvance(staff)}>
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedStaff && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Cash Advance - {selectedStaff.firstName} {selectedStaff.lastName}</h2>
            <form onSubmit={handleAdvanceSubmit}>
              <div className={styles.formGroup}>
                <label>Type:</label>
                <input type="text" value="Cash Advance" disabled className={styles.input} />
              </div>

              <div className={styles.formGroup}>
                <label>Enter Advance Amount:</label>
                <input
                  type="number"
                  value={advanceInput}
                  onChange={(e) => setAdvanceInput(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.submitBtn}>Submit</button>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
