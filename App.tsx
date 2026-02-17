
import React, { useState } from 'react';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import EndpointsView from './components/EndpointsView';
import TestRunsView from './components/TestRunsView';
import ProjectDetailView from './components/ProjectDetailView';

import PerformanceReportView from './components/PerformanceReportView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [navigationState, setNavigationState] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNavigate = (tab: string, state: any = null) => {
    setActiveTab(tab);
    setNavigationState(state);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView refreshKey={refreshKey} onNavigate={handleNavigate} />;
      case 'endpoints':
        return <EndpointsView
          refreshKey={refreshKey}
          initialEndpoint={navigationState?.endpoint}
          onNavigate={handleNavigate}
        />;
      case 'runs':
        return <TestRunsView
          refreshKey={refreshKey}
          initialProject={navigationState?.project}
          onNavigate={handleNavigate}
        />;
      case 'project-report':
        return <ProjectDetailView
          projectName={navigationState?.project}
          initialRuns={navigationState?.runs}
          onBack={() => handleNavigate('runs', { project: navigationState?.project })}
        />;
      case 'performance-report':
        return <PerformanceReportView
          reportUrl={navigationState?.reportUrl}
          timestamp={navigationState?.timestamp}
          selectedEndpoint={navigationState?.endpoint}
          onBack={() => handleNavigate('endpoints', { endpoint: navigationState?.endpoint })}
        />;
      default:
        return <DashboardView refreshKey={refreshKey} onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        {renderContent()}
      </Layout>
    </>
  );
};

export default App;
