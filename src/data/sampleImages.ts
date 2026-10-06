export interface SampleImage {
  id: string;
  title: string;
  category: 'POTHOLE' | 'CRACK' | 'SPALLING' | 'REBAR' | 'JOINT';
  imageUrl: string;
  associatedAssetId: string;
  description: string;
  suggestedGps: { lat: number; lng: number };
}

export const SAMPLE_INFRASTRUCTURE_IMAGES: SampleImage[] = [
  {
    id: 'sample-pothole',
    title: 'Severe Asphalt Pothole with Fatigue Cracking',
    category: 'POTHOLE',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    associatedAssetId: 'inf-002',
    description: 'Deep pavement pothole along inner wheel track with surrounding alligator fatigue distress on I-880.',
    suggestedGps: { lat: 37.7981, lng: -122.2745 },
  },
  {
    id: 'sample-spalling',
    title: 'Bridge Substructure Concrete Spalling & Rebar Exposure',
    category: 'SPALLING',
    imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80',
    associatedAssetId: 'inf-005',
    description: 'Chloride-induced concrete cover delamination with oxidised reinforcing steel bars on San Mateo Bridge pier.',
    suggestedGps: { lat: 37.6045, lng: -122.2472 },
  },
  {
    id: 'sample-cracks',
    title: 'Highway Pavement Longitudinal & Alligator Cracking',
    category: 'CRACK',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
    associatedAssetId: 'inf-003',
    description: 'High tensile stress longitudinal crack propagating along MacArthur Maze interchange deck connector.',
    suggestedGps: { lat: 37.8285, lng: -122.2965 },
  },
  {
    id: 'sample-retaining',
    title: 'Reinforced Earth Retaining Wall Joint Displacement',
    category: 'JOINT',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    associatedAssetId: 'inf-007',
    description: 'Lateral soil surcharge causing precast panel joint misalignment and water seepage along Skyline Ridge.',
    suggestedGps: { lat: 37.3822, lng: -122.1895 },
  },
  {
    id: 'sample-bridge-viaduct',
    title: 'South Approach Viaduct Expansion Joint Wear',
    category: 'JOINT',
    imageUrl: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=1200&q=80',
    associatedAssetId: 'inf-001',
    description: 'Elastomeric joint header seal degradation and hairline thermal shrinkage cracking at Span 6.',
    suggestedGps: { lat: 37.8199, lng: -122.4783 },
  },
];
