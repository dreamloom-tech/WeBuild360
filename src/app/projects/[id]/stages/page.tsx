"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from './stages.module.css';
import { FaArrowRight, FaCheck, FaSave } from 'react-icons/fa';

// This will come from your API
const getProject = async (id: string) => {
  // TEMP: Use mock data if API fails
  try {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    return {
      projectName: data.projectName,
      projectValue: data.projectValue,
      currentStage: data.currentStage,
      stages: data.stages
    };
  } catch {
    // Fallback mock data
    return {
      projectName: "Political Membership App",
      projectValue: 25000,
      currentStage: "Framing",
      stages: [
        { name: 'Basement', estimation: 5000, status: 'completed' },
        { name: 'Framing', estimation: 10000, status: 'in-progress' },
        { name: 'Roofing', estimation: 10000, status: 'not-started' },
        { name: 'Completion', estimation: 5000, status: 'not-started' }
      ]
    };
  }
};

interface Stage {
  name: string;
  estimation: number;
  status: 'completed' | 'in-progress' | 'not-started';
}

interface Project {
  projectName: string;
  projectValue: number;
  currentStage: string;
  stages: Stage[];
}

export default function ProjectStages() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      if (id) {
        const data = await getProject(id as string);
        setProject(data);
        setLoading(false);
      }
    };
    loadProject();
  }, [id]);

  const handleNextStage = async () => {
    if (!project) return;
    
    const currentIndex = project.stages.findIndex(s => s.status === 'in-progress');
    if (currentIndex >= 0 && currentIndex < project.stages.length - 1) {
      const updatedStages = project.stages.map((stage, idx) => ({
        ...stage,
        status: idx === currentIndex ? 'completed' 
               : idx === currentIndex + 1 ? 'in-progress'
               : stage.status
      }));

      setProject(prev => prev ? {
        ...prev,
        currentStage: updatedStages[currentIndex + 1].name,
        stages: updatedStages
      } : null);

      // TODO: Update API
    }
  };

  if (loading || !project) {
    return <div className={styles.loading}>Loading project details...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Stage Level Estimation</h2>
        <div className={styles.projectValue}>
          Project Value: ₹{project.projectValue.toLocaleString()}.00
        </div>
      </div>

      <div className={styles.stagesGrid}>
        {project.stages.map((stage, index) => (
          <div key={stage.name} className={styles.stageRow}>
            <div className={styles.stageInfo}>
              <h3>{stage.name}</h3>
              <div className={styles.estimation}>
                <span>₹</span>
                <input 
                  type="text" 
                  value={stage.estimation.toLocaleString()}
                  readOnly
                />
                <span>.00</span>
              </div>
            </div>
            <div className={styles.stageStatus}>
              {stage.status === 'in-progress' ? (
                <>
                  <div className={`${styles.statusBadge} ${styles.onProgress}`}>
                    On Progress
                  </div>
                  <button 
                    className={styles.nextStageBtn}
                    onClick={handleNextStage}
                  >
                    Next Stage <FaArrowRight />
                  </button>
                </>
              ) : stage.status === 'completed' ? (
                <div className={`${styles.statusBadge} ${styles.completed}`}>
                  Completed <FaCheck />
                </div>
              ) : (
                <div className={`${styles.statusBadge} ${styles.notStarted}`}>
                  Not Started
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className={styles.updateBtn}>
        <FaSave /> Update Estimation
      </button>
    </div>
  );
}