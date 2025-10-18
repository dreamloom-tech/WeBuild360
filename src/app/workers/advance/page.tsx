"use client";

import { useState, useEffect } from "react";
import styles from "./advance.module.css";

export default function CashAdvancePage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [advanceInput, setAdvanceInput] = useState("");

  // Load staff data (replace with ManageStaff fetch)
  useEffect(() => {
    const mockData = [
      { firstName: "John", lastName: "David", workerType: "Engineer", advance: 5000 },
      { firstName: "Arun", lastName: "Kumar", workerType: "Helper", advance: 0 },
      { firstName: "Ravi", lastName: "Shankar", workerType: "Carpenter", advance: 200 },
    ];
    setStaffList(mockData);
  }, []);

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

    const updatedList = staffList.map(staff =>
      staff === selectedStaff ? { ...staff, advance: Number(advanceInput) } : staff
    );
    setStaffList(updatedList);
    closeModal();
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
                <td>
                  <button
                    className={styles.advanceBtn}
                    onClick={() => openModal(staff)}
                  >
                    Update Advance
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
