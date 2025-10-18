"use client";

import { useState } from "react";
import styles from "./managestaff.module.css";
import { FaTrash, FaEye, FaUpload, FaPlus, FaEdit } from "react-icons/fa";





interface Staff {
  firstName: string;
  lastName: string;
  wageType: string;
  paymentOn: string;
  salary: string;
  workerType: string;
  mode: string;
  account: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export default function ManageStaff() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [viewStaff, setViewStaff] = useState<Staff | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editIndex !== null) {
      const updated = [...staffList];
      updated[editIndex] = formData;
      setStaffList(updated);
      setEditIndex(null);
    } else {
      setStaffList([...staffList, formData]);
    }
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
    setShowModal(false);
  };

  const handleDelete = (index: number) => {
    const updated = [...staffList];
    updated.splice(index, 1);
    setStaffList(updated);
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
              <th>Name</th>
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
            {staffList.length > 0 ? (
              staffList.map((staff, index) => (
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
    onClick={() => handleEdit(staff, index)}
  />
  <FaTrash
    className={styles.actionIcon}
    title="Delete"
    onClick={() => handleDelete(index)}
  />
</td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className={styles.emptyText}>
                  No staff data added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
