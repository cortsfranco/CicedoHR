import React, { useState, useMemo, useRef } from 'react';
import { HRRecord, RecordType, Collaborator, EgresoDetails, SancionDetails, AusenciaDetails, IngresoDetails, TerminationReason, SanctionType, AbsenceReason } from '../types';
import RecordFormModal from './RecordFormModal';
import RecordEditModal from './RecordEditModal';
import ConfirmationModal from './ConfirmationModal';
import { EditIcon, DeleteIcon, ImportIcon, ExportIcon } from './Icons';
import MultiSelectDropdown from './MultiSelectDropdown';

interface RecordListProps {
  records: HRRecord[];
  collaborators: Collaborator[];
  onAddRecord: (record: Omit<HRRecord, 'id'>) => void;
  onEditRecord: (record: HRRecord) => void;
  onDeleteRecord: (recordId: string) => void;
  onImportRecords: (records: HRRecord[]) => void;
  onDeleteSelectedRecords: (recordIds: string[]) => void;
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


const RecordList: React.FC<RecordListProps> = ({ records, collaborators, onAddRecord, onEditRecord, onDeleteRecord, onImportRecords, onDeleteSelectedRecords }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteSelectedModalOpen, setIsDeleteSelectedModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HRRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Filters
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [collaboratorFilters, setCollaboratorFilters] = useState<string[]>([]);
  
  const recordTypeOptions = Object.values(RecordType).map(rt => ({ value: rt, label: rt }));
  const collaboratorOptions = collaborators.map(c => ({ value: c.id, label: c.name }));

  const getCollaboratorName = (id: string) => collaborators.find(c => c.id === id)?.name || 'N/A';

  const filteredRecords = useMemo(() => {
    return records
      .filter(r => typeFilters.length === 0 || typeFilters.includes(r.type))
      .filter(r => collaboratorFilters.length === 0 || collaboratorFilters.includes(r.collaboratorId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, typeFilters, collaboratorFilters]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredRecords.map(r => r.id));
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
        const recordsToExport = selectedIds.length > 0 ? records.filter(r => selectedIds.includes(r.id)) : filteredRecords;
        if (recordsToExport.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }

        const headers = ['id', 'date', 'collaboratorId', 'Nombre Colaborador', 'ug', 'position', 'type', 'details', 'cost', 'observations'];
        
        const csvContent = [
            headers.join(','),
            ...recordsToExport.map(r => {
                const detailsString = JSON.stringify(r.details).replace(/"/g, '""');
                return [
                    r.id,
                    r.date,
                    r.collaboratorId,
                    `"${getCollaboratorName(r.collaboratorId).replace(/"/g, '""')}"`,
                    `"${r.ug.replace(/"/g, '""')}"`,
                    `"${r.position.replace(/"/g, '""')}"`,
                    r.type,
                    `"${detailsString}"`,
                    r.cost,
                    `"${(r.observations || '').replace(/"/g, '""')}"`
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', 'registros.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportClick = () => {
        importFileRef.current?.click();
    };

    const validateRecords = (data: Record<string, string>[]) => {
        const errors: string[] = [];
        const newRecords: HRRecord[] = [];
        const existingCollaboratorIds = new Set(collaborators.map(c => c.id));

        data.forEach((row, index) => {
            const rowIndex = index + 2;
            const { date, collaboratorId, ug, position, type, details: detailsString, cost, observations } = row;

            if (!date || !collaboratorId || !ug || !position || !type || !detailsString || cost === undefined) {
                errors.push(`Fila ${rowIndex}: Faltan campos requeridos.`);
                return;
            }
            if (!existingCollaboratorIds.has(collaboratorId)) {
                errors.push(`Fila ${rowIndex}: El collaboratorId '${collaboratorId}' no existe.`);
                return;
            }
            if (!Object.values(RecordType).includes(type as RecordType)) {
                errors.push(`Fila ${rowIndex}: Tipo de registro '${type}' no es válido.`);
                return;
            }
            if (isNaN(parseFloat(cost))) {
                errors.push(`Fila ${rowIndex}: El costo '${cost}' no es un número válido.`);
                return;
            }

            let details;
            try {
                details = JSON.parse(detailsString);
            } catch (e) {
                errors.push(`Fila ${rowIndex}: El campo 'details' no es un JSON válido.`);
                return;
            }

            let detailsError = '';
            switch(type as RecordType) {
                case RecordType.INGRESO:
                    if (typeof (details as IngresoDetails).salary !== 'number') detailsError = "Falta 'salary' (número) en details.";
                    break;
                case RecordType.EGRESO:
                    if (!Object.values(TerminationReason).includes((details as EgresoDetails).reason)) detailsError = "El 'reason' en details no es válido para EGRESO.";
                    break;
                case RecordType.SANCION:
                    if (!Object.values(SanctionType).includes((details as SancionDetails).type) || typeof (details as SancionDetails).reason !== 'string') detailsError = "Falta 'type' o 'reason' (string) válidos en details para SANCION.";
                    break;
                case RecordType.AUSENCIA:
                     if (!Object.values(AbsenceReason).includes((details as AusenciaDetails).reason) || typeof (details as AusenciaDetails).days !== 'number') detailsError = "Falta 'reason' o 'days' (número) válidos en details para AUSENCIA.";
                    break;
            }
            
            if (detailsError) {
                errors.push(`Fila ${rowIndex}: ${detailsError}`);
                return;
            }

            newRecords.push({
                id: `r${records.length + newRecords.length + 1 + Math.random()}`,
                date,
                collaboratorId,
                ug,
                position,
                type: type as RecordType,
                details,
                cost: parseFloat(cost),
                observations: observations || '',
            });
        });

        return { newRecords, errors };
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            try {
                const parsedData = parseCSV(text);
                const { newRecords, errors } = validateRecords(parsedData);

                if (errors.length > 0) {
                    console.error("Errores de validación de CSV:", errors);
                    alert(`Importación fallida. Se encontraron ${errors.length} errores. Revise la consola para más detalles.`);
                }
                
                if (newRecords.length > 0) {
                    onImportRecords(newRecords);
                    alert(`${newRecords.length} registro(s) importado(s) exitosamente.`);
                } else if (errors.length === 0) {
                    alert("No se encontraron nuevos registros para importar.");
                }

            } catch (error) {
                console.error("Error al procesar el archivo CSV:", error);
                alert("Ocurrió un error al procesar el archivo. Asegúrese de que el formato sea correcto.");
            }
        };
        reader.readAsText(file, 'UTF-8');

        if (event.target) {
            event.target.value = '';
        }
    };


  const handleEditClick = (record: HRRecord) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteClick = (record: HRRecord) => {
      setSelectedRecord(record);
      setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
      if (selectedRecord) {
          onDeleteRecord(selectedRecord.id);
          setIsDeleteModalOpen(false);
          setSelectedRecord(null);
      }
  };

   const confirmDeleteSelected = () => {
      onDeleteSelectedRecords(selectedIds);
      setSelectedIds([]);
      setIsDeleteSelectedModalOpen(false);
  };
  
  const renderRecordDetails = (record: HRRecord) => {
    switch (record.type) {
      case RecordType.INGRESO:
        return `Salario: $${(record.details as IngresoDetails).salary.toLocaleString()}`;
      case RecordType.EGRESO:
        return `Motivo: ${(record.details as EgresoDetails).reason}`;
      case RecordType.SANCION:
        const sancion = record.details as SancionDetails;
        return `Tipo: ${sancion.type} - Motivo: ${sancion.reason}`;
      case RecordType.AUSENCIA:
        const ausencia = record.details as AusenciaDetails;
        return `Motivo: ${ausencia.reason} (${ausencia.days} día/s)`;
      default:
        return '';
    }
  };

  const typeBadge = (type: RecordType) => {
    const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full inline-block';
    const typeMap: { [key in RecordType]: string } = {
      [RecordType.INGRESO]: 'bg-blue-100 text-blue-800',
      [RecordType.EGRESO]: 'bg-red-100 text-red-800',
      [RecordType.SANCION]: 'bg-yellow-100 text-yellow-800',
      [RecordType.AUSENCIA]: 'bg-purple-100 text-purple-800',
    };
    return `${baseClasses} ${typeMap[type]}`;
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
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-grow">
                    <div className="flex-1 min-w-[200px]">
                        <MultiSelectDropdown options={recordTypeOptions} selected={typeFilters} onChange={setTypeFilters} placeholder="Filtrar por Tipo" />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <MultiSelectDropdown options={collaboratorOptions} selected={collaboratorFilters} onChange={setCollaboratorFilters} placeholder="Filtrar por Colaborador" />
                    </div>
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
                    <button onClick={() => setIsAddModalOpen(true)} className="py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors whitespace-nowrap">
                        Añadir Registro
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
                        <input type="checkbox"
                         className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                         onChange={handleSelectAll}
                         checked={filteredRecords.length > 0 && selectedIds.length === filteredRecords.length}
                         />
                    </th>
                    <th scope="col" className="px-6 py-3">Fecha</th>
                    <th scope="col" className="px-6 py-3">Colaborador</th>
                    <th scope="col" className="px-6 py-3">Tipo</th>
                    <th scope="col" className="px-6 py-3">Detalles</th>
                    <th scope="col" className="px-6 py-3 text-right">Costo</th>
                    <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {filteredRecords.map(r => (
                <tr key={r.id} className={`bg-white border-b ${selectedIds.includes(r.id) ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                    <td className="p-4">
                        <input type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={selectedIds.includes(r.id)}
                          onChange={() => handleSelectOne(r.id)}
                        />
                    </td>
                    <td className="px-6 py-4">{new Date(r.date).toLocaleDateString()}</td>
                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{getCollaboratorName(r.collaboratorId)}</th>
                    <td className="px-6 py-4"><span className={typeBadge(r.type)}>{r.type}</span></td>
                    <td className="px-6 py-4">{renderRecordDetails(r)}</td>
                    <td className="px-6 py-4 text-right">${r.cost.toLocaleString()}</td>
                    <td className="px-6 py-4 flex justify-center items-center gap-4">
                        <button onClick={() => handleEditClick(r)} className="text-indigo-600 hover:text-indigo-900"><EditIcon /></button>
                        <button onClick={() => handleDeleteClick(r)} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
      {isAddModalOpen && <RecordFormModal onClose={() => setIsAddModalOpen(false)} onAddRecord={onAddRecord} collaborators={collaborators} />}
      {isEditModalOpen && selectedRecord && <RecordEditModal onClose={() => {setIsEditModalOpen(false); setSelectedRecord(null);}} onEditRecord={onEditRecord} collaborators={collaborators} record={selectedRecord} />}
      {isDeleteModalOpen && selectedRecord && (
          <ConfirmationModal 
            isOpen={isDeleteModalOpen}
            onClose={() => {setIsDeleteModalOpen(false); setSelectedRecord(null);}}
            onConfirm={confirmDelete}
            title="Confirmar Eliminación"
            message={`¿Estás seguro de que deseas eliminar el registro del ${new Date(selectedRecord.date).toLocaleDateString()} para ${getCollaboratorName(selectedRecord.collaboratorId)}? Esta acción no se puede deshacer.`}
          />
      )}
      {isDeleteSelectedModalOpen && (
          <ConfirmationModal 
            isOpen={isDeleteSelectedModalOpen}
            onClose={() => setIsDeleteSelectedModalOpen(false)}
            onConfirm={confirmDeleteSelected}
            title="Confirmar Eliminación Múltiple"
            message={`¿Estás seguro de que deseas eliminar los ${selectedIds.length} registros seleccionados? Esta acción no se puede deshacer.`}
          />
       )}
    </div>
  );
};

export default RecordList;