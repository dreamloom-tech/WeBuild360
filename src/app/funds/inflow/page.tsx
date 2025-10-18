"use client";

import { useState, useEffect } from "react";
import styles from "../inflow/inflow.module.css";
import InflowForm from "@/components/InflowForm";
import InflowList from "@/components/InflowList";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const handleAddProject = (newProject: any) => {
    setProjects(prev => [...prev, newProject]);
    setShowForm(false);
  };

  const handleDeleteProject = (index: number) => {
    const updated = [...projects];
    updated.splice(index, 1);
    setProjects(updated);
  };

  useEffect(() => {
    document.body.style.overflow = showForm ? "hidden" : "auto";
  }, [showForm]);

  return (
    <div className={styles.wrap}>
      <div className={styles.headerRow}>
        <h2 className={styles.pageTitle}>Inflow</h2>
        <button className={styles.addButton} onClick={() => setShowForm(true)}>
          + Add Fund
        </button>
      </div>

      <InflowList projects={projects} onDelete={handleDeleteProject} />

      {showForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <InflowForm
              onSubmitProject={handleAddProject}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
