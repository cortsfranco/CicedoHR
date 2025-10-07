import React, { useState, useCallback, useEffect } from 'react';
import { HRRecord, RecordType, TerminationReason, SanctionType, AbsenceReason, EgresoDetails, SancionDetails, IngresoDetails, AusenciaDetails, Collaborator } from '../types';

interface RecordEditModalProps {
  onClose: () => void;
  onEditRecord: (record: HRRecord) => void;
  collaborators: Collaborator[];
  record: HRRecord;
}

const RecordEditModal: React.FC<RecordEditModalProps> = ({ onClose, onEditRecord, collaborators, record }) => {
    const [formData, setFormData] = useState<HRRecord>({...record});

    useEffect(() => {
        setFormData({...record});
    }, [record]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const parsedValue = e.target.type === 'number' ? Number(value) : value;
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const parsedValue = e.target.type === 'number' ? Number(value) : value;
        setFormData(prev => ({
            ...prev,
            // FIX: Cast `prev.details` to `any` to work around TypeScript's difficulty with updating dynamic properties on union types.
            details: { ...(prev.details as any), [name]: parsedValue }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onEditRecord(formData);
        onClose();
    };
    
    const renderDetailsForm = useCallback(() => {
        switch (formData.type) {
            case RecordType.INGRESO:
                return (
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Salario de Ingreso</label>
                        <input type="number" name="salary" value={(formData.details as IngresoDetails).salary} onChange={handleDetailsChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" />
                    </div>
                );
            case RecordType.EGRESO:
                return (
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Motivo de Egreso</label>
                        <select name="reason" value={(formData.details as EgresoDetails).reason} onChange={handleDetailsChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm">
                            {Object.values(TerminationReason).map(reason => <option key={reason} value={reason}>{reason}</option>)}
                        </select>
                    </div>
                );
            case RecordType.SANCION:
                const sancionDetails = formData.details as SancionDetails;
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tipo de Sanción</label>
                            <select name="type" value={sancionDetails.type} onChange={handleDetailsChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm">
                                {Object.values(SanctionType).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Motivo de la Sanción</label>
                            <input type="text" name="reason" value={sancionDetails.reason} onChange={handleDetailsChange} placeholder="Ej: Falta injustificada" className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" required />
                        </div>
                    </>
                );
            case RecordType.AUSENCIA:
                const ausenciaDetails = formData.details as AusenciaDetails;
                return (
                     <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Motivo de Ausencia</label>
                            <select name="reason" value={ausenciaDetails.reason} onChange={handleDetailsChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm">
                                {Object.values(AbsenceReason).map(reason => <option key={reason} value={reason}>{reason}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Días de Ausencia</label>
                            <input type="number" min="1" name="days" value={ausenciaDetails.days} onChange={handleDetailsChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" required />
                        </div>
                    </>
                );
            default:
                return null;
        }
    }, [formData]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Editar Registro</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Tipo de Registro</label>
                        <p className="mt-1 block w-full p-2 bg-slate-100 rounded-md">{(formData.type)}</p>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Fecha</label>
                        <input type="date" name="date" value={new Date(formData.date).toISOString().split('T')[0]} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Colaborador</label>
                         <p className="mt-1 block w-full p-2 bg-slate-100 rounded-md">{collaborators.find(c => c.id === formData.collaboratorId)?.name}</p>
                    </div>

                     <div>
                        <label className="block text-sm font-medium text-slate-700">Costo</label>
                        <input type="number" name="cost" value={formData.cost} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" />
                    </div>

                     <div>
                        <label className="block text-sm font-medium text-slate-700">Observaciones (Opcional)</label>
                        <textarea name="observations" value={formData.observations} onChange={handleChange} rows={2} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" />
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t">{renderDetailsForm()}</div>

                    <div className="flex justify-end gap-4 pt-6">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors">Cancelar</button>
                        <button type="submit" className="py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecordEditModal;
