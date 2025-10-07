import { Collaborator, HRRecord, CollaboratorStatus, RecordType, TerminationReason, SanctionType, AbsenceReason, ContractType } from './types';

export const COLLABORATORS_DATA: Collaborator[] = [
  { id: 'c1', name: 'Ana García', legajo: '1001', dni: '12345678A', cuil: '27-12345678-5', position: 'Desarrolladora Frontend', ug: 'UG2-VISTA MENDOZA', status: CollaboratorStatus.ACTIVO, hireDate: '2022-01-15', contractType: ContractType.INDETERMINADO, category: 'Sistemas', cct: 'UOM', service: 'Desarrollo', turn: 'Mañana' },
  { id: 'c2', name: 'Luis Martínez', legajo: '1002', dni: '87654321B', cuil: '20-87654321-8', position: 'Desarrollador Backend', ug: 'UG2-VISTA MENDOZA', status: CollaboratorStatus.ACTIVO, hireDate: '2021-11-20', contractType: ContractType.INDETERMINADO, category: 'Sistemas', cct: 'UOM', service: 'Desarrollo', turn: 'Tarde' },
  { id: 'c3', name: 'Sofía Rodríguez', legajo: '1003', dni: '11223344C', cuil: '27-11223344-9', position: 'Diseñadora UX/UI', ug: 'UG3-VITSA CORDOBA', status: CollaboratorStatus.ACTIVO, hireDate: '2022-03-10', contractType: ContractType.PLAZO_FIJO, category: 'Diseño', cct: 'Comercio', service: 'Producto', turn: 'Mañana' },
  { id: 'c4', name: 'Carlos Sánchez', legajo: '1004', dni: '44556677D', cuil: '20-44556677-1', position: 'Jefe de Proyecto', ug: 'UG3-VITSA CORDOBA', status: CollaboratorStatus.INACTIVO, hireDate: '2020-05-01', contractType: ContractType.INDETERMINADO, category: 'Management', cct: 'Fuera de Convenio', service: 'Producto', turn: 'Mañana' },
  { id: 'c5', name: 'Laura Gómez', legajo: '1005', dni: '99887766E', cuil: '27-99887766-3', position: 'Analista de RRHH', ug: 'UG1-LEXXOR', status: CollaboratorStatus.ACTIVO, hireDate: '2023-02-01', contractType: ContractType.EVENTUAL, category: 'Administración', cct: 'Comercio', service: 'RRHH', turn: 'Mañana', observations: 'Ingreso por reemplazo temporal.' },
];

export const RECORDS_DATA: HRRecord[] = [
  // Ingresos
  { id: 'r1', date: '2022-01-15', collaboratorId: 'c1', ug: 'UG2-VISTA MENDOZA', position: 'Desarrolladora Frontend', type: RecordType.INGRESO, details: { salary: 45000 }, cost: 1500 },
  { id: 'r2', date: '2021-11-20', collaboratorId: 'c2', ug: 'UG2-VISTA MENDOZA', position: 'Desarrollador Backend', type: RecordType.INGRESO, details: { salary: 50000 }, cost: 1800 },
  { id: 'r3', date: '2022-03-10', collaboratorId: 'c3', ug: 'UG3-VITSA CORDOBA', position: 'Diseñadora UX/UI', type: RecordType.INGRESO, details: { salary: 42000 }, cost: 1300 },
  { id: 'r4', date: '2020-05-01', collaboratorId: 'c4', ug: 'UG3-VITSA CORDOBA', position: 'Jefe de Proyecto', type: RecordType.INGRESO, details: { salary: 65000 }, cost: 2500 },
  { id: 'r5', date: '2023-02-01', collaboratorId: 'c5', ug: 'UG1-LEXXOR', position: 'Analista de RRHH', type: RecordType.INGRESO, details: { salary: 38000 }, cost: 1200 },
  // Egreso
  { id: 'r6', date: '2023-06-30', collaboratorId: 'c4', ug: 'UG3-VITSA CORDOBA', position: 'Jefe de Proyecto', type: RecordType.EGRESO, details: { reason: TerminationReason.FIN_CONTRATO }, cost: 5000, observations: 'Finalización de proyecto X.' },
  // Sanción
  { id: 'r7', date: '2023-04-05', collaboratorId: 'c2', ug: 'UG2-VISTA MENDOZA', position: 'Desarrollador Backend', type: RecordType.SANCION, details: { type: SanctionType.APERCIBIMIENTO_ESCRITO, reason: 'Retrasos reiterados en la entrega de tareas.' }, cost: 0 },
  // Ausencia
  { id: 'r8', date: '2023-05-22', collaboratorId: 'c1', ug: 'UG2-VISTA MENDOZA', position: 'Desarrolladora Frontend', type: RecordType.AUSENCIA, details: { reason: AbsenceReason.ART, days: 3 }, cost: 0, observations: 'Revisión médica programada.' },
  { id: 'r9', date: '2023-07-01', collaboratorId: 'c3', ug: 'UG3-VITSA CORDOBA', position: 'Diseñadora UX/UI', type: RecordType.SANCION, details: { type: SanctionType.APERCIBIMIENTO_VERBAL, reason: 'Uso indebido de recursos de la empresa.' }, cost: 0 },
  { id: 'r10', date: '2023-07-10', collaboratorId: 'c5', ug: 'UG1-LEXXOR', position: 'Analista de RRHH', type: RecordType.AUSENCIA, details: { reason: AbsenceReason.FALTA_JUSTIFICADA, days: 1 }, cost: 0 },

];