"use client";

import { useState } from "react";
import styles from "./transfer.module.css";

export default function TransferStock() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    fromProject: "",
    toProject: "",
    category: "",
    subCategory: "",
    price: "",
    quantity: "",
  });
  const [records, setRecords] = useState<any[]>([]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = (Number(formData.price) || 0) * (Number(formData.quantity) || 0);

    const newRecord = {
      date: formData.date,
      fromProject: formData.fromProject,
      toProject: formData.toProject,
      category: formData.category,
      subCategory: formData.subCategory,
      price: formData.price,
      quantity: formData.quantity,
      total: total,
    };

    setRecords([...records, newRecord]);
    setFormData({
      date: "",
      fromProject: "",
      toProject: "",
      category: "",
      subCategory: "",
      price: "",
      quantity: "",
    });
    setShowModal(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Transfer Stock</h2>
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          + Transfer
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>From</th>
              <th>To</th>
              <th>Category</th>
              <th>Sub Category</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={9} className={styles.empty}>
                  No transfer records found.
                </td>
              </tr>
            ) : (
              records.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.date}</td>
                  <td>{item.fromProject}</td>
                  <td>{item.toProject}</td>
                  <td>{item.category}</td>
                  <td>{item.subCategory}</td>
                  <td>Unit</td>
                  <td>{item.price}</td>
                  <td>{item.total}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className={styles.closeBtn}
            >
              &times;
            </button>

            <h3>Transfer Stock Entry</h3>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div>
                <label>Transaction Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.sectionTitle}>Transfer From</div>
              <div>
                <label>Project Name</label>
                <select
                  name="fromProject"
                  value={formData.fromProject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option>Residential Project</option>
                  <option>Commercial Complex</option>
                  <option>Office Interior</option>
                </select>
              </div>

              <div className={styles.sectionTitle}>Transfer To</div>
              <div>
                <label>Project Name</label>
                <select
                  name="toProject"
                  value={formData.toProject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option>Residential Project</option>
                  <option>Commercial Complex</option>
                  <option>Office Interior</option>
                </select>
              </div>

              <div className={styles.sectionTitle}>Material Details</div>
              <div>
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option>Wood</option>
                  <option>Cement</option>
                  <option>Steel</option>
                  <option>Electrical</option>
                </select>
              </div>

              <div>
                <label>Sub Category</label>
                <select
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Sub Category</option>
                  <option>Plank</option>
                  <option>Rod</option>
                  <option>Wire</option>
                  <option>Pipe</option>
                </select>
              </div>

              <div>
                <label>Per Item Price</label>
                <input
                  type="number"
                  name="price"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                Transfer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}




// "use client";

// import { useState } from "react";
// import styles from "./transfer.module.css";

// export default function TransferStock() {
//   const [showModal, setShowModal] = useState(false);
//   const [formData, setFormData] = useState({
//     date: "",
//     fromProject: "",
//     toProject: "",
//     category: "",
//     subCategory: "",
//     price: "",
//     quantity: "",
//     comments: "",
//   });
//   const [records, setRecords] = useState<any[]>([]);

//   const handleChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
//     >
//   ) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const total = (Number(formData.price) || 0) * (Number(formData.quantity) || 0);

//     const newRecord = {
//       date: formData.date,
//       fromProject: formData.fromProject,
//       toProject: formData.toProject,
//       category: formData.category,
//       subCategory: formData.subCategory,
//       price: formData.price,
//       quantity: formData.quantity,
//       total: total,
//       comments: formData.comments,
//     };

//     setRecords([...records, newRecord]);
//     setFormData({
//       date: "",
//       fromProject: "",
//       toProject: "",
//       category: "",
//       subCategory: "",
//       price: "",
//       quantity: "",
//       comments: "",
//     });
//     setShowModal(false);
//   };

//   return (
//     <div className={styles.container}>
//       {/* ===== Header Section ===== */}
//       <div className={styles.header}>
//         <h2>Transfer Stock</h2>
//         <button className={styles.addBtn} onClick={() => setShowModal(true)}>
//           + Transfer
//         </button>
//       </div>

//       {/* ===== Table Section ===== */}
//       <div className={styles.tableWrapper}>
//         <table className={styles.table}>
//           <thead>
//             <tr>
//               <th>S.No</th>
//               <th>Date</th>
//               <th>From</th>
//               <th>To</th>
//               <th>Category</th>
//               <th>Sub Category</th>
//               <th>Unit</th>
//               <th>Price</th>
//               <th>Total</th>
//               <th>Comments</th>
//             </tr>
//           </thead>
//           <tbody>
//             {records.length === 0 ? (
//               <tr>
//                 <td colSpan={10} className={styles.empty}>
//                   No transfer records found.
//                 </td>
//               </tr>
//             ) : (
//               records.map((item, index) => (
//                 <tr key={index}>
//                   <td>{index + 1}</td>
//                   <td>{item.date}</td>
//                   <td>{item.fromProject}</td>
//                   <td>{item.toProject}</td>
//                   <td>{item.category}</td>
//                   <td>{item.subCategory}</td>
//                   <td>Unit</td>
//                   <td>{item.price}</td>
//                   <td>{item.total}</td>
//                   <td>{item.comments}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* ===== Modal Popup Form ===== */}
//       {showModal && (
//         <div className={styles.modalOverlay}>
//           <div className={styles.modal}>
//             {/* Close Icon */}
//             <button
//               type="button"
//               onClick={() => setShowModal(false)}
//               className={styles.closeBtn}
//             >
//               &times;
//             </button>

//             <h3>Transfer Stock Entry</h3>
//             <form onSubmit={handleSubmit} className={styles.formGrid}>
//               <div>
//                 <label>Transaction Date</label>
//                 <input
//                   type="date"
//                   name="date"
//                   value={formData.date}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>

//               <div className={styles.sectionTitle}>Transfer From</div>
//               <div>
//                 <label>Project Name</label>
//                 <select
//                   name="fromProject"
//                   value={formData.fromProject}
//                   onChange={handleChange}
//                   required
//                 >
//                   <option value="">Select</option>
//                   <option>Residential Project</option>
//                   <option>Commercial Complex</option>
//                   <option>Office Interior</option>
//                 </select>
//               </div>

//               <div className={styles.sectionTitle}>Transfer To</div>
//               <div>
//                 <label>Project Name</label>
//                 <select
//                   name="toProject"
//                   value={formData.toProject}
//                   onChange={handleChange}
//                   required
//                 >
//                   <option value="">Select</option>
//                   <option>Residential Project</option>
//                   <option>Commercial Complex</option>
//                   <option>Office Interior</option>
//                 </select>
//               </div>

//               <div className={styles.sectionTitle}>Material Details</div>
//               <div>
//                 <label>Category</label>
//                 <select
//                   name="category"
//                   value={formData.category}
//                   onChange={handleChange}
//                   required
//                 >
//                   <option value="">Select Category</option>
//                   <option>Wood</option>
//                   <option>Cement</option>
//                   <option>Steel</option>
//                   <option>Electrical</option>
//                 </select>
//               </div>

//               <div>
//                 <label>Sub Category</label>
//                 <select
//                   name="subCategory"
//                   value={formData.subCategory}
//                   onChange={handleChange}
//                   required
//                 >
//                   <option value="">Select Sub Category</option>
//                   <option>Plank</option>
//                   <option>Rod</option>
//                   <option>Wire</option>
//                   <option>Pipe</option>
//                 </select>
//               </div>

//               <div>
//                 <label>Per Item Price</label>
//                 <input
//                   type="number"
//                   name="price"
//                   placeholder="Enter price"
//                   value={formData.price}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>

//               <div>
//                 <label>Quantity</label>
//                 <input
//                   type="number"
//                   name="quantity"
//                   placeholder="Enter quantity"
//                   value={formData.quantity}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>

//               <div>
//                 <label>Comments</label>
//                 <textarea
//                   name="comments"
//                   placeholder="Enter comments"
//                   value={formData.comments}
//                   onChange={handleChange}
//                 />
//               </div>

//               <button type="submit" className={styles.submitBtn}>
//                 Transfer
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
