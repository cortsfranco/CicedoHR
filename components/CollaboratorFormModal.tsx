import React, { useState, useEffect } from 'react';
import { Collaborator, CollaboratorStatus, ContractType, IngresoDetails, HRRecord } from '../types';

interface CollaboratorFormModalProps {
  onClose: () => void;
  onAddCollaborator: (collaborator: Omit<Collaborator, 'id' | 'status'>, hireRecordData: Omit<HRRecord, 'id' | 'collaboratorId' | 'ug' | 'position' | 'type'>) => void;
  onEditCollaborator: (collaborator: Collaborator) => void;
  collaborator: Collaborator | null;
}

const CollaboratorFormModal: React.FC<CollaboratorFormModalProps> = ({ onClose, onAddCollaborator, onEditCollaborator, collaborator }) => {
  
  const [formData, setFormData] = useState({
    name: '',
    dni: '',
    legajo: '',
    cuil: '',
    hireDate: new Date().toISOString().split('T')[0],
    position: '',
    ug: '',
    contractType: ContractType.INDETERMINADO,
    category: '',
    cct: '',
    service: '',
    turn: '',
    observations: '',
    status: CollaboratorStatus.ACTIVO,
    // Hire record specific fields
    initialSalary: 0,
    hireCost: 0,
  });

  useEffect(() => {
    if (collaborator) {
      // FIX: Explicitly set form data to match the state shape, avoiding issues with `id` and optional `observations`.
      setFormData({
        name: collaborator.name,
        dni: collaborator.dni,
        legajo: collaborator.legajo,
        cuil: collaborator.cuil,
        hireDate: collaborator.hireDate,
        position: collaborator.position,
        ug: collaborator.ug,
        contractType: collaborator.contractType,
        category: collaborator.category,
        cct: collaborator.cct,
        service: collaborator.service,
        turn: collaborator.turn,
        observations: collaborator.observations ?? '',
        status: collaborator.status,
        initialSalary: 0, // Not stored in collaborator model, reset for edit
        hireCost: 0,
      });
    }
  }, [collaborator]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const parsedValue = e.target.type === 'number' ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (collaborator) { // Editing existing collaborator
      const { initialSalary, hireCost, ...collaboratorData } = formData;
      onEditCollaborator({ ...collaboratorData, id: collaborator.id });
    } else { // Adding new collaborator
      const { initialSalary, hireCost, status, ...newCollaboratorData } = formData;
      const hireRecordData = {
          date: formData.hireDate,
          details: { salary: initialSalary } as IngresoDetails,
          cost: hireCost,
          observations: `Registro de ingreso para ${formData.name}.`
      };
      onAddCollaborator(newCollaboratorData, hireRecordData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">{collaborator ? 'Editar' : 'Añadir'} Colaborador</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Info */}
            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Legajo</label>
                    <input type="text" name="legajo" value={formData.legajo} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">DNI</label>
                    <input type="text" name="dni" value={formData.dni} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">CUIL</label>
                    <input type="text" name="cuil" value={formData.cuil} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md" required />
                </div>
            </fieldset>

            {/* Contract Info */}
            <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Puesto</label>
                    <input type="text" name="position" value={formData.position} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Unidad de Gestión</label>
                    <input type="text" name="ug" value={formData.ug} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Tipo de Contrato</label>
                     <select name="contractType" value={formData.contractType} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md">
                        {Object.values(ContractType).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Categoría</label>
                    <input type="text" name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Convenio (CCT)</label>
                    <input type="text" name="cct" value={formData.cct} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Servicio / Turno</label>
                     <div className="flex gap-2">
                        <input type="text" name="service" placeholder="Servicio" value={formData.service} onChange={handleChange} className="mt-1 block w-1/2 p-2 border border-slate-300 rounded-md" />
                        <input type="text" name="turn" placeholder="Turno" value={formData.turn} onChange={handleChange} className="mt-1 block w-1/2 p-2 border border-slate-300 rounded-md" />
                     </div>
                </div>
            </fieldset>
            
            {/* Hire Info - Only for new collaborators */}
            {!collaborator && (
                <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Fecha de Ingreso</label>
                        <input type="date" name="hireDate" value={formData.hireDate} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Salario Inicial</label>
                        <input type="number" name="initialSalary" value={formData.initialSalary} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Costo de Ingreso</label>
                        <input type="number" name="hireCost" value={formData.hireCost} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md" />
                    </div>
                </fieldset>
            )}

            {/* Status & Observations - Only for existing collaborators */}
             {collaborator && (
                <fieldset className="pt-4 border-t">
                    <label className="block text-sm font-medium text-slate-700">Estado</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md">
                        {Object.values(CollaboratorStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </fieldset>
             )}
            
             <div>
                <label className="block text-sm font-medium text-slate-700">Observaciones (Opcional)</label>
                <textarea name="observations" value={formData.observations} onChange={handleChange} rows={2} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" />
            </div>

          <div className="flex justify-end gap-4 pt-6">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">Cancelar</button>
            <button type="submit" className="py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollaboratorFormModal;
