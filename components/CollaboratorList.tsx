import React, { useState, useMemo, useRef } from 'react';
import { Collaborator, CollaboratorStatus, HRRecord, ContractType } from '../types';
import CollaboratorFormModal from './CollaboratorFormModal';
import ConfirmationModal from './ConfirmationModal';
import { EditIcon, DeleteIcon, ImportIcon, ExportIcon } from './Icons';

interface CollaboratorListProps {
  collaborators: Collaborator[];
  onAddCollaborator: (collaborator: Omit<Collaborator, 'id' | 'status'>, hireRecordData: Omit<HRRecord, 'id' | 'collaboratorId' | 'ug' | 'position' | 'type'>) => void;
  onEditCollaborator: (collaborator: Collaborator) => void;
  onDeleteCollaborator: (collaboratorId: string) => void;
  onImportCollaborators: (collaborators: Collaborator[]) => void;
  onDeleteSelectedCollaborators: (collaboratorIds: string[]) => void;
}

const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const header = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1);

    return rows.map(rowStr => {
        const values = rowStr.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];

        return header.reduce((obj, nextKey, index) => {
            let value = (values[index] || '').trim();
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1).replace(/""/g, '"');
            }
            obj[nextKey] = value;
            return obj;
        }, {} as Record<string, string>);
    });
};


