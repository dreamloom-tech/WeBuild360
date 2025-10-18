"use client";

import { useState, useEffect } from "react";
import styles from "./salary.module.css";

export default function StaffSalary() {
  // Mock fetching from ManageStaff (later connect with real storage or context)
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
const [salaryForm, setSalaryForm] = useState({
  projectName: "",
  deductAdvance: "",
  givenAmount: "",
});

  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  // Load mock staff data (you can fetch from localStorage or DB)
  useEffect(() => {
    const mockData = [
      { firstName: "John", lastName: "David", workerType: "Engineer", salary: 30000, wageType: "Monthly", advance: 5000 },
      { firstName: "Arun", lastName: "Kumar", workerType: "Helper", salary: 12000, wageType: "Weekly", advance: 0 },
      { firstName: "Ravi", lastName: "Shankar", workerType: "Carpenter", salary: 800, wageType: "Daily", advance: 200 },
    ];
    setStaffList(mockData);
  }, []);

  const handleSalaryButtonClick = (staff: any) => {
    setSelectedStaff(staff);
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setSalaryForm({
      ...salaryForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSalarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    const advance = selectedStaff.advance || 0;
    const salary = selectedStaff.salary || 0;
    const given = Number(salaryForm.givenAmount) || 0;
    const deducted = Number(salaryForm.deductAdvance) || 0;
    const totalPaid = given + deducted;
    const pending = salary - totalPaid;

    const record = {
      name: `${selectedStaff.firstName} ${selectedStaff.lastName}`,
      type: selectedStaff.workerType,
      salary: salary,
      paid: totalPaid,
      pending: pending <= 0 ? 0 : pending,
      status: pending <= 0 ? "Paid" : "Unpaid",
    };

    setPaymentHistory([...paymentHistory, record]);
    setSelectedStaff(null);
    setSalaryForm({ projectName: "", deductAdvance: false, givenAmount: "" });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Staff Salary Management</h1>

      {/* Date Selection */}
      <div className={styles.dateBox}>
        <label>Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={styles.dateInput}
        />
      </div>

      {selectedDate && (
        <>
          {/* Staff List */}
          <h2 className={styles.sectionHeader}>Staff List</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Salary</th>
                  <th>Salary Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff, i) => (
                  <tr key={i}>
                    <td>{staff.firstName} {staff.lastName}</td>
                    <td>{staff.workerType}</td>
                    <td>{staff.salary}</td>
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

          {/* Salary Form */}
          {selectedStaff && (
            <div className={styles.salaryFormBox}>
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
                    <label>Project Name:</label>
                    <select
                      name="projectName"
                      value={salaryForm.projectName}
                      onChange={handleSalaryChange}
                      className={styles.select}
                      required
                    >
                      <option value="">Select Project</option>
                      <option>Residential Building</option>
                      <option>Shopping Complex</option>
                      <option>Mobile Shop Renovation</option>
                      <option>Office Interior Work</option>
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
                </div>

                <button type="submit" className={styles.submitBtn}>Submit Salary</button>
              </form>
            </div>
          )}

          {/* Payment History */}
          <h2 className={styles.sectionHeader}>Payment History</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Salary</th>
                  <th>Paid</th>
                  <th>Pending</th>
                  <th>Status</th>
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
                      <td className={p.status === "Paid" ? styles.paid : styles.unpaid}>
                        {p.status}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className={styles.emptyText}>
                      No payment history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

