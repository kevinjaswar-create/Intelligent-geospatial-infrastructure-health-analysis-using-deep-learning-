export type Role = 'ADMIN' | 'ENGINEER' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  organization: string;
  department?: string;
  avatarUrl?: string;
}

export type InfrastructureType = 
  | 'BRIDGE' 
  | 'HIGHWAY' 
  | 'OVERPASS' 
  | 'TUNNEL' 
  | 'PAVEMENT' 
  | 'RETAINING_WALL';

export type HealthStatus = 'HEALTHY' | 'GOOD' | 'MODERATE' | 'POOR' | 'CRITICAL';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
}

export interface InfrastructureAsset {
  id: string;
  code: string;
  name: string;
  type: InfrastructureType;
  location: GeoLocation;
  constructedYear: number;
  lastInspectedDate: string;
  healthScore: number; // 0 - 100
  healthStatus: HealthStatus;
  priority: PriorityLevel;
  inspectionCount: number;
  defectCount: number;
  thumbnailUrl: string;
  roadLengthKm?: number;
  lanes?: number;
  trafficVolume?: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  material?: string;
}

export type DefectType = 
  | 'pothole' 
  | 'longitudinal_crack' 
  | 'alligator_crack' 
  | 'transverse_crack' 
  | 'spalling' 
  | 'rebar_exposure' 
  | 'surface_delamination' 
  | 'water_damage';

export type DefectSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface BoundingBox {
  x: number;      // 0 - 100 percentage from left
  y: number;      // 0 - 100 percentage from top
  width: number;  // 0 - 100 percentage width
  height: number; // 0 - 100 percentage height
}

export interface Defect {
  id: string;
  type: DefectType;
  confidence: number; // 0.00 to 1.00
  boundingBox: BoundingBox;
  severity: DefectSeverity;
  estimatedDimensions: string;
  depthEstimateMm?: number;
  recommendedAction: string;
}

export interface AIAnalysisResult {
  id: string;
  imageUrl: string;
  infrastructureId: string;
  infrastructureName: string;
  timestamp: string;
  inspectorName: string;
  defects: Defect[];
  defectSummary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  healthScore: number;
  healthStatus: HealthStatus;
  engineUsed: 'gemini_flash_vision' | 'benchmark_yolo_v11_sim';
  isMock: boolean;
  processingTimeMs: number;
  notes?: string;
  gpsLocation?: { lat: number; lng: number };
}

export type WorkOrderStatus = 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';

export interface WorkOrder {
  id: string;
  infrastructureId: string;
  infrastructureName: string;
  title: string;
  priority: PriorityLevel;
  status: WorkOrderStatus;
  defectCount: number;
  estimatedCostUsd: number;
  assignedCrew: string;
  dueDate: string;
  createdAt: string;
  description: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: Role;
  action: string;
  details: string;
}

export interface HealthScoreConfig {
  baseScore: number;
  criticalPenalty: number;
  highPenalty: number;
  mediumPenalty: number;
  lowPenalty: number;
  ageDegradationFactor: number;
  confidenceWeighting: boolean;
}

export interface DashboardStatistics {
  totalAssets: number;
  healthyCount: number;
  goodCount: number;
  moderateCount: number;
  poorCount: number;
  criticalCount: number;
  averageHealthScore: number;
  totalInspections: number;
  totalDefectsDetected: number;
  pendingWorkOrders: number;
  defectDistribution: {
    potholes: number;
    cracks: number;
    spalling: number;
    delamination: number;
    rebar: number;
    water: number;
  };
}
