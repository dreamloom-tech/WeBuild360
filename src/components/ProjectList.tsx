"use client";

import { useState, useEffect, useRef } from "react";
import { FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import Link from "next/link";
import styles from "../app/projects/projectList.module.css";

type Project = {
  _id: string;
  projectName: string;
  clientName?: string;
  projectValue?: number;
  receivedAmount?: number;
  projectStart?: string;
  duration?: number;
  status?: 'active' | 'completed';
  address?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  country?: string;
};

export default function ProjectList({
  projects,
  onDelete,
  onUpdate,
}: {
  projects: Project[];
  onDelete?: (index: number) => void;
  onUpdate?: (project: Project) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(3); // will adjust on resize
  const [currentPage, setCurrentPage] = useState(1);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
      // single card per page on small screens
      if (w < 600) setItemsPerPage(1);
      else if (w < 1000) setItemsPerPage(2);
      else setItemsPerPage(3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Dummy filter and search (frontend only)
  const filteredProjects = projects.filter(project => {
    // Search by projectName or clientName
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      (project.projectName && project.projectName.toLowerCase().includes(search)) ||
      (project.clientName && project.clientName.toLowerCase().includes(search));

    // Dummy status filter
    const matchesFilter =
      filterStatus === "all" ||
      (project.status && project.status.toLowerCase() === filterStatus);

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));
  
  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // clamp current page if itemsPerPage changes
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [itemsPerPage, totalPages]);

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // touch handlers for manual swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    if (touchStartX.current == null || touchEndX.current == null) return;
    const dx = touchStartX.current - touchEndX.current;
    const threshold = 50; // px
    if (dx > threshold) {
      // swiped left -> next
      goToPage(currentPage + 1);
    } else if (dx < -threshold) {
      // swiped right -> prev
      goToPage(currentPage - 1);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className={styles.projectListContainer}>
      <div className={styles.searchFilterRow}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Projects</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {filteredProjects.length === 0 ? (
        <div className={styles.empty}>No projects available.</div>
      ) : (
        <>
          <div className={styles.projectGrid} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {paginatedProjects.map((project, idx) => {
              const actualIndex = (currentPage - 1) * itemsPerPage + idx;
              return (
                <div key={project._id} className={styles.projectCard}>
                  <div className={styles.cardHeader}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 12, opacity: 0.9 }}>Project For: {project.clientName || 'Client'}</div>
                      <div style={{ fontSize: 12 }}>Active</div>
                    </div>
                    <h3 className={styles.cardTitle}>{project.projectName}</h3>
                  </div>

                  <div className={styles.cyanStripe}>
                    <div className={styles.stripeLeft}>
                      <div className={styles.stripeLabel}>Estimation</div>
                      <div className={styles.stripeValue}>₹{project.projectValue?.toLocaleString() || '-'}</div>
                    </div>
                    <div className={styles.stripeRight}>
                      <div className={styles.stripeLabel}>Received</div>
                      <div className={styles.stripeValue}>₹{project.receivedAmount?.toLocaleString() || '-'}</div>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardBodyText}>
                      <div className={styles.cardRowTop}>
                        <div className={styles.left}><strong>Start:</strong> {project.projectStart ? new Date(project.projectStart).toLocaleDateString() : '-'}</div>
                        <div className={styles.right}><strong>Duration:</strong> {project.duration ? `${project.duration} days` : '-'}</div>
                      </div>
                    </div>
                    <div className={styles.cardFooter}>
                      <div className={styles.stageInfo}>
                       
                        <Link 
                          href={`/projects/${project._id}/stages`}
                          className={styles.detailsLink}
                        >
                          View Stage Details →
                        </Link>
                         <div className={styles.right}><strong>Current Stage:</strong> {project.currentStage ? `${project.currentStage} stage` : '-'}</div>
                      </div>
                      <div className={styles.actionButtons}>
                        <button 
                          className={styles.iconButton} 
                          title="Edit" 
                          onClick={() => onUpdate?.(project)}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className={styles.iconButton} 
                          title="Delete" 
                          onClick={() => onDelete?.(actualIndex)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination} style={{ marginTop: 28 }}>
              <button className={styles.iconPage} onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous"><FaChevronLeft /></button>
              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} className={`${styles.pageButton} ${currentPage === i + 1 ? styles.active : ''}`} onClick={() => goToPage(i + 1)}>{i + 1}</button>
                ))}
              </div>
              <button className={styles.iconPage} onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next"><FaChevronRight /></button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
