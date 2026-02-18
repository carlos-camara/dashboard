
import { ExecutionRun, Scenario, TestStatus, DashboardStats, TimelineData, Defect } from '../types';

const STORAGE_KEYS = {
  RUNS: 'qa_hub_runs',
  DEFECTS: 'qa_hub_defects',
  SCENARIOS: 'qa_hub_scenarios_db'
};

const getStored = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

const saveStored = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return "http://localhost:3001/api";

  // Ensure it ends with /api and no double slashes
  let sanitized = envUrl.trim();
  if (sanitized.endsWith('/')) sanitized = sanitized.slice(0, -1);
  if (!sanitized.endsWith('/api')) sanitized += '/api';
  return sanitized;
};

const BASE_URL = getBaseUrl();

export const api = {
  checkHealth: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/health`).catch(() => null);
      return response ? response.ok : false;
    } catch (e) {
      return false;
    }
  },

  syncReports: async (): Promise<{ newRuns: number }> => {
    try {
      const response = await fetch(`${BASE_URL}/sync`, { method: 'POST' });
      if (!response.ok) throw new Error('Sync failed');
      const data = await response.json();
      return { newRuns: data.new_runs_discovered };
    } catch (e) {
      console.error('Error syncing:', e);
      return { newRuns: 0 };
    }
  },

  getStats: async (days: number = 7): Promise<DashboardStats> => {
    const runs = await api.getRecentRuns();
    const now = new Date();
    const filteredRuns = days === 0 ? runs : runs.filter(r => (now.getTime() - new Date(r.timestamp).getTime()) / (1000 * 3600 * 24) <= days);
    const totalTests = filteredRuns.reduce((acc, r) => acc + r.totalCount, 0);
    const totalPassed = filteredRuns.reduce((acc, r) => acc + r.passedCount, 0);
    const passRate = totalTests > 0 ? Number(((totalPassed / totalTests) * 100).toFixed(1)) : 0;
    const totalDurationSec = filteredRuns.reduce((acc, r) => acc + (r.duration || 0), 0);
    const avgDurationSec = filteredRuns.length > 0 ? totalDurationSec / filteredRuns.length : 0;

    return {
      passRate, passRateTrend: 0, totalRuns: filteredRuns.length, totalRunsTrend: 0,
      avgDuration: `${Math.floor(avgDurationSec / 60)}m ${Math.floor(avgDurationSec % 60)}s`,
      avgDurationTrend: 0
    };
  },

  getTimeline: async (days: number = 7): Promise<TimelineData[]> => {
    const runs = await api.getRecentRuns();
    const timeline: Record<string, TimelineData> = {};
    const now = new Date();
    runs.forEach(run => {
      const date = new Date(run.timestamp);
      if (days !== 0 && (now.getTime() - date.getTime()) / (1000 * 3600 * 24) > days) return;
      const dayLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      // Initialize with total: 0
      if (!timeline[dayLabel]) timeline[dayLabel] = { day: dayLabel, pass: 0, fail: 0, skip: 0, total: 0 };
      timeline[dayLabel].pass += run.passedCount;
      timeline[dayLabel].fail += run.failedCount;
      timeline[dayLabel].skip += run.skippedCount;
      // Update total
      timeline[dayLabel].total += (run.passedCount + run.failedCount + run.skippedCount);
    });
    return Object.values(timeline).sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
  },

  getRecentRuns: async (): Promise<ExecutionRun[]> => {
    try {
      const response = await fetch(`${BASE_URL}/runs`);
      if (!response.ok) return [];
      return await response.json();
    } catch (e) {
      console.error('Error fetching runs:', e);
      return [];
    }
  },

  getScenariosByRun: async (runId: string): Promise<Scenario[]> => {
    try {
      const response = await fetch(`${BASE_URL}/runs/${runId}/scenarios`);
      if (!response.ok) return [];
      return await response.json();
    } catch (e) {
      console.error('Error fetching scenarios:', e);
      return [];
    }
  },

  getDefects: async (): Promise<Defect[]> => {
    // Backend doesn't have defects implemented yet, returning empty
    return [];
  },

  deleteRun: async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/runs?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete run failed');
    } catch (e) {
      console.error('Error deleting run:', e);
    }
  },

  deleteProject: async (name: string) => {
    try {
      const response = await fetch(`${BASE_URL}/projects?name=${encodeURIComponent(name)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete project failed');
    } catch (e) {
      console.error('Error deleting project:', e);
    }
  },
  processFiles: async (xmlFiles: File[]): Promise<{ projectName: string, scenariosFound: number, isDuplicate: boolean }> => {
    try {
      const formData = new FormData();
      xmlFiles.forEach(file => formData.append('files', file));

      const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();

      return {
        projectName: data.projectName,
        scenariosFound: data.totalCount,
        isDuplicate: false
      };
    } catch (e: any) {
      console.error('Error processing files details:', e);
      const errorMessage = e.message || 'Unknown error';
      return { projectName: `Error: ${errorMessage}`, scenariosFound: 0, isDuplicate: false };
    }
  },

  getScreenshotUrl: (filename: string): string => {
    // BASE_URL is something like http://localhost:3001/api or https://app.onrender.com/api
    return BASE_URL.replace(/\/api$/, '') + `/screenshots/${filename}`;
  },

  getAssetUrl: (relativePath: string): string => {
    const baseUrl = BASE_URL.replace(/\/api$/, '');
    const pathToUse = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${baseUrl}${pathToUse}`;
  }
};

