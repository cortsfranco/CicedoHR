import React from 'react';
import { View } from '../types';
import { DashboardIcon, RecordsIcon, AIIcon, CollaboratorsIcon, CloseIcon, ImpactIcon, DocumentationIcon } from './Icons';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
}

const NavItem: React.FC<{
  viewName: View;
  label: string;
  currentView: View;
  setCurrentView: (view: View) => void;
  children: React.ReactNode;
}> = ({ viewName, label, currentView, setCurrentView, children }) => {
  const isActive = currentView === viewName;
  return (
    <li>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setCurrentView(viewName);
        }}
        className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-indigo-600 text-white shadow-lg'
            : 'text-slate-200 hover:bg-slate-700 hover:text-white'
        }`}
      >
        {children}
        <span className="ml-3 font-semibold">{label}</span>
      </a>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, onClose }) => {
  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      <div className={`fixed inset-y-0 left-0 w-64 bg-slate-800 text-white flex flex-col p-4 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-10">
            <div className="text-2xl font-bold tracking-wider">
                Caicedo<span className="font-light text-indigo-400">HR</span>
            </div>
            <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
                <CloseIcon />
            </button>
        </div>
        <nav>
          <ul className="space-y-3">
            <NavItem viewName="dashboard" label="Panel Principal" currentView={currentView} setCurrentView={setCurrentView}>
              <DashboardIcon />
            </NavItem>
             <NavItem viewName="impact-analysis" label="Análisis de Impacto" currentView={currentView} setCurrentView={setCurrentView}>
              <ImpactIcon />
            </NavItem>
            <NavItem viewName="collaborators" label="Colaboradores" currentView={currentView} setCurrentView={setCurrentView}>
              <CollaboratorsIcon />
            </NavItem>
            <NavItem viewName="records" label="Registros" currentView={currentView} setCurrentView={setCurrentView}>
              <RecordsIcon />
            </NavItem>
             <NavItem viewName="documentation" label="Documentación" currentView={currentView} setCurrentView={setCurrentView}>
              <DocumentationIcon />
            </NavItem>
            <NavItem viewName="ai-assistant" label="Asistente IA" currentView={currentView} setCurrentView={setCurrentView}>
              <AIIcon />
            </NavItem>
          </ul>
        </nav>
        <div className="mt-auto text-center text-xs text-slate-500">
          <p>&copy; 2024 Panel IA de RRHH</p>
          <p>Para Antonella Caicedo</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;