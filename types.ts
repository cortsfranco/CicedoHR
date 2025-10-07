export type View = 'dashboard' | 'collaborators' | 'records' | 'ai-assistant';

export enum CollaboratorStatus {
  ACTIVO = 'Activo',
  INACTIVO = 'Inactivo',
}

export enum ContractType {
    EVENTUAL = 'Eventual',
    INDETERMINADO = 'Indeterminado',
    PLAZO_FIJO = 'Plazo Fijo',
}

export interface Collaborator {
  id: string;
  name: string;
  dni: string;
  legajo: string;
  cuil: string;
  position: string;
  ug: string; // Unidad de Gestión
  status: CollaboratorStatus;
  hireDate: string; // ISO date string
  contractType: ContractType;
  category: string;
  cct: string; // Convenio Colectivo de Trabajo
  service: string;
  turn: string;
  observations?: string;
}

export enum RecordType {
  INGRESO = 'INGRESO',
  EGRESO = 'EGRESO',
  SANCION = 'SANCION',
  AUSENCIA = 'AUSENCIA',
}

export enum TerminationReason {
  RENUNCIA = 'Renuncia',
  DESPIDO_CON_CAUSA = 'Despido con justa causa',
  DESPIDO_SIN_CAUSA = 'Despido sin justa causa',
  MUTUO_ACUERDO = 'Mutuo acuerdo (241)',
  FIN_CONTRATO = 'Fin de contrato',
  JUBILACION = 'Jubilación',
}

export enum SanctionType {
  APERCIBIMIENTO_VERBAL = 'Apercibimiento verbal',
  APERCIBIMIENTO_ESCRITO = 'Apercibimiento escrito',
  SUSPENSION_LEVE = 'Suspensión Leve',
  SUSPENSION_MEDIA = 'Suspensión Media',
  SUSPENSION_GRAVE = 'Suspensión Grave',
}

export enum AbsenceReason {
    FALTA_INJUSTIFICADA = 'Falta Injustificada',
    ART = 'ART',
    MATERNIDAD_PATERNIDAD = 'Maternidad / Paternidad',
    FALTA_JUSTIFICADA = 'Falta Justificada',
    DIA_ESTUDIO = 'Día de Estudio',
    CUIDADO_FAMILIAR = 'Cuidado Familiar',
    TARDANZA = 'Tardanza',
}


export interface IngresoDetails {
  salary: number;
}

export interface EgresoDetails {
  reason: TerminationReason;
}

export interface SancionDetails {
  type: SanctionType;
  reason: string;
}

export interface AusenciaDetails {
    reason: AbsenceReason;
    days: number;
}

export type RecordDetails = IngresoDetails | EgresoDetails | SancionDetails | AusenciaDetails;

export interface HRRecord {
  id: string;
  date: string; // ISO date string
  collaboratorId: string;
  ug: string;
  position: string;
  type: RecordType;
  details: RecordDetails;
  cost: number;
  observations?: string;
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}