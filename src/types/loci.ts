export type SettlementStyle = 'city' | 'village' | 'park';

export type EnvironmentId =
  | 'meadow'
  | 'orchard'
  | 'harbor'
  | 'alpine'
  | 'lantern'
  | 'observatory';

export type TimerMode = 'free' | '25m' | '50m';

export type ColorMode = 'light' | 'dark';

export interface SubjectCity {
  id: string;
  name: string;
  style: SettlementStyle;
  totalSeconds: number;
  createdAt: string;
  lastStudiedAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  durationSeconds: number;
  startedAt: string;
  endedAt: string;
}

export interface UserAccount {
  id: string;
  username: string;
  pinHash: string | null;
  activeSubjectId: string;
  selectedEnvironmentId: EnvironmentId;
  soundEnabled: boolean;
  colorMode?: ColorMode;
  subjects: SubjectCity[];
  sessions: StudySession[];
  createdAt: string;
}

export interface EnvironmentTheme {
  id: EnvironmentId;
  level: number;
  name: string;
  subtitle: string;
  unlockSeconds: number;
  isNight: boolean;
  skyTop: string;
  skyBottom: string;
  sunOrMoonColor: string;
  islandTop: string;
  islandTopAlt: string;
  islandLeft: string;
  islandRight: string;
  waterColor: string;
  pathColor: string;
  foliagePrimary: string;
  foliageSecondary: string;
  wallLight: string;
  wallDark: string;
  roofPrimary: string;
  roofSecondary: string;
  windowColor: string;
  accentColor: string;
}

export type StructureKind =
  | 'plaza_fountain'
  | 'bookshop'
  | 'cafe'
  | 'townhouse'
  | 'library'
  | 'clocktower'
  | 'tram_station'
  | 'museum'
  | 'apartments'
  | 'greenhouse'
  | 'bridge_arch'
  | 'observatory_dome'
  | 'cottage'
  | 'bakery'
  | 'windmill'
  | 'market_stall'
  | 'chapel'
  | 'barn'
  | 'well'
  | 'inn'
  | 'tree_grove'
  | 'koi_pond'
  | 'gazebo'
  | 'conservatory'
  | 'flower_bed'
  | 'amphitheater'
  | 'footbridge'
  | 'lantern_pavilion';

export interface StructureBlueprint {
  id: string;
  index: number;
  unlockSeconds: number;
  col: number;
  row: number;
  name: string;
  category: string;
  description: string;
  kind: StructureKind;
}
