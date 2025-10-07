import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CollaboratorList from './components/CollaboratorList';
import RecordList from './components/RecordList';
import AIAssistant from './components/AIAssistant';
import Header from './components/Header';
import { View, Collaborator, HRRecord, RecordType, CollaboratorStatus } from './types';
import { COLLABORATORS_DATA, RECORDS_DATA } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  const [collaborators, setCollaborators] = useState<Collaborator[]>(() => {
    try {
      const savedCollaborators = localStorage.getItem('collaborators');
      return savedCollaborators ? JSON.parse(savedCollaborators) : COLLABORATORS_DATA;
    } catch (error) {
      console.error("Error parsing collaborators from localStorage", error);
      return COLLABORATORS_DATA;
    }
  });

  const [records, setRecords] = useState<HRRecord[]>(() => {
    try {
      const savedRecords = localStorage.getItem('records');
      return savedRecords ? JSON.parse(savedRecords) : RECORDS_DATA;
    } catch (error) {
      console.error("Error parsing records from localStorage", error);
      return RECORDS_DATA;
    }
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('collaborators', JSON.stringify(collaborators));
    } catch (error) {
      console.error("Error saving collaborators to localStorage", error);
    }
  }, [collaborators]);

  useEffect(() => {
    try {
      localStorage.setItem('records', JSON.stringify(records));
    } catch (error) {
      console.error("Error saving records to localStorage", error);
    }
  }, [records]);


  const handleAddCollaborator = (newCollaboratorData: Omit<Collaborator, 'id' | 'status'>, hireRecordData: Omit<HRRecord, 'id' | 'collaboratorId' | 'ug' | 'position' | 'type'>) => {
    const newId = `c${collaborators.length + 1 + Math.random()}`; // Add random to avoid key collision on deletes
    const newCollaborator: Collaborator = {
      ...newCollaboratorData,
      id: newId,
      status: CollaboratorStatus.ACTIVO,
    };

    const newHireRecord: HRRecord = {
      ...hireRecordData,
      id: `r${records.length + 1 + Math.random()}`,
      collaboratorId: newId,
      ug: newCollaborator.ug,
      position: newCollaborator.position,
      type: RecordType.INGRESO,
    };
    
    setCollaborators(prev => [...prev, newCollaborator]);
    setRecords(prev => [...prev, newHireRecord]);
  };

  const handleEditCollaborator = (updatedCollaborator: Collaborator) => {
    setCollaborators(prev => prev.map(c => c.id === updatedCollaborator.id ? updatedCollaborator : c));
  };

  const handleDeleteCollaborator = (collaboratorId: string) => {
    setCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
    setRecords(prev => prev.filter(r => r.collaboratorId !== collaboratorId));
  };

  const handleDeleteSelectedCollaborators = (collaboratorIds: string[]) => {
    const idSet = new Set(collaboratorIds);
    setCollaborators(prev => prev.filter(c => !idSet.has(c.id)));
    setRecords(prev => prev.filter(r => !idSet.has(r.collaboratorId)));
  };
  
  const handleAddRecord = (newRecordData: Omit<HRRecord, 'id'>) => {
      const newRecord: HRRecord = {
          ...newRecordData,
          id: `r${records.length + 1 + Math.random()}`
      };
      setRecords(prev => [...prev, newRecord]);
      
      // If it's a termination, update collaborator status
      if (newRecord.type === RecordType.EGRESO) {
          setCollaborators(prev => prev.map(c => c.id === newRecord.collaboratorId ? {...c, status: CollaboratorStatus.INACTIVO} : c))
      }
  };

  const handleEditRecord = (updatedRecord: HRRecord) => {
      setRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
  };

  const handleDeleteRecord = (recordId: string) => {
      setRecords(prev => prev.filter(r => r.id !== recordId));
  };

  const handleDeleteSelectedRecords = (recordIds: string[]) => {
      const idSet = new Set(recordIds);
      setRecords(prev => prev.filter(r => !idSet.has(r.id)));
  };

  const handleImportCollaborators = (newCollaborators: Collaborator[]) => {
    setCollaborators(prev => [...prev, ...newCollaborators]);
  };
  
  const handleImportRecords = (newRecords: HRRecord[]) => {
    const terminatedCollaboratorIds = new Set(
        newRecords
            .filter(r => r.type === RecordType.EGRESO)
            .map(r => r.collaboratorId)
    );

    if (terminatedCollaboratorIds.size > 0) {
        setCollaborators(prevCollaborators => 
            prevCollaborators.map(c => 
                terminatedCollaboratorIds.has(c.id) ? { ...c, status: CollaboratorStatus.INACTIVO } : c
            )
        );
    }
    
    setRecords(prev => [...prev, ...newRecords]);
  };

  const viewTitles: { [key in View]: string } = {
    dashboard: 'Panel Principal',
    collaborators: 'Colaboradores',
    records: 'Registros',
    'ai-assistant': 'Asistente IA',
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard collaborators={collaborators} records={records} />;
      case 'collaborators':
        return <CollaboratorList collaborators={collaborators} onAddCollaborator={handleAddCollaborator} onEditCollaborator={handleEditCollaborator} onDeleteCollaborator={handleDeleteCollaborator} onImportCollaborators={handleImportCollaborators} onDeleteSelectedCollaborators={handleDeleteSelectedCollaborators} />;
      case 'records':
        return <RecordList records={records} collaborators={collaborators} onAddRecord={handleAddRecord} onEditRecord={handleEditRecord} onDeleteRecord={handleDeleteRecord} onImportRecords={handleImportRecords} onDeleteSelectedRecords={handleDeleteSelectedRecords} />;
      case 'ai-assistant':
        return <AIAssistant collaborators={collaborators} records={records} />;
      default:
        return <Dashboard collaborators={collaborators} records={records} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={(view) => {
          setCurrentView(view);
          setIsSidebarOpen(false); // Close sidebar on navigation
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={viewTitles[currentView]} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
            {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;