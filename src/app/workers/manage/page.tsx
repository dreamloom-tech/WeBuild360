"use client";

import { useState, useEffect, useMemo } from "react";
import fetchWithAuth from '@/lib/fetchWithAuth';
import styles from "./managestaff.module.css";
import { FaTrash, FaEye, FaUpload, FaPlus, FaEdit, FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

type Staff = {
  _id?: string;
  firstName: string;
  lastName?: string;
  wageType?: string;
  paymentOn?: string;
  salary?: any;
  workerType?: string;
  mode?: string;
  account?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
};

export default function ManageStaff() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [viewStaff, setViewStaff] = useState<Staff | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [search, setSearch] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Reset page to 1 when search or pageSize changes
  useEffect(() => { setPage(1); }, [search, pageSize]);
  // Filtered staff list based on search
  const filteredStaffList = useMemo(() => {
    if (!search.trim()) return staffList;
    const q = search.trim().toLowerCase();
    return staffList.filter(staff =>
      Object.values(staff).some(val =>
        val && typeof val === 'string' && val.toLowerCase().includes(q)
      )
    );
  }, [search, staffList]);

  // Paginated staff list
  const paginatedStaffList = useMemo(() => {
    if (pageSize === -1) return filteredStaffList;
    const start = (page - 1) * pageSize;
    return filteredStaffList.slice(start, start + pageSize);
  }, [filteredStaffList, page, pageSize]);

  const totalPages = useMemo(() => {
    if (pageSize === -1) return 1;
    return Math.max(1, Math.ceil(filteredStaffList.length / pageSize));
  }, [filteredStaffList, pageSize]);

  const [formData, setFormData] = useState<Staff>({
    firstName: "",
    lastName: "",
    wageType: "",
    paymentOn: "",
    salary: "",
    workerType: "",
    mode: "",
    account: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });

  const fetchWorkers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth('/api/workers');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch workers');
      if (Array.isArray(json)) setStaffList(json as Staff[]);
    } catch (err) {
      console.error('Error fetching workers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch workers');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to normalize _id which may come back from Mongo as an object or string
  const normalizeId = (id: any): string | null => {
    if (!id) return null;
    if (typeof id === 'string') return id;
    if (typeof id === 'object') {
      if (id.$oid) return id.$oid;
      if (id.oid) return id.oid;
      try {
        const s = id.toString();
        const m = s.match(/[a-fA-F0-9]{24}/);
        if (m) return m[0];
        return s;
      } catch (e) {
        return String(id);
      }
    }
    return String(id);
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleDelete = async (idAny: any, index?: number) => {
    const id = normalizeId(idAny);
    if (!id || !confirm('Are you sure you want to delete this worker?')) return;

    setIsLoading(true);
    setError(null);
    try {
        const res = await fetchWithAuth(`/api/workers?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });

      const json = await res.json();
      if (!res.ok) {
        // if not found (404) remove locally to keep UI consistent, but notify
        if (res.status === 404) {
          setError('Worker not found on server — removed locally');
          if (typeof index === 'number') {
            const updated = [...staffList];
            updated.splice(index, 1);
            setStaffList(updated);
          } else {
            setStaffList(prev => prev.filter(worker => normalizeId(worker._id) !== id));
          }
          return;
        }
        throw new Error(json.error || 'Failed to delete worker');
      }

      // remove from local list: if index provided remove by index for reliability
      if (typeof index === 'number') {
        const updated = [...staffList];
        updated.splice(index, 1);
        setStaffList(updated);
      } else {
        setStaffList(prev => prev.filter(worker => normalizeId(worker._id) !== id));
      }
    } catch (err) {
      console.error('Error deleting worker:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete worker');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editIndex !== null) {
        // update existing worker
        const target = staffList[editIndex];
        if (!target?._id) {
          throw new Error('Invalid worker record');
        }

        const targetId = normalizeId(target._id);
        if (!targetId) throw new Error('Invalid worker id');
        // don't send _id in the body - Mongo will reject attempts to modify the immutable _id field
        const payload = { ...formData } as any;
        if (payload && '_id' in payload) delete payload._id;

        const res = await fetchWithAuth(`/api/workers?id=${encodeURIComponent(targetId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const error = await res.json();
          if (res.status === 401) {
            // clear any stale token and prompt login
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              alert('Session expired or unauthorized. Please login.');
              window.location.href = '/login';
            }
            return;
          }
          throw new Error(error.error || 'Failed to update worker');
        }

        const updated = await res.json();
        const newList = [...staffList];
        newList[editIndex] = updated;
        setStaffList(newList);
        setEditIndex(null);
      } else {
        // create new worker
        // sanitize payload for create as well
        const createPayload = { ...formData } as any;
        if (createPayload && '_id' in createPayload) delete createPayload._id;

        const res = await fetchWithAuth('/api/workers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createPayload)
        });

        if (!res.ok) {
          const error = await res.json();
          if (res.status === 401) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              alert('Unauthorized. Please login to continue.');
              window.location.href = '/login';
            }
            return;
          }
          throw new Error(error.error || 'Failed to create worker');
        }

        const created = await res.json();
        setStaffList(prev => [...prev, created]);
      }

      // Reset form after successful submission
      setFormData({
        firstName: "",
        lastName: "",
        wageType: "",
        paymentOn: "",
        salary: "",
        workerType: "",
        mode: "",
        account: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
      });
      // close modal after successful submit
      setShowModal(false);
    } catch (err) {
      console.error('Failed to save worker:', err);
      alert(err instanceof Error ? err.message : 'Failed to save worker');
    }
    finally {
      setIsLoading(false);
    }
  };


  const handleEdit = (staff: Staff, index: number) => {
    setFormData(staff);
    setEditIndex(index);
    setShowModal(true);
    setViewStaff(null);
  };

  return (
    <div className={styles.container}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <h1 className={styles.title}>Manage Staff</h1>
        <button
          className={styles.dropdownBtn}
          onClick={() => {setShowModal(true); setEditIndex(null);}}
        >
          + Add Staff
        </button>
      </div>

      {/* Search and Row-per-page Controls */}
      <div style={{ margin: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label htmlFor="pageSize" style={{ fontWeight: 500, marginRight: 4 }}>Per Sheet:</label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc', fontWeight: 500 }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={100}>100</option>
            <option value={-1}>All</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Search staff..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px', minWidth: 220, borderRadius: 4, border: '1px solid #ccc' }}
        />
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeBtn}
              onClick={() => { setShowModal(false); setEditIndex(null); }}
            >
              &times;
            </button>
            <h2 className={styles.sectionHeader}>
              {editIndex !== null ? "Edit Staff" : "Add Staff Details"}
            </h2>
            <form className={styles.form} onSubmit={handleSubmit}>
              {/* Payment Details */}
              <h3 className={styles.subHeader}>Payment Details</h3>
              <div className={styles.row}>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className={styles.input}
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className={styles.input}
                />
              </div>
              <div className={styles.row}>
                <select
                  name="wageType"
                  value={formData.wageType}
                  onChange={handleChange}
                  className={styles.select}
                  required
                >
                  <option value="">Select Wage Type</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
                <select
                  name="paymentOn"
                  value={formData.paymentOn}
                  onChange={handleChange}
                  className={styles.select}
                  required
                >
                  <option value="">Payment On</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              {/* Worker Details */}
              <h3 className={styles.subHeader}>Worker Details</h3>
              <div className={styles.row}>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="Salary"
                  className={styles.input}
                  required
                />
                <select
                  name="workerType"
                  value={formData.workerType}
                  onChange={handleChange}
                  className={styles.select}
                  required
                >
                  <option value="">Worker Type</option>
                  <option>Engineer</option>
                  <option>Carpenter</option>
                  <option>Helper</option>
                  <option>Plumber</option>
                  <option>Electrician</option>
                  <option>Painter</option>
                  <option>Mason</option>
                  <option>Supervisor</option>
                </select>
              </div>
              <div className={styles.row}>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  className={styles.select}
                  required
                >
                  <option value="">Payment Mode</option>
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                </select>
                <input
                  type="text"
                  name="account"
                  value={formData.account}
                  onChange={handleChange}
                  placeholder="Account Details"
                  className={styles.input}
                />
              </div>

              {/* Contact & Address */}
              <h3 className={styles.subHeader}>Contact & Address</h3>
              <div className={styles.row}>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className={styles.input}
                />
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Street"
                  className={styles.input}
                />
              </div>
              <div className={styles.row}>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className={styles.input}
                />
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={styles.select}
                  required
                >
                  <option value="">Select State</option>
                  <option>Tamil Nadu</option>
                  <option>Kerala</option>
                  <option>Karnataka</option>
                  <option>Andhra Pradesh</option>
                  <option>Telangana</option>
                  <option>Maharashtra</option>
                  <option>Delhi</option>
                </select>
              </div>
              <div className={styles.row}>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={styles.select}
                  required
                >
                  <option value="">Select Country</option>
                  <option>India</option>
                  <option>UAE</option>
                  <option>Qatar</option>
                  <option>Saudi Arabia</option>
                  <option>Singapore</option>
                </select>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Pin Code"
                  className={styles.input}
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                {editIndex !== null ? "Update Staff" : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Staff Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Salary</th>
              <th>Wage Type</th>
              <th>Payment On</th>
              <th>Type</th>
              <th>Phone</th>
              <th>Transfer Mode</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStaffList.length > 0 ? (
              paginatedStaffList.map((staff: Staff, index: number) => (
                <tr key={index}>
                  <td>{staff.firstName} {staff.lastName}</td>
                  <td>{staff.salary}</td>
                  <td>{staff.wageType}</td>
                  <td>{staff.paymentOn}</td>
                  <td>{staff.workerType}</td>
                  <td>{staff.phone}</td>
                  <td>{staff.mode}</td>
                 <td className={styles.actions}>
  <FaEye
    className={styles.actionIcon}
    title="View"
    onClick={() => setViewStaff(staff)}
  />
  <FaEdit
    className={styles.actionIcon}
    title="Edit"
    onClick={() => handleEdit(staff, staffList.indexOf(staff))}
  />
  <FaTrash
    className={styles.actionIcon}
    title="Delete"
    onClick={() => handleDelete(staff._id, staffList.indexOf(staff))}
  />
</td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className={styles.emptyText}>
                  No staff data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pagination Controls */}
        {pageSize !== -1 && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, margin: '16px 0' }}>
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              style={{ background: 'none', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 18 }}
              title="First Page"
            >
              <FaAngleDoubleLeft />
            </button>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              style={{ background: 'none', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 18 }}
              title="Previous Page"
            >
              <FaAngleLeft />
            </button>
            <span style={{ fontWeight: 500, minWidth: 60, textAlign: 'center' }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              style={{ background: 'none', border: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 18 }}
              title="Next Page"
            >
              <FaAngleRight />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              style={{ background: 'none', border: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 18 }}
              title="Last Page"
            >
              <FaAngleDoubleRight />
            </button>
          </div>
        )}
      </div>

      {/* View Staff Modal */}
      {viewStaff && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeBtn}
              onClick={() => setViewStaff(null)}
            >
              &times;
            </button>
            <h2 className={styles.sectionHeader}>Staff Details</h2>
            <div className={styles.card}>
              <p><strong>Name:</strong> {viewStaff.firstName} {viewStaff.lastName}</p>
              <p><strong>Salary:</strong> {viewStaff.salary}</p>
              <p><strong>Wage Type:</strong> {viewStaff.wageType}</p>
              <p><strong>Payment On:</strong> {viewStaff.paymentOn}</p>
              <p><strong>Worker Type:</strong> {viewStaff.workerType}</p>
              <p><strong>Phone:</strong> {viewStaff.phone}</p>
              <p><strong>Transfer Mode:</strong> {viewStaff.mode}</p>
              <p><strong>Account:</strong> {viewStaff.account}</p>
              <p><strong>Street:</strong> {viewStaff.street}</p>
              <p><strong>City:</strong> {viewStaff.city}</p>
              <p><strong>State:</strong> {viewStaff.state}</p>
              <p><strong>Country:</strong> {viewStaff.country}</p>
              <p><strong>Pincode:</strong> {viewStaff.pincode}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