const CollaboratorList: React.FC<CollaboratorListProps> = ({ collaborators, onAddCollaborator, onEditCollaborator, onDeleteCollaborator, onImportCollaborators, onDeleteSelectedCollaborators }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleteSelectedModalOpen, setIsDeleteSelectedModalOpen] = useState(false);
    const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
    const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<CollaboratorStatus | 'all'>('all');
    const importFileRef = useRef<HTMLInputElement>(null);

    const filteredCollaborators = useMemo(() => {
        return collaborators.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                c.dni.includes(searchTerm) ||
                                c.legajo.includes(searchTerm) ||
                                c.position.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [collaborators, searchTerm, statusFilter]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredCollaborators.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleExport = () => {
        const collaboratorsToExport = selectedIds.length > 0 ? collaborators.filter(c => selectedIds.includes(c.id)) : filteredCollaborators;

        if (collaboratorsToExport.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }
        
        const headers = ['id', 'name', 'dni', 'legajo', 'cuil', 'position', 'ug', 'status', 'hireDate', 'contractType', 'category', 'cct', 'service', 'turn', 'observations'];
        const csvContent = [
            headers.join(','),
            ...collaboratorsToExport.map(c => [
                c.id,
                `"${c.name.replace(/"/g, '""')}"`,
                c.dni,
                c.legajo,
                c.cuil,
                `"${c.position.replace(/"/g, '""')}"`,
                `"${c.ug.replace(/"/g, '""')}"`,
                c.status,
                c.hireDate,
                c.contractType,
                `"${c.category.replace(/"/g, '""')}"`,
                `"${c.cct.replace(/"/g, '""')}"`,
                `"${c.service.replace(/"/g, '""')}"`,
                `"${c.turn.replace(/"/g, '""')}"`,
                `"${(c.observations || '').replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', 'colaboradores.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportClick = () => {
        importFileRef.current?.click();
    };

    const validateCollaborators = (data: Record<string, string>[]) => {
        const errors: string[] = [];
        const newCollaborators: Collaborator[] = [];
        const existingDnis = new Set(collaborators.map(c => c.dni));
        const existingLegajos = new Set(collaborators.map(c => c.legajo));
        const newDnisInFile = new Set<string>();
        const newLegajosInFile = new Set<string>();

        data.forEach((row, index) => {
            const rowIndex = index + 2;
            const { name, dni, legajo, cuil, position, ug, hireDate, contractType, status } = row;
            
            if (!name || !dni || !legajo || !cuil || !position || !ug || !hireDate || !contractType || !status) {
                errors.push(`Fila ${rowIndex}: Faltan campos requeridos.`);
                return;
            }

            if (existingDnis.has(dni) || newDnisInFile.has(dni)) {
                errors.push(`Fila ${rowIndex}: El DNI '${dni}' ya existe o está duplicado en el archivo.`);
                return;
            }
            if (existingLegajos.has(legajo) || newLegajosInFile.has(legajo)) {
                errors.push(`Fila ${rowIndex}: El Legajo '${legajo}' ya existe o está duplicado en el archivo.`);
                return;
            }

            if (!Object.values(CollaboratorStatus).includes(status as CollaboratorStatus)) {
                errors.push(`Fila ${rowIndex}: Estado '${status}' no es válido.`);
                return;
            }
             if (!Object.values(ContractType).includes(contractType as ContractType)) {
                errors.push(`Fila ${rowIndex}: Tipo de contrato '${contractType}' no es válido.`);
                return;
            }

            newDnisInFile.add(dni);
            newLegajosInFile.add(legajo);
            
            newCollaborators.push({
                ...row,
                id: `c${collaborators.length + newCollaborators.length + 1 + Math.random()}`,
                status: status as CollaboratorStatus,
                contractType: contractType as ContractType,
                observations: row.observations || ''
            } as Collaborator);
        });

        return { newCollaborators, errors };
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            try {
                const parsedData = parseCSV(text);
                const { newCollaborators, errors } = validateCollaborators(parsedData);

                if (errors.length > 0) {
                    console.error("Errores de validación de CSV:", errors);
                    alert(`Importación fallida. Se encontraron ${errors.length} errores. Revise la consola para más detalles.`);
                }
                
                if (newCollaborators.length > 0) {
                    onImportCollaborators(newCollaborators);
                    alert(`${newCollaborators.length} colaborador(es) importado(s) exitosamente.`);
                } else if (errors.length === 0) {
                    alert("No se encontraron nuevos colaboradores para importar o todos los registros ya existen.");
                }

            } catch (error) {
                console.error("Error al procesar el archivo CSV:", error);
                alert("Ocurrió un error al procesar el archivo. Asegúrese de que el formato sea correcto.");
            }
        };
        reader.readAsText(file, 'UTF-8');

        if(event.target) {
            event.target.value = '';
        }
    };

    const handleEditClick = (collaborator: Collaborator) => {
        setEditingCollaborator(collaborator);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (collaborator: Collaborator) => {
        setSelectedCollaborator(collaborator);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (selectedCollaborator) {
            onDeleteCollaborator(selectedCollaborator.id);
            setIsDeleteModalOpen(false);
            setSelectedCollaborator(null);
        }
    };
    
    const confirmDeleteSelected = () => {
        onDeleteSelectedCollaborators(selectedIds);
        setSelectedIds([]);
        setIsDeleteSelectedModalOpen(false);
    };

    const handleAddClick = () => {
        setEditingCollaborator(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCollaborator(null);
    };

    const statusBadge = (status: CollaboratorStatus) => {
        const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
        switch(status) {
            case CollaboratorStatus.ACTIVO:
                return `${baseClasses} bg-green-100 text-green-800`;
            case CollaboratorStatus.INACTIVO:
                return `${baseClasses} bg-red-100 text-red-800`;
            default:
                return `${baseClasses} bg-slate-100 text-slate-800`;
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                {selectedIds.length > 0 ? (
                    <div className="flex items-center gap-4 w-full">
                        <span className="text-sm font-semibold text-slate-700">{selectedIds.length} seleccionado(s)</span>
                        <button onClick={() => setIsDeleteSelectedModalOpen(true)} className="flex items-center py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 transition-colors">
                            <DeleteIcon className="w-5 h-5 mr-2" />
                            Eliminar Seleccionados
                        </button>
                    </div>
                ) : (
                    <>
                    <div className="flex flex-col md:flex-row w-full md:w-auto gap-4">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, DNI, etc."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full md:w-72 p-2 bg-white text-slate-900 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                        />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as any)}
                            className="w-full md:w-48 p-2 bg-white text-slate-900 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">Todos los Estados</option>
                            <option value={CollaboratorStatus.ACTIVO}>Activo</option>
                            <option value={CollaboratorStatus.INACTIVO}>Inactivo</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-start md:justify-end">
                        <input type="file" ref={importFileRef} onChange={handleFileImport} className="hidden" accept=".csv" />
                        <button onClick={handleImportClick} className="flex items-center py-2 px-4 bg-white text-slate-700 border border-slate-300 font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors whitespace-nowrap">
                            <ImportIcon className="w-5 h-5 mr-2" />
                            Importar
                        </button>
                        <button onClick={handleExport} className="flex items-center py-2 px-4 bg-white text-slate-700 border border-slate-300 font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors whitespace-nowrap">
                            <ExportIcon className="w-5 h-5 mr-2" />
                            Exportar
                        </button>
                        <button onClick={handleAddClick} className="py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors whitespace-nowrap">
                            Añadir Colaborador
                        </button>
                    </div>
                    </>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="p-4">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        onChange={handleSelectAll}
                                        checked={filteredCollaborators.length > 0 && selectedIds.length === filteredCollaborators.length}
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3">Nombre</th>
                                <th scope="col" className="px-6 py-3">DNI / Legajo</th>
                                <th scope="col" className="px-6 py-3">Puesto</th>
                                <th scope="col" className="px-6 py-3">Estado</th>
                                <th scope="col" className="px-6 py-3">Fecha Ingreso</th>
                                <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCollaborators.map(c => (
                                <tr key={c.id} className={`bg-white border-b ${selectedIds.includes(c.id) ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            checked={selectedIds.includes(c.id)}
                                            onChange={() => handleSelectOne(c.id)}
                                        />
                                    </td>
                                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{c.name}</th>
                                    <td className="px-6 py-4">{c.dni}<br/><span className="text-xs text-slate-400">Legajo: {c.legajo}</span></td>
                                    <td className="px-6 py-4">{c.position}</td>
                                    <td className="px-6 py-4"><span className={statusBadge(c.status)}>{c.status}</span></td>
                                    <td className="px-6 py-4">{new Date(c.hireDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center gap-4">
                                            <button onClick={() => handleEditClick(c)} className="text-indigo-600 hover:text-indigo-900">
                                                <EditIcon />
                                            </button>
                                            <button onClick={() => handleDeleteClick(c)} className="text-red-600 hover:text-red-900">
                                                <DeleteIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <CollaboratorFormModal
                    onClose={handleCloseModal}
                    onAddCollaborator={onAddCollaborator}
                    onEditCollaborator={onEditCollaborator}
                    collaborator={editingCollaborator}
                />
            )}
            {isDeleteModalOpen && selectedCollaborator && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {setIsDeleteModalOpen(false); setSelectedCollaborator(null);}}
                    onConfirm={confirmDelete}
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que deseas eliminar a ${selectedCollaborator.name}? Esta acción eliminará también todos sus registros asociados y no se puede deshacer.`}
                />
            )}
             {isDeleteSelectedModalOpen && (
                <ConfirmationModal
                    isOpen={isDeleteSelectedModalOpen}
                    onClose={() => setIsDeleteSelectedModalOpen(false)}
                    onConfirm={confirmDeleteSelected}
                    title="Confirmar Eliminación Múltiple"
                    message={`¿Estás seguro de que deseas eliminar los ${selectedIds.length} colaboradores seleccionados? Esta acción eliminará también todos sus registros asociados y no se puede deshacer.`}
                />
            )}
        </div>
    );
};

export default CollaboratorList;