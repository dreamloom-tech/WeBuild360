"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchProjectDropdownItems, ProjectDropdownItem } from '@/lib/fetchProjectDropdownItems';
import fetchWithAuth from '@/lib/fetchWithAuth';
import styles from "./salary.module.css";
import { FaEye } from 'react-icons/fa';
import { getStaff, getSalaryHistory, saveSalaryHistory, saveStaff } from '@/lib/storage';

export default function StaffSalary() {
  // State for viewing payment details
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  // Staff list will be loaded from API (same as Manage page) with fallbacks to local storage/mock
  const [staffList, setStaffList] = useState<any[]>([]);
  const [search, setSearch] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
const [salaryForm, setSalaryForm] = useState<{ projectName: string; deductAdvance: number | string; givenAmount: string; salaryDate: string; deductEnabled: boolean }>({
  projectName: "",
  deductAdvance: 0,
  givenAmount: "",
  salaryDate: "",
  deductEnabled: false,
});
const [projects, setProjects] = useState<ProjectDropdownItem[]>([]);
  // Fetch projects for dropdown
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await fetchProjectDropdownItems();
        if (mounted) setProjects(items);
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  // load staff from API and fall back to storage or mock data; also load salary history
  // Refactor: reusable loader so Refresh button and events can trigger reloads
  const loadStaff = async (mounted = true) => {
    // try API first (so changes made on Manage page are reflected)
    try {
      const res = await fetchWithAuth('/api/workers');
      if (res.ok) {
        const json = await res.json();
        if (mounted && Array.isArray(json) && json.length > 0) {
          setStaffList(json);
          // also persist a copy to localStorage for fallback
          saveStaff(json as any[]);
        }
      }
    } catch (err) {
      // ignore; we'll try storage fallback below
    }

    // fallback to local storage
    // const stored = getStaff();
    // if (mounted) {
    //   if (stored && stored.length > 0) setStaffList(stored as any[]);
    //   else {
    //     const mockData = [
    //       { firstName: "John", lastName: "David", workerType: "Engineer", salary: 30000, wageType: "Monthly", advance: 5000 },
    //       { firstName: "Arun", lastName: "Kumar", workerType: "Helper", salary: 12000, wageType: "Weekly", advance: 0 },
    //       { firstName: "Ravi", lastName: "Shankar", workerType: "Carpenter", salary: 800, wageType: "Daily", advance: 200 },
    //     ];
    //     setStaffList(mockData);
    //     saveStaff(mockData as any[]);
    //   }
    // }

    const history = getSalaryHistory();
    if (mounted && history && history.length > 0) setPaymentHistory(history as any[]);
  };

  useEffect(() => {
    let mounted = true;
    loadStaff(mounted);

    const onFocus = () => { loadStaff(true); };
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === undefined) return;
      if (e.key.includes('webuild:staff')) {
        const s = getStaff();
        if (s && s.length > 0) setStaffList(s as any[]);
      }
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);

    return () => { mounted = false; window.removeEventListener('focus', onFocus); window.removeEventListener('storage', onStorage); };
  }, []);

  const handleSalaryButtonClick = (staff: any) => {
    const today = new Date().toISOString().split('T')[0];
    // initialize deductAdvance from staff.advance and enable deduction by default if advance exists
    const adv = (staff && staff.advance) ? Number(staff.advance) : 0;
    setSalaryForm(prev => ({ ...prev, salaryDate: selectedDate || today, deductAdvance: adv, deductEnabled: adv > 0 }));
    setSelectedStaff(staff);
  };

  const filteredStaffList = useMemo(() => {
    if (!search.trim()) return staffList;
    const q = search.trim().toLowerCase();
    return staffList.filter(s => {
      return (
        (s.firstName && s.firstName.toLowerCase().includes(q)) ||
        (s.lastName && s.lastName.toLowerCase().includes(q)) ||
        (s.workerType && s.workerType.toLowerCase().includes(q)) ||
        (s.wageType && s.wageType.toLowerCase().includes(q))
      );
    });
  }, [search, staffList]);

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target as HTMLInputElement;
    if (name === 'deductAdvance') {
      // clamp to available advance
      const raw = Number(value || 0);
      const adv = Number(selectedStaff?.advance || 0);
      const final = Math.max(0, Math.min(raw, adv));
      setSalaryForm({ ...salaryForm, deductAdvance: final });
    } else {
      setSalaryForm({ ...salaryForm, [name]: value } as any);
    }
  };

  const handleDeductToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    // if disabling, keep deductAdvance value but don't apply it during submit
    setSalaryForm(prev => ({ ...prev, deductEnabled: checked }));
  };

  // keep salaryDate in modal synced with the page selectedDate while modal is open
  useEffect(() => {
    if (selectedStaff) {
      setSalaryForm(prev => ({ ...prev, salaryDate: selectedDate || prev.salaryDate }));
    }
  }, [selectedDate, selectedStaff]);

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    // salary date is mandatory
    if (!salaryForm.salaryDate || salaryForm.salaryDate.trim() === '') {
      alert('Salary date is required');
      return;
    }

    const advance = Number(selectedStaff.advance || 0);
    const salary = Number(selectedStaff.salary || 0);
    const given = Number(salaryForm.givenAmount) || 0;
    const deducted = salaryForm.deductEnabled ? (Number(salaryForm.deductAdvance) || 0) : 0;
    const totalPaid = given + deducted;
    // validation: do not allow paying more than salary
    if (totalPaid > salary) {
      alert('Total paid (given + deducted) cannot exceed salary amount.');
      return;
    }
    const pending = salary - totalPaid;

    // prevent duplicate payment for same staff and date
    const staffId = selectedStaff._id || selectedStaff.id || null;
    const duplicate = paymentHistory.some(h => (h.staffId && staffId && h.staffId === staffId) && h.date === salaryForm.salaryDate);
    if (duplicate) {
      if (!confirm('A payment already exists for this staff on the selected date. Do you want to continue and add another entry?')) {
        return;
      }
    }

    const record = {
  _id: crypto.randomUUID(), // Temporary client-side ID
  staffId,
  name: `${selectedStaff.firstName} ${selectedStaff.lastName}`,
  type: selectedStaff.workerType,
  salary: salary,
  paid: totalPaid,
  pending: pending <= 0 ? 0 : pending,
  status: pending <= 0 ? "Paid" : "Unpaid",
  date: salaryForm.salaryDate,
  deductionApplied: salaryForm.deductEnabled,
  deductedAmount: salaryForm.deductEnabled ? deducted : 0,
  deductionDeferred: !salaryForm.deductEnabled && (advance > 0),
  originalAdvance: advance, // Track original advance amount
  remainingAdvance: salaryForm.deductEnabled ? Math.max(0, advance - deducted) : advance, // Track remaining after deduction
  projectName: salaryForm.projectName,
    };

    (async () => {
      try {
        const res = await fetchWithAuth('/api/salary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        });
        if (res.ok) {
          const serverRecord = await res.json();
          const next = [...paymentHistory, serverRecord];
          setPaymentHistory(next);
          saveSalaryHistory(next);
        } else {
          const next = [...paymentHistory, record];
          setPaymentHistory(next);
          saveSalaryHistory(next);
        }
      } catch (err) {
        const next = [...paymentHistory, record];
        setPaymentHistory(next);
        saveSalaryHistory(next);
      }
    })();

    // if deductAdvance was applied, update staff advance in DB and locally
    if (selectedStaff && salaryForm.deductEnabled && deducted > 0) {
      const staffId = selectedStaff._id || selectedStaff.id;
      const remainingAdvance = Math.max(0, (selectedStaff.advance || 0) - deducted);
      
      // Update worker advance in database
      try {
        const res = await fetchWithAuth(`/api/workers?id=${staffId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            advance: remainingAdvance,
            // Track advance history in worker document
            advanceHistory: [
              ...(selectedStaff.advanceHistory || []),
              {
                date: salaryForm.salaryDate,
                deducted,
                remaining: remainingAdvance,
                salaryId: record._id, // Link to salary payment
              }
            ]
          })
        });
        
        if (res.ok) {
          const updatedWorker = await res.json();
          // Update local state with server response
          setStaffList(prev => prev.map(s => 
            (s._id === staffId || s.id === staffId) ? updatedWorker : s
          ));
          saveStaff(staffList.map(s => 
            (s._id === staffId || s.id === staffId) ? updatedWorker : s
          ));
        } else {
          // If server update fails, still update locally but mark for retry
          console.warn('Failed to update worker advance in DB');
          const updatedStaff = staffList.map(s =>
            s === selectedStaff ? { ...s, advance: remainingAdvance } : s
          );
          setStaffList(updatedStaff);
          saveStaff(updatedStaff);
        }
      } catch (err) {
        // On error, update locally but mark for retry
        console.warn('Error updating worker advance:', err);
        const updatedStaff = staffList.map(s =>
          s === selectedStaff ? { ...s, advance: remainingAdvance } : s
        );
        setStaffList(updatedStaff);
        saveStaff(updatedStaff);
      }
    }

    setSelectedStaff(null);
    setSalaryForm({ projectName: "", deductAdvance: 0, givenAmount: "", salaryDate: "", deductEnabled: false });
  };

  const handleRefresh = () => {
    loadStaff(true);
  };

  return (

    <div className={styles.container}>
      <h1 className={styles.title}>Staff Salary Management</h1>

      {/* Controls for both tables */}
      <div className={styles.dateBox}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label>Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={styles.dateInput}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="text"
            placeholder="Search staff/payment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <button type="button" onClick={handleRefresh} className={styles.refreshBtn}>Refresh</button>
        </div>
      </div>


      {/* Staff List */}
      <h2 className={styles.sectionHeader}>Staff List</h2>
      <div className={styles.tableWrapper}>
        <div className={styles.tableWrapperInner}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Salary</th>
                <th>Advance</th>
                <th>Salary Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaffList.map((staff, i) => (
                <tr key={i}>
                  <td>{staff.firstName} {staff.lastName}</td>
                  <td>{staff.workerType}</td>
                  <td>₹{staff.salary}</td>
                  <td>₹{staff.advance || 0}</td>
                  <td>{staff.wageType}</td>
                  <td>
                    <button
                      onClick={() => handleSalaryButtonClick(staff)}
                      className={`${styles.payBtn} ${
                        staff.wageType === "Daily"
                          ? styles.daily
                          : staff.wageType === "Weekly"
                          ? styles.weekly
                          : styles.monthly
                      }`}
                    >
                      Pay {staff.wageType} Salary
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

          {/* Salary Form (Modal) */}
          {selectedStaff && (
            <div className={styles.modalOverlay} onClick={() => { setSelectedStaff(null); setSalaryForm({ projectName: "", deductAdvance: 0, givenAmount: "", salaryDate: "", deductEnabled: false }); }}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.modalClose} aria-label="Close" onClick={() => { setSelectedStaff(null); setSalaryForm({ projectName: "", deductAdvance: 0, givenAmount: "", salaryDate: "", deductEnabled: false }); }}>&times;</button>
                <div className={styles.salaryFormBox} style={{ boxShadow: 'none', padding: 0 }}>
                  <h2 className={styles.formHeader}>Pay Salary - {selectedStaff.firstName} {selectedStaff.lastName}</h2>
                  <form onSubmit={handleSalarySubmit}>
                    <div className={styles.row}>
                      <div className={styles.col}>
                        <label>Advance Amount:</label>
                        <input
                          type="text"
                          value={selectedStaff.advance}
                          disabled
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.col}>
                        <label>Salary:</label>
                        <input
                          type="text"
                          value={selectedStaff.salary}
                          disabled
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.col}>
                        <label>Wage Type:</label>
                        <input
                          type="text"
                          value={selectedStaff.wageType}
                          disabled
                          className={styles.input}
                        />
                      </div>
                    </div>

                    <div className={styles.row}>
                      <div className={styles.col}>
                        <label>Salary Date:</label>
                        <input
                          type="date"
                          name="salaryDate"
                          value={salaryForm.salaryDate}
                          onChange={handleSalaryChange}
                          className={styles.input}
                          required
                        />
                      </div>
                      <div className={styles.col}>
                        <label>Current Advance (₹):</label>
                        <input type="text" value={selectedStaff.advance || 0} disabled className={styles.input} />
                        <div style={{ marginTop: 8 }}>
                          <label style={{ marginRight: 8 }}><input type="checkbox" checked={salaryForm.deductEnabled} onChange={handleDeductToggle} /> Deduct advance this month</label>
                        </div>
                      </div>
                      <div className={styles.col}>
                        <label>Project Name:</label>
                        <select
                          name="projectName"
                          value={salaryForm.projectName}
                          onChange={handleSalaryChange}
                          className={styles.select}
                          required
                        >
                          <option value="">Select Project</option>
                          {projects.map((p) => <option key={p._id} value={p.name}>{p.name}</option>)}
                        </select>
                      </div>

                      <div className={styles.col}>
                        <label>Deduct Advance from Salary (₹):</label>
                        <input
                          type="number"
                          name="deductAdvance"
                          value={salaryForm.deductAdvance}
                          onChange={handleSalaryChange}
                          placeholder="Enter amount to deduct"
                          className={styles.input}
                        />
                      </div>
                    </div>

                    <div className={styles.row}>
                          <div className={styles.col}>
                        <label>Given Amount:</label>
                        <input
                          type="number"
                          name="givenAmount"
                          value={salaryForm.givenAmount}
                          onChange={handleSalaryChange}
                          placeholder="Enter Amount"
                          className={styles.input}
                          required
                        />
                      </div>
                      
                      {/* Summary calculation */}
                      <div className={styles.col}>
                        <div className={styles.summaryBox}>
                          <div><strong>Salary:</strong> ₹{selectedStaff.salary}</div>
                          {salaryForm.deductEnabled && Number(salaryForm.deductAdvance) > 0 && (
                            <div><strong>Deduction:</strong> ₹{salaryForm.deductAdvance}</div>
                          )}
                          {salaryForm.givenAmount && (
                            <div><strong>Net Payment:</strong> ₹{Number(salaryForm.givenAmount) || 0}</div>
                          )}
                          {selectedStaff.advance > 0 && (
                            <div>
                              <strong>Current Advance:</strong> ₹{selectedStaff.advance}
                              {salaryForm.deductEnabled && Number(salaryForm.deductAdvance) > 0 && (
                                <span className={styles.advanceRemaining}>
                                  {" → "}₹{Math.max(0, selectedStaff.advance - Number(salaryForm.deductAdvance))} remaining
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <button type="button" className={styles.refreshBtn} onClick={() => { setSelectedStaff(null); setSalaryForm({ projectName: "", deductAdvance: 0, givenAmount: "", salaryDate: "", deductEnabled: false }); }}>Cancel</button>
                      <button type="submit" className={styles.submitBtn} style={{ marginLeft: 12 }}>Submit Salary</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
      {/* Payment History */}
      <h2 className={styles.sectionHeader}>Payment History</h2>
      <div className={styles.tableWrapper}>
        <div className={styles.tableWrapperInner}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Salary</th>
                <th>Paid</th>
                <th>Pending</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.length > 0 ? (
                paymentHistory.map((p, index) => (
                  <tr key={index}>
                    <td>{p.name}</td>
                    <td>{p.type}</td>
                    <td>{p.salary}</td>
                    <td>{p.paid}</td>
                    <td>{p.pending}</td>
                    <td className={p.status === "Paid" ? styles.paid : styles.unpaid}>{p.status}</td>
                    <td>
                      <button className={styles.iconBtn} title="View details" onClick={() => setSelectedPayment(p)}>
                        <FaEye size={20} color="#0077b6" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className={styles.emptyText}>No payment history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className={styles.detailsModalOverlay} onClick={() => setSelectedPayment(null)}>
          <div className={styles.detailsModalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.detailsModalClose} aria-label="Close" onClick={() => setSelectedPayment(null)}>&times;</button>
            <div className={styles.detailsBox}>
              <h2 className={styles.detailsHeader}><FaEye style={{marginRight:8}}/> Payment Details</h2>
              <div className={styles.detailsGrid}>
                <div><span>Name:</span> {selectedPayment.name}</div>
                <div><span>Type:</span> {selectedPayment.type}</div>
                <div><span>Salary:</span> ₹{selectedPayment.salary}</div>
                <div><span>Paid:</span> ₹{selectedPayment.paid}</div>
                <div><span>Pending:</span> ₹{selectedPayment.pending}</div>
                <div><span>Status:</span> {selectedPayment.status}</div>
                <div><span>Date:</span> {selectedPayment.date}</div>
                <div><span>Deduction Applied:</span> {selectedPayment.deductionApplied ? 'Yes' : 'No'}</div>
                <div><span>Deducted Amount:</span> ₹{selectedPayment.deductedAmount ?? 0}</div>
                <div><span>Original Advance:</span> ₹{selectedPayment.originalAdvance ?? 0}</div>
                <div><span>Remaining Advance:</span> ₹{selectedPayment.remainingAdvance ?? 0}</div>
                <div><span>Project Name:</span> {selectedPayment.projectName && selectedPayment.projectName !== '' ? selectedPayment.projectName : 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

