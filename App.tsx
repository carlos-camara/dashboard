
import React, { useState } from 'react';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import EndpointsView from './components/EndpointsView';
import IngestModal from './components/IngestModal';
import TestRunsView from './components/TestRunsView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView refreshKey={refreshKey} onNavigate={setActiveTab} />;
      case 'endpoints':
        return <EndpointsView refreshKey={refreshKey} />;
      case 'runs':
        return <TestRunsView refreshKey={refreshKey} />;
      default:
        return <DashboardView refreshKey={refreshKey} onNavigate={setActiveTab} />;
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
