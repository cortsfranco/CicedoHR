import React, { useState, useCallback, useMemo } from 'react';
import { RecordType, TerminationReason, SanctionType, AbsenceReason, EgresoDetails, SancionDetails, AusenciaDetails, Collaborator, CollaboratorStatus, HRRecord } from '../types';

interface RecordFormModalProps {
  onClose: () => void;
  onAddRecord: (record: Omit<HRRecord, 'id'>) => void;
  collaborators: Collaborator[];
}

const RecordFormModal: React.FC<RecordFormModalProps> = ({ onClose, onAddRecord, collaborators }) => {
    const activeCollaborators = useMemo(() => 
        collaborators.filter(c => c.status === CollaboratorStatus.ACTIVO), 
        [collaborators]
    );

    const [recordType, setRecordType] = useState<RecordType.EGRESO | RecordType.SANCION | RecordType.AUSENCIA>(RecordType.EGRESO);
    const [collaboratorId, setCollaboratorId] = useState<string>(activeCollaborators[0]?.id || '');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [cost, setCost] = useState(0);
    const [observations, setObservations] = useState('');

    // Details state
    const [terminationReason, setTerminationReason] = useState<TerminationReason>(TerminationReason.RENUNCIA);
    const [sanctionType, setSanctionType] = useState<SanctionType>(SanctionType.APERCIBIMIENTO_VERBAL);
    const [sanctionReasonText, setSanctionReasonText] = useState('');
    const [absenceReason, setAbsenceReason] = useState<AbsenceReason>(AbsenceReason.FALTA_INJUSTIFICADA);
    const [absenceDays, setAbsenceDays] = useState(1);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const selectedCollaborator = collaborators.find(c => c.id === collaboratorId);
        if (!selectedCollaborator) {
            alert("Por favor, seleccione un colaborador válido.");
            return;
        }
        
        let details: EgresoDetails | SancionDetails | AusenciaDetails;
        switch (recordType) {
            case RecordType.EGRESO:
                details = { reason: terminationReason };
                break;
            case RecordType.SANCION:
                details = { type: sanctionType, reason: sanctionReasonText };
                break;
            case RecordType.AUSENCIA:
                details = { reason: absenceReason, days: absenceDays };
                break;
        }

        const newRecord: Omit<HRRecord, 'id'> = {
            date,
            collaboratorId,
            ug: selectedCollaborator.ug,
            position: selectedCollaborator.position,
            type: recordType,
            details,
            cost,
            observations
        };
        onAddRecord(newRecord);
        onClose();
    };
    
    const renderDetailsForm = useCallback(() => {
        switch (recordType) {
            case RecordType.EGRESO:
                return (
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Motivo de Egreso</label>
                        <select value={terminationReason} onChange={(e) => setTerminationReason(e.target.value as TerminationReason)} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                            {Object.values(TerminationReason).map(reason => <option key={reason} value={reason}>{reason}</option>)}
                        </select>
                    </div>
                );
            case RecordType.SANCION:
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tipo de Sanción</label>
                            <select value={sanctionType} onChange={(e) => setSanctionType(e.target.value as SanctionType)} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm">
                                {Object.values(SanctionType).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Motivo de la Sanción</label>
                            <input type="text" value={sanctionReasonText} onChange={(e) => setSanctionReasonText(e.target.value)} placeholder="Ej: Falta injustificada" className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" required />
                        </div>
                    </>
                );
            case RecordType.AUSENCIA:
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Motivo de Ausencia</label>
                            <select value={absenceReason} onChange={(e) => setAbsenceReason(e.target.value as AbsenceReason)} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm">
                                {Object.values(AbsenceReason).map(reason => <option key={reason} value={reason}>{reason}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Días de Ausencia</label>
                            <input type="number" min="1" value={absenceDays} onChange={(e) => setAbsenceDays(Number(e.target.value))} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" required />
                        </div>
                    </>
                );
            default:
                return null;
        }
    }, [recordType, terminationReason, sanctionType, sanctionReasonText, absenceReason, absenceDays]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Añadir Registro</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tipo de Registro</label>
                            <select value={recordType} onChange={(e) => setRecordType(e.target.value as any)} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm">
                                <option value={RecordType.EGRESO}>EGRESO</option>
                                <option value={RecordType.SANCION}>SANCION</option>
                                <option value={RecordType.AUSENCIA}>AUSENCIA</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Fecha</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Seleccionar Colaborador</label>
                        <select value={collaboratorId} onChange={(e) => setCollaboratorId(e.target.value)} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" required>
                            <option value="" disabled>Seleccione un colaborador...</option>
                            {activeCollaborators.map(c => <option key={c.id} value={c.id}>{c.name} - {c.dni}</option>)}
                        </select>
                    </div>

                     <div>
                        <label className="block text-sm font-medium text-slate-700">Costo Asociado</label>
                        <input type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" />
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t">{renderDetailsForm()}</div>
                    
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Observaciones (Opcional)</label>
                        <textarea value={observations} onChange={(e) => setObservations(e.target.value)} rows={2} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" />
                    </div>

                    <div className="flex justify-end gap-4 pt-6">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors">Cancelar</button>
                        <button type="submit" className="py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">Añadir Registro</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecordFormModal;