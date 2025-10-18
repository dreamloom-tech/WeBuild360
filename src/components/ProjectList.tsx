"use client";

import { useState } from "react";
import { FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import styles from "../app/projects/projectList.module.css";

export default function ProjectList({
  projects,
  onDelete,
}: {
  projects: any[];
  onDelete?: (index: number) => void;
}) {
  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const paginatedProjects = projects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const renderPageButtons = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages.map((page, index) =>
      typeof page === "number" ? (
        <button
          key={index}
          className={`${styles.pageButton} ${currentPage === page ? styles.active : ""}`}
          onClick={() => goToPage(page)}
        >
          {page}
        </button>
      ) : (
        <span key={index} className={styles.ellipsis}>...</span>
      )
    );
  };

  return (
    <div className={styles.container}>
      {/* <h3 className={styles.title}>Project Overview</h3> */}

      {projects.length === 0 ? (
        <div className={styles.empty}>No projects available.</div>
      ) : (
        <div className={styles.grid}>
          {paginatedProjects.map((project, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.cardBody}>
                <div className={styles.cardColumn}>
                  <p><strong>Project:</strong> {project.projectName}</p>
                  <p><strong>Client:</strong> {project.clientName}</p>
                  <p><strong>Address:</strong> {project.address}</p>
                  <p><strong>Street:</strong> {project.street}</p>
                  <p><strong>Postal:</strong> {project.postalCode}</p>
                </div>
                <div className={styles.cardColumn}>
                  <p><strong>Start:</strong> {project.startDate}</p>
                  <p><strong>Days:</strong> {project.totalDays}</p>
                  <p><strong>City:</strong> {project.city}</p>
                  <p><strong>Country:</strong> {project.country}</p>
                  <p><strong>Value:</strong> ₹{project.projectValue}</p>
                </div>
              </div>
              <div className={styles.divider}></div>
              <div className={styles.actions}>
                <button className={styles.update}>📝 Update</button>
                <button className={styles.delete} onClick={() => onDelete?.(index)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
          >
            <FaAngleDoubleLeft />
          </button>
          <button
            className={styles.pageButton}
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaAngleLeft />
          </button>

          {renderPageButtons()}

          <button
            className={styles.pageButton}
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FaAngleRight />
          </button>
          <button
            className={styles.pageButton}
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <FaAngleDoubleRight />
          </button>
        </div>
      )}
    </div>
  );
}
