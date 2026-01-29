
import React, { useState } from 'react';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import EndpointsView from './components/EndpointsView';
import IngestModal from './components/IngestModal';
import TestRunsView from './components/TestRunsView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [navigationState, setNavigationState] = useState<any>(null);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
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
        />;
      case 'runs':
        return <TestRunsView
          refreshKey={refreshKey}
          initialProject={navigationState?.project}
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
        onNewRun={() => setIsIngestModalOpen(true)}
      >
        {renderContent()}
      </Layout>

      {isIngestModalOpen && (
        <IngestModal
          onClose={() => setIsIngestModalOpen(false)}
          onSuccess={() => {
            setIsIngestModalOpen(false);
            setRefreshKey(prev => prev + 1); // Dispara la actualización global
            setActiveTab('runs');
          }}
        />
      )}
    </>
  );
};

export default App;
