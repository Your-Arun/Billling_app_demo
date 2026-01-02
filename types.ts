
export enum WorkflowStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  APPROVED = 'Approved',
  LOCKED = 'Locked',
  FINALIZED = 'Finalized'
}

export enum UserRole {
  READING_TAKER = 'Reading Taker',
  ADMIN = 'Admin'
}

export interface Reading {
  tenantId: string;
  meterId: string;
  opening: number;
  closing: number;
  units: number; 
  meterCT: number; 
  rate: number;
  sanctionedLoad: string;
  fixedCharge: number;
  transformerLossPercentage: number;
  hasDGCharge: boolean;
  isCaptured?: boolean;
  flag?: 'Spike' | 'Zero' | 'Normal';
  remarks?: string;
  photo?: string;
}

export interface DGSetData {
  id: string;
  units: number;
  fuelCost: number;
  costPerUnit: number;
  mappedTenants: string[]; 
}

export interface SolarData {
  unitsGenerated: number;
  allocationMethod: 'CommonFirst' | 'ProRata' | 'Custom';
  evidence?: string;
}

export interface AVVNLBill {
  totalUnits: number;
  energyCharges: number;
  fixedCharges: number;
  taxes: number;
  uploaded: boolean;
}

export interface BillingPeriod {
  month: string;
  year: number;
  status: WorkflowStatus;
  rejectionRemarks?: string; 
  readings: Reading[];
  solar: SolarData;
  dgSets: DGSetData[];
  bill: AVVNLBill;
}
