"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import fetchWithAuth from "@/lib/fetchWithAuth";
import styles from "./expenses.module.css";
import { FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

type Expense = {
  _id: string;
  projectId: string;
  type: "material" | "salary";
  category?: string;
  item?: string;
  staffName?: string;
  amount: number;
  quantity?: number;
  date: string;
  description?: string;
};

type MaterialUsage = {
  _id: string;
  projectId?: string;
  category: string;
  item: string;
  purchaseAmount?: number;
  purchaseQuantity?: number;
  returnAmount?: number;
  returnQuantity?: number;
  usedQuantity?: number;
  remainingQuantity?: number;
  netCost?: number;
};

export default function ProjectExpensesPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [activeTab, setActiveTab] = useState<"all" | "materials" | "salary" | "usage">("all");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [materialUsage, setMaterialUsage] = useState<MaterialUsage[]>([]);
  const [projectDetails, setProjectDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) return;
      try {
        // Fetch project details
        const projectRes = await fetchWithAuth(`/api/projects/${projectId}/profitability`);
        const projectData = await projectRes.json();
        setProjectDetails(projectData);

        // Fetch all expenses (purchases)
        const expensesRes = await fetchWithAuth(`/api/expenses?projectId=${projectId}`);
        const expensesData = await expensesRes.json();

        // Fetch material returns
        const returnsRes = await fetchWithAuth(`/api/materials/return-details?projectId=${projectId}`);
        const returnsData = await returnsRes.json();

        // Fetch salary entries for project
        const salaryRes = await fetchWithAuth(`/api/salary?projectId=${projectId}`);
        const salaryData = await salaryRes.json();

        // Normalize salary entries to Expense shape and mark returns as negative amounts where appropriate
        const salaryExpenses = (salaryData || []).map((s: any) => ({
          _id: s._id,
          projectId: s.projectId,
          type: 'salary' as const,
          staffName: s.name || s.staffName || s.staff || '',
          amount: s.amount || 0,
          date: s.date || s.createdAt || new Date().toISOString(),
          description: s.note || ''
        }));

        const returnExpenses = (returnsData || []).map((r: any) => ({
          _id: r._id,
          projectId: r.projectId,
          type: 'material' as const,
          category: r.category,
          item: r.item,
          amount: r.amount || 0,
          quantity: r.quantity || 0,
          date: r.date,
          description: r.note || 'Return'
        }));

        // Combine purchases, returns and salary into a single expenses list for display
        setExpenses([...(expensesData || []), ...returnExpenses, ...salaryExpenses]);

        // Fetch material usage summary
        const usageRes = await fetchWithAuth(`/api/projects/${projectId}/materials-usage`);
        const usageData = await usageRes.json();
        setMaterialUsage(usageData.materials || []);

      } catch (error) {
        console.error("Failed to fetch project expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  // Filter expenses based on active tab
  const filteredExpenses = expenses.filter(expense => {
    if (activeTab === "all") return true;
    if (activeTab === "materials") return expense.type === "material";
    if (activeTab === "salary") return expense.type === "salary";
    return true;
  });

  // Group expenses by category for summary
  const expenseSummary = filteredExpenses.reduce((acc: any, expense) => {
    const key = expense.type === "material" ? expense.category || "Other" : "Salary";
    if (!acc[key]) {
      acc[key] = {
        total: 0,
        count: 0,
        items: []
      };
    }
    acc[key].total += expense.amount;
    acc[key].count += 1;
    acc[key].items.push(expense);
    return acc;
  }, {});

  if (!projectId) {
    return <div className={styles.error}>Project ID is required</div>;
  }

  if (loading) {
    return <div className={styles.loading}>Loading project expenses...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/projects" className={styles.backLink}>
          <FaArrowLeft /> Back to Projects
        </Link>
        <h1 className={styles.title}>Project Expenses</h1>
      </div>

      {projectDetails && (
        <div className={styles.summary}>
          <div className={styles.summaryCard}>
            <h3>Project Value</h3>
            <div className={styles.amount}>₹{projectDetails.projectValue?.toLocaleString()}</div>
          </div>
          <div className={styles.summaryCard}>
            <h3>Total Expenses</h3>
            <div className={styles.amount}>₹{projectDetails.expenses?.total?.toLocaleString()}</div>
          </div>
          <div className={styles.summaryCard}>
            <h3>Current Profit</h3>
            <div className={`${styles.amount} ${projectDetails.profit >= 0 ? styles.positive : styles.negative}`}>
              ₹{projectDetails.profit?.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === "all" ? styles.active : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Expenses
        </button>
        <button 
          className={`${styles.tab} ${activeTab === "materials" ? styles.active : ""}`}
          onClick={() => setActiveTab("materials")}
        >
          Materials
        </button>
        <button 
          className={`${styles.tab} ${activeTab === "salary" ? styles.active : ""}`}
          onClick={() => setActiveTab("salary")}
        >
          Salary
        </button>
        <button 
          className={`${styles.tab} ${activeTab === "usage" ? styles.active : ""}`}
          onClick={() => setActiveTab("usage")}
        >
          Material Usage
        </button>
      </div>

      {activeTab === "usage" ? (
        <div className={styles.materialUsage}>
          <h2>Material Usage Summary</h2>
          {materialUsage.map((material) => (
            <div key={material._id} className={styles.materialCard}>
              <div className={styles.materialHeader}>
                <h3>{material.category} - {material.item}</h3>
                <div className={styles.quantities}>
                  <span>Purchased: {material.purchaseQuantity}</span>
                  <span>Used: {material.usedQuantity}</span>
                  <span>Returned: {material.returnQuantity}</span>
                  <span className={styles.remaining}>Remaining: {material.remainingQuantity}</span>
                </div>
              </div>
              <div className={styles.materialCosts}>
                <div>Purchase Cost: ₹{material.purchaseAmount?.toLocaleString()}</div>
                <div>Returns: ₹{material.returnAmount?.toLocaleString()}</div>
                <div className={styles.netCost}>Net Cost: ₹{material.netCost?.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.expenseList}>
          {Object.entries(expenseSummary).map(([category, data]: [string, any]) => (
            <div key={category} className={styles.categorySection}>
              <div className={styles.categoryHeader}>
                <h2>{category}</h2>
                <div className={styles.categoryTotal}>
                  Total: ₹{data.total.toLocaleString()} ({data.count} items)
                </div>
              </div>
              <div className={styles.items}>
                {data.items.map((expense: Expense) => (
                  <div key={expense._id} className={styles.expenseItem}>
                    <div className={styles.expenseHeader}>
                      <div className={styles.expenseInfo}>
                        {expense.type === "material" ? (
                          <>
                            <span className={styles.itemName}>{expense.item}</span>
                            {expense.quantity && (
                              <span className={styles.quantity}>Qty: {expense.quantity}</span>
                            )}
                          </>
                        ) : (
                          <span className={styles.itemName}>{expense.staffName}</span>
                        )}
                      </div>
                      <div className={styles.expenseAmount}>₹{expense.amount.toLocaleString()}</div>
                    </div>
                    <div className={styles.expenseDetails}>
                      <span className={styles.date}>
                        {new Date(expense.date).toLocaleDateString()}
                      </span>
                      {expense.description && (
                        <span className={styles.description}>{expense.description}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}