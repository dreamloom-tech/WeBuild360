"use client";

import { useState, useEffect } from "react";
import fetchWithAuth from '@/lib/fetchWithAuth';
import styles from "../projects/projects.module.css";
import ProjectForm from "@/components/ProjectForm";
import ProjectList from "@/components/ProjectList";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);

  const handleAddProject = async (newProject: any) => {
    try {
      // server expects `name` field
      const payload = {
        name: newProject.projectName || newProject.name,
        clientName: newProject.clientName,
        projectValue: newProject.projectValue,
        projectStart: newProject.startDate || newProject.projectStart,
        duration: newProject.totalDays || newProject.duration,
        address: newProject.address,
        street: newProject.street,
        postalCode: newProject.postalCode,
        city: newProject.city,
        country: newProject.country,
      };
      const res = await fetchWithAuth('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create');
      // normalize returned project to UI shape
      const uiProject = { ...json, projectName: json.name || json.projectName };
      setProjects(prev => [...prev, uiProject]);
      setShowForm(false);
    } catch (err: any) {
      console.error(err);
      // simple non-blocking message: setProjects unchanged and log
    }
  };

  const handleUpdateProject = async (id: string, updated: any) => {
    try {
      // server expects id as query param
      const payload = {
        name: updated.projectName || updated.name,
        clientName: updated.clientName,
        projectValue: updated.projectValue,
        projectStart: updated.startDate || updated.projectStart,
        duration: updated.totalDays || updated.duration,
        address: updated.address,
        street: updated.street,
        postalCode: updated.postalCode,
        city: updated.city,
        country: updated.country,
      };
      // include id both as path segment and query param to satisfy the API route implementation
      const res = await fetchWithAuth(`/api/projects/${id}?id=${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const text = await res.text();
      let json: any = null;
      try { json = text ? JSON.parse(text) : null; } catch (_) { json = null; }
      if (!res.ok) throw new Error((json && json.error) || `Failed to update (${res.status})`);
      const uiProject = { ...json, projectName: json.name || json.projectName };
      setProjects(prev => prev.map(p => p._id === id ? uiProject : p));
      setEditingProject(null);
      setShowForm(false);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (index: number) => {
    const project = projects[index];
    if (!project || !project._id) return;
    try {
      // call route with path param and query param to hit the [id]/route.ts and satisfy its id check
      const res = await fetchWithAuth(`/api/projects/${project._id}?id=${project._id}`, { method: 'DELETE' });
      const text = await res.text();
      let json: any = null;
      try { json = text ? JSON.parse(text) : null; } catch (_) { json = null; }
      if (!res.ok) throw new Error((json && json.error) || `Failed to delete (${res.status})`);
      const updated = [...projects];
      updated.splice(index, 1);
      setProjects(updated);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Optional: prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = showForm ? "hidden" : "auto";
  }, [showForm]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchWithAuth('/api/projects');
        const json = await res.json();
        if (mounted) {
          const normalized = (json || []).map((p: any) => ({ ...p, projectName: p.name || p.projectName }));
          setProjects(normalized);
        }
      } catch (err) {
        // keep empty
      }
    })();
    return () => { mounted = false; };
  }, []);

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
      <ProjectList projects={projects} onDelete={handleDeleteProject} onUpdate={(p: any) => { setEditingProject(p); setShowForm(true); }} onCreate={() => setShowForm(true)} />

      {/* Modal Form */}
      {showForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={() => { setShowForm(false); setEditingProject(null); }}>✖</button>
            <ProjectForm initialData={editingProject || undefined} onSubmitProject={async (data: any) => {
              if (editingProject && editingProject._id) {
                await handleUpdateProject(editingProject._id, data);
              } else {
                await handleAddProject(data);
              }
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
