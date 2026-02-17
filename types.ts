
export enum TestStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED'
}

export interface Defect {
  id: string;
  errorMessage: string;
  affectedEndpoint: string;
  occurrences: number;
  lastSeen: string;
  status: 'Open' | 'Investigating' | 'Fixed';
}

export interface Scenario {
  id: string;
  runId: string;
  name: string;
  status: TestStatus;
  duration: number;
  tags: string[];
  errorMessage?: string;
  stackTrace?: string;
  rawLogs?: string;
  featureName?: string;
  hostname?: string;
  sourceFile?: string;
  metadata?: {
    lastRequest?: any;
    lastResponse?: any;
  };
  steps: Array<{
    name: string;
    status: TestStatus;
    keyword: string;
    duration?: number;
    log?: string;
  }>;
  timestamp: string;
}

export interface ExecutionRun {
  id: string;
  name: string;
  timestamp: string;
  duration: number;
  project: string;
  environment: string;
  triggeredBy: string;
  passedCount: number;
  failedCount: number;
  skippedCount: number;
  totalCount: number;
  tags: string[];
}

export interface DashboardStats {
  passRate: number;
  passRateTrend: number;
  totalRuns: number;
  totalRunsTrend: number;
  avgDuration: string;
  avgDurationTrend: number;
}

export interface TimelineData {
  day: string;
  pass: number;
  fail: number;
  skip: number;
  total: number;
}
