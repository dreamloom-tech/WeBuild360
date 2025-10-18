"use client";

import { useState, useEffect } from "react";
import styles from "../projects/projects.module.css";
import ProjectForm from "@/components/ProjectForm";
import ProjectList from "@/components/ProjectList";

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

  // Optional: prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = showForm ? "hidden" : "auto";
  }, [showForm]);

  return (
    <div className={styles.wrap}>
      {/* Header Row */}
      <div className={styles.headerRow}>
        <h2 className={styles.pageTitle}>Projects</h2>
        <button className={styles.addButton} onClick={() => setShowForm(true)}>
          + Add Project
        </button>
      </div>

      {/* Table */}
      <ProjectList projects={projects} onDelete={handleDeleteProject} />

      {/* Modal Form */}
      {showForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={() => setShowForm(false)}>✖</button>
            <ProjectForm onSubmitProject={handleAddProject} />
          </div>
        </div>
      )}
    </div>
  );
}
