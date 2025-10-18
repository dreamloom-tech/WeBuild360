"use client";
import { useState } from "react";
import styles from "../manage/manageStock.module.css";
import { FaTrash, FaEye, FaUpload, FaPlus } from "react-icons/fa";

export default function ManageStockPage() {
  const [eventType, setEventType] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("Purchase");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const categories = [
    { type: "Cement", shop: "Bismi Mobiles" },
    { type: "Sand", shop: "Royal Traders" },
  ];
  const subCategories = [
    { name: "Grade 43", category: "Cement", shop: "Bismi Mobiles", unit: "Bag" },
    { name: "River Sand", category: "Sand", shop: "Royal Traders", unit: "Cft" },
  ];

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

  const filteredSubcategories = subCategories.filter(
    (sub) => sub.category === form.category && sub.shop === form.shop
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(form.price) * Number(form.quantity);
    setTransactions([
      ...transactions,
      { type: eventType, ...form, total, creditedAt: new Date().toLocaleDateString() },
    ]);
    setShowPopup(false);
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

  const tableData = transactions.filter((t) => t.type === activeTab);
  const paginatedData = tableData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Manage Stock</h2>

        <div className={styles.eventTypeDropdown}>
          <button
            className={styles.eventBtn}
            onClick={() => setShowPopup(true)}
          >
            <FaPlus /> Event Type
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabContainer}>
        {["Purchase", "Used", "Return"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Type</th>
              <th>Category</th>
              <th>Shop</th>
              <th>Comments</th>
              <th>Total</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length ? (
              paginatedData.map((row, i) => (
                <tr key={i}>
                  <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                  <td>{row.type}</td>
                  <td>{row.category}</td>
                  <td>{row.shop}</td>
                  <td>{row.comments || "-"}</td>
                  <td>{row.total}</td>
                  <td>{row.creditedAt}</td>
                  <td className={styles.actionBtns}>
                    <FaEye />
                    <FaUpload />
                    <FaTrash />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className={styles.emptyRow}>
                  No {activeTab.toLowerCase()} records found
                </td>
              </tr>
            )}
          </tbody>
        </table>

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
              <form onSubmit={handleSubmit} className={styles.formBox}>
                <div className={styles.formGrid}>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  <input type="text" placeholder="Project Name" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} />
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select Category</option>
                    {categories.map((c, i) => <option key={i} value={c.type}>{c.type}</option>)}
                  </select>
                  <select value={form.shop} onChange={(e) => setForm({ ...form, shop: e.target.value })}>
                    <option value="">Select Shop</option>
                    {categories.map((c, i) => <option key={i} value={c.shop}>{c.shop}</option>)}
                  </select>
                  <select value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })}>
                    <option value="">Select Subcategory</option>
                    {filteredSubcategories.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                  </select>
                  <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  <input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                  <textarea placeholder="Comments" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })}></textarea>
                </div>

                <button type="submit" className={styles.submitBtn}>Add {eventType}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
