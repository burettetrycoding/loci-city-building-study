import {
  EnvironmentId,
  EnvironmentTheme,
  SettlementStyle,
  StructureBlueprint,
  SubjectCity,
} from '../types/loci';

export const LEVEL_DURATION_SECONDS = 12 * 3600; // 12 hours per level
export const STRUCTURES_PER_LEVEL = 16;
export const MAX_LEVELS = 6;

export const ENVIRONMENT_THEMES: EnvironmentTheme[] = [
  {
    id: 'meadow',
    level: 1,
    name: 'Sunlit Meadow',
    subtitle: 'Clear morning sky, limestone paths, and fresh clover lawns.',
    unlockSeconds: 0,
    isNight: false,
    skyTop: '#DBEAFE',
    skyBottom: '#F8FAFC',
    sunOrMoonColor: '#FDE68A',
    islandTop: '#BBE1B3',
    islandTopAlt: '#AED8A6',
    islandLeft: '#8B735B',
    islandRight: '#6E5A47',
    waterColor: '#BAE6FD',
    pathColor: '#E7E5E4',
    foliagePrimary: '#3B8E5C',
    foliageSecondary: '#2B6E46',
    wallLight: '#F8FAFC',
    wallDark: '#CBD5E1',
    roofPrimary: '#C25E48',
    roofSecondary: '#9E4633',
    windowColor: '#38BDF8',
    accentColor: '#0F766E',
  },
  {
    id: 'orchard',
    level: 2,
    name: 'Autumn Orchard',
    subtitle: 'Golden maple canopies, crisp amber daylight, and cedar roofs.',
    unlockSeconds: 12 * 3600, // 12 hours
    isNight: false,
    skyTop: '#FEF3C7',
    skyBottom: '#FFFBEB',
    sunOrMoonColor: '#FBBF24',
    islandTop: '#D9C89E',
    islandTopAlt: '#CEBC90',
    islandLeft: '#7C5D46',
    islandRight: '#5E4534',
    waterColor: '#93C5FD',
    pathColor: '#E6D5B8',
    foliagePrimary: '#D97706',
    foliageSecondary: '#B45309',
    wallLight: '#FFFDF7',
    wallDark: '#E2D9C8',
    roofPrimary: '#9A3412',
    roofSecondary: '#7C2D12',
    windowColor: '#FDE047',
    accentColor: '#B45309',
  },
  {
    id: 'harbor',
    level: 3,
    name: 'Coastal Harbor',
    subtitle: 'Sea-breeze teal water, whitewashed stone, and slate rooftops.',
    unlockSeconds: 24 * 3600, // 24 hours
    isNight: false,
    skyTop: '#CFFAFE',
    skyBottom: '#F0FDFA',
    sunOrMoonColor: '#FEF08A',
    islandTop: '#CBE5D8',
    islandTopAlt: '#BEDBCC',
    islandLeft: '#64748B',
    islandRight: '#475569',
    waterColor: '#5EEAD4',
    pathColor: '#F1F5F9',
    foliagePrimary: '#0D9488',
    foliageSecondary: '#0F766E',
    wallLight: '#FFFFFF',
    wallDark: '#CBD5E1',
    roofPrimary: '#1E40AF',
    roofSecondary: '#1E3A8A',
    windowColor: '#7DD3FC',
    accentColor: '#0284C7',
  },
  {
    id: 'alpine',
    level: 4,
    name: 'Alpine Timberland',
    subtitle: 'High-altitude evergreens, granite ledges, and mountain mist.',
    unlockSeconds: 36 * 3600, // 36 hours
    isNight: false,
    skyTop: '#E2E8F0',
    skyBottom: '#F8FAFC',
    sunOrMoonColor: '#F1F5F9',
    islandTop: '#A7C4B5',
    islandTopAlt: '#9AB8A8',
    islandLeft: '#475569',
    islandRight: '#334155',
    waterColor: '#7DD3FC',
    pathColor: '#CBD5E1',
    foliagePrimary: '#166534',
    foliageSecondary: '#14532D',
    wallLight: '#F1F5F9',
    wallDark: '#94A3B8',
    roofPrimary: '#334155',
    roofSecondary: '#1E293B',
    windowColor: '#BAE6FD',
    accentColor: '#334155',
  },
  {
    id: 'lantern',
    level: 5,
    name: 'Lantern Dusk',
    subtitle: 'Velvet twilight sky with warm illuminated study windows.',
    unlockSeconds: 48 * 3600, // 48 hours
    isNight: true,
    skyTop: '#1E293B',
    skyBottom: '#334155',
    sunOrMoonColor: '#FDE68A',
    islandTop: '#4A6B5D',
    islandTopAlt: '#416053',
    islandLeft: '#334155',
    islandRight: '#1E293B',
    waterColor: '#1E3A5F',
    pathColor: '#94A3B8',
    foliagePrimary: '#1E5242',
    foliageSecondary: '#133A2E',
    wallLight: '#E2E8F0',
    wallDark: '#94A3B8',
    roofPrimary: '#475569',
    roofSecondary: '#334155',
    windowColor: '#FBBF24',
    accentColor: '#D97706',
  },
  {
    id: 'observatory',
    level: 6,
    name: 'Starlight Observatory',
    subtitle: 'Deep midnight constellations, gilded domes, and quiet focus.',
    unlockSeconds: 60 * 3600, // 60 hours
    isNight: true,
    skyTop: '#0B1120',
    skyBottom: '#1E293B',
    sunOrMoonColor: '#FEF3C7',
    islandTop: '#334E58',
    islandTopAlt: '#2B434C',
    islandLeft: '#1E293B',
    islandRight: '#0F172A',
    waterColor: '#0F2942',
    pathColor: '#64748B',
    foliagePrimary: '#115E59',
    foliageSecondary: '#134E4A',
    wallLight: '#CBD5E1',
    wallDark: '#64748B',
    roofPrimary: '#B45309',
    roofSecondary: '#92400E',
    windowColor: '#FDE047',
    accentColor: '#F59E0B',
  },
];

// Each level spans 12 hours (43,200 seconds) with 16 structures:
// 1 structure unlocks every 45 minutes (2,700 seconds).
const UNLOCK_THRESHOLDS = Array.from(
  { length: STRUCTURES_PER_LEVEL },
  (_, idx) => (idx + 1) * (LEVEL_DURATION_SECONDS / STRUCTURES_PER_LEVEL)
);

// Balanced 4x4 grid coordinates ordered so central landmarks build first
const GRID_SLOTS: Array<[number, number]> = [
  [1, 1],
  [2, 1],
  [1, 2],
  [0, 1],
  [2, 2],
  [1, 0],
  [3, 1],
  [0, 2],
  [2, 0],
  [1, 3],
  [0, 0],
  [3, 2],
  [2, 3],
  [0, 3],
  [3, 0],
  [3, 3],
];

export const CITY_STRUCTURES: StructureBlueprint[] = [
  {
    id: 'city-1',
    index: 1,
    unlockSeconds: UNLOCK_THRESHOLDS[0],
    col: GRID_SLOTS[0][0],
    row: GRID_SLOTS[0][1],
    name: 'Central Plaza Fountain',
    category: 'Civic Landmark',
    description: 'The stone gathering square at the heart of your study district.',
    kind: 'plaza_fountain',
  },
  {
    id: 'city-2',
    index: 2,
    unlockSeconds: UNLOCK_THRESHOLDS[1],
    col: GRID_SLOTS[1][0],
    row: GRID_SLOTS[1][1],
    name: 'Corner Bookshop',
    category: 'Commerce',
    description: 'A quiet two-story bookshop stocked with reference manuals.',
    kind: 'bookshop',
  },
  {
    id: 'city-3',
    index: 3,
    unlockSeconds: UNLOCK_THRESHOLDS[2],
    col: GRID_SLOTS[2][0],
    row: GRID_SLOTS[2][1],
    name: 'Espresso Study Café',
    category: 'Commons',
    description: 'Warm awning tables for morning reading and problem sets.',
    kind: 'cafe',
  },
  {
    id: 'city-4',
    index: 4,
    unlockSeconds: UNLOCK_THRESHOLDS[3],
    col: GRID_SLOTS[3][0],
    row: GRID_SLOTS[3][1],
    name: 'Brick Row Townhouse',
    category: 'Residential',
    description: 'Stepped facade residences for visiting fellows and scholars.',
    kind: 'townhouse',
  },
  {
    id: 'city-5',
    index: 5,
    unlockSeconds: UNLOCK_THRESHOLDS[4],
    col: GRID_SLOTS[4][0],
    row: GRID_SLOTS[4][1],
    name: 'Public Archive Library',
    category: 'Civic Landmark',
    description: 'Tall arched reading halls housing centuries of quiet study.',
    kind: 'library',
  },
  {
    id: 'city-6',
    index: 6,
    unlockSeconds: UNLOCK_THRESHOLDS[5],
    col: GRID_SLOTS[5][0],
    row: GRID_SLOTS[5][1],
    name: 'Pocket Elm Grove',
    category: 'Green Space',
    description: 'Shaded trees along the avenue to keep the air crisp.',
    kind: 'tree_grove',
  },
  {
    id: 'city-7',
    index: 7,
    unlockSeconds: UNLOCK_THRESHOLDS[6],
    col: GRID_SLOTS[6][0],
    row: GRID_SLOTS[6][1],
    name: 'Bell & Clocktower',
    category: 'Monument',
    description: 'Marks each completed focus interval across the skyline.',
    kind: 'clocktower',
  },
  {
    id: 'city-8',
    index: 8,
    unlockSeconds: UNLOCK_THRESHOLDS[7],
    col: GRID_SLOTS[7][0],
    row: GRID_SLOTS[7][1],
    name: 'Terrace Apartments',
    category: 'Residential',
    description: 'Multi-level courtyard housing with rooftop planters.',
    kind: 'apartments',
  },
  {
    id: 'city-9',
    index: 9,
    unlockSeconds: UNLOCK_THRESHOLDS[8],
    col: GRID_SLOTS[8][0],
    row: GRID_SLOTS[8][1],
    name: 'Tramway Depot',
    category: 'Transit',
    description: 'Connects outer neighborhoods to the central campus.',
    kind: 'tram_station',
  },
  {
    id: 'city-10',
    index: 10,
    unlockSeconds: UNLOCK_THRESHOLDS[9],
    col: GRID_SLOTS[9][0],
    row: GRID_SLOTS[9][1],
    name: 'Botanical Glasshouse',
    category: 'Green Space',
    description: 'Iron-and-glass conservatory sheltering rare specimens.',
    kind: 'greenhouse',
  },
  {
    id: 'city-11',
    index: 11,
    unlockSeconds: UNLOCK_THRESHOLDS[10],
    col: GRID_SLOTS[10][0],
    row: GRID_SLOTS[10][1],
    name: 'Westgate Bakery',
    category: 'Commerce',
    description: 'Fresh loaves and study fuel for late-afternoon sessions.',
    kind: 'bakery',
  },
  {
    id: 'city-12',
    index: 12,
    unlockSeconds: UNLOCK_THRESHOLDS[11],
    col: GRID_SLOTS[11][0],
    row: GRID_SLOTS[11][1],
    name: 'Natural History Museum',
    category: 'Civic Landmark',
    description: 'Grand colonnade museum celebrating deep domain mastery.',
    kind: 'museum',
  },
  {
    id: 'city-13',
    index: 13,
    unlockSeconds: UNLOCK_THRESHOLDS[12],
    col: GRID_SLOTS[12][0],
    row: GRID_SLOTS[12][1],
    name: 'Scholars Residence',
    category: 'Residential',
    description: 'Quiet stone residences overlooking the southern promenade.',
    kind: 'townhouse',
  },
  {
    id: 'city-14',
    index: 14,
    unlockSeconds: UNLOCK_THRESHOLDS[13],
    col: GRID_SLOTS[13][0],
    row: GRID_SLOTS[13][1],
    name: 'Reflecting Koi Basin',
    category: 'Green Space',
    description: 'A tranquil stone pool built for unhurried reflection.',
    kind: 'koi_pond',
  },
  {
    id: 'city-15',
    index: 15,
    unlockSeconds: UNLOCK_THRESHOLDS[14],
    col: GRID_SLOTS[14][0],
    row: GRID_SLOTS[14][1],
    name: 'Lantern Pavilion',
    category: 'Monument',
    description: 'Tiered timber pavilion lit during twilight hours.',
    kind: 'lantern_pavilion',
  },
  {
    id: 'city-16',
    index: 16,
    unlockSeconds: UNLOCK_THRESHOLDS[15],
    col: GRID_SLOTS[15][0],
    row: GRID_SLOTS[15][1],
    name: 'Grand Observatory Dome',
    category: 'Apex Monument',
    description: 'The crowning astronomical dome of a master scholar city.',
    kind: 'observatory_dome',
  },
];

export const VILLAGE_STRUCTURES: StructureBlueprint[] = [
  {
    id: 'village-1',
    index: 1,
    unlockSeconds: UNLOCK_THRESHOLDS[0],
    col: GRID_SLOTS[0][0],
    row: GRID_SLOTS[0][1],
    name: 'Stone Village Well',
    category: 'Commons',
    description: 'The mossy cobblestone well anchoring the hamlet crossroads.',
    kind: 'well',
  },
  {
    id: 'village-2',
    index: 2,
    unlockSeconds: UNLOCK_THRESHOLDS[1],
    col: GRID_SLOTS[1][0],
    row: GRID_SLOTS[1][1],
    name: 'Timber Cottage',
    category: 'Homestead',
    description: 'A warm pitched-roof cottage with a stone chimney.',
    kind: 'cottage',
  },
  {
    id: 'village-3',
    index: 3,
    unlockSeconds: UNLOCK_THRESHOLDS[2],
    col: GRID_SLOTS[2][0],
    row: GRID_SLOTS[2][1],
    name: 'Hearthstone Bakery',
    category: 'Craft',
    description: 'A bustling oven house filling the lane with warm bread.',
    kind: 'bakery',
  },
  {
    id: 'village-4',
    index: 4,
    unlockSeconds: UNLOCK_THRESHOLDS[3],
    col: GRID_SLOTS[3][0],
    row: GRID_SLOTS[3][1],
    name: 'Birch & Oak Copse',
    category: 'Woodland',
    description: 'Old-growth shade trees along the western pasture.',
    kind: 'tree_grove',
  },
  {
    id: 'village-5',
    index: 5,
    unlockSeconds: UNLOCK_THRESHOLDS[4],
    col: GRID_SLOTS[4][0],
    row: GRID_SLOTS[4][1],
    name: 'Canvas Market Stalls',
    category: 'Commons',
    description: 'Striped stalls trading produce, ink, and bound notebooks.',
    kind: 'market_stall',
  },
  {
    id: 'village-6',
    index: 6,
    unlockSeconds: UNLOCK_THRESHOLDS[5],
    col: GRID_SLOTS[5][0],
    row: GRID_SLOTS[5][1],
    name: 'Hilltop Windmill',
    category: 'Craft',
    description: 'Turning timber sails powered by steady afternoon breezes.',
    kind: 'windmill',
  },
  {
    id: 'village-7',
    index: 7,
    unlockSeconds: UNLOCK_THRESHOLDS[6],
    col: GRID_SLOTS[6][0],
    row: GRID_SLOTS[6][1],
    name: 'Wayside Inn',
    category: 'Hospitality',
    description: 'Timber-framed tavern welcoming travelers and scholars.',
    kind: 'inn',
  },
  {
    id: 'village-8',
    index: 8,
    unlockSeconds: UNLOCK_THRESHOLDS[7],
    col: GRID_SLOTS[7][0],
    row: GRID_SLOTS[7][1],
    name: 'Meadow Footbridge',
    category: 'Pathway',
    description: 'An arched wooden crossing over a quiet garden stream.',
    kind: 'footbridge',
  },
  {
    id: 'village-9',
    index: 9,
    unlockSeconds: UNLOCK_THRESHOLDS[8],
    col: GRID_SLOTS[8][0],
    row: GRID_SLOTS[8][1],
    name: 'Red Harvest Barn',
    category: 'Homestead',
    description: 'Sturdy timber barn storing autumn grain and tools.',
    kind: 'barn',
  },
  {
    id: 'village-10',
    index: 10,
    unlockSeconds: UNLOCK_THRESHOLDS[9],
    col: GRID_SLOTS[9][0],
    row: GRID_SLOTS[9][1],
    name: 'Village Bookshop',
    category: 'Study',
    description: 'A cozy timber loft overflowing with folios and maps.',
    kind: 'bookshop',
  },
  {
    id: 'village-11',
    index: 11,
    unlockSeconds: UNLOCK_THRESHOLDS[10],
    col: GRID_SLOTS[10][0],
    row: GRID_SLOTS[10][1],
    name: 'Sunlit Flower Terrace',
    category: 'Garden',
    description: 'Neatly tended wildflower beds bordering the lane.',
    kind: 'flower_bed',
  },
  {
    id: 'village-12',
    index: 12,
    unlockSeconds: UNLOCK_THRESHOLDS[11],
    col: GRID_SLOTS[11][0],
    row: GRID_SLOTS[11][1],
    name: 'Stone Bell Chapel',
    category: 'Landmark',
    description: 'Quiet stone spire overlooking the valley below.',
    kind: 'chapel',
  },
  {
    id: 'village-13',
    index: 13,
    unlockSeconds: UNLOCK_THRESHOLDS[12],
    col: GRID_SLOTS[12][0],
    row: GRID_SLOTS[12][1],
    name: 'Orchard Cottage',
    category: 'Homestead',
    description: 'A second hillside home nestled beside fruit trees.',
    kind: 'cottage',
  },
  {
    id: 'village-14',
    index: 14,
    unlockSeconds: UNLOCK_THRESHOLDS[13],
    col: GRID_SLOTS[13][0],
    row: GRID_SLOTS[13][1],
    name: 'Garden Gazebo',
    category: 'Commons',
    description: 'An octagonal reading shelter open to the summer breeze.',
    kind: 'gazebo',
  },
  {
    id: 'village-15',
    index: 15,
    unlockSeconds: UNLOCK_THRESHOLDS[14],
    col: GRID_SLOTS[14][0],
    row: GRID_SLOTS[14][1],
    name: 'Lantern Pavilion',
    category: 'Landmark',
    description: 'Warm timber shrine glowing gently at dusk.',
    kind: 'lantern_pavilion',
  },
  {
    id: 'village-16',
    index: 16,
    unlockSeconds: UNLOCK_THRESHOLDS[15],
    col: GRID_SLOTS[15][0],
    row: GRID_SLOTS[15][1],
    name: 'Hilltop Observatory',
    category: 'Apex Monument',
    description: 'Stargazing dome raised above the quiet village rooftops.',
    kind: 'observatory_dome',
  },
];

export const PARK_STRUCTURES: StructureBlueprint[] = [
  {
    id: 'park-1',
    index: 1,
    unlockSeconds: UNLOCK_THRESHOLDS[0],
    col: GRID_SLOTS[0][0],
    row: GRID_SLOTS[0][1],
    name: 'Reflecting Koi Pond',
    category: 'Water',
    description: 'Clear spring water rimmed with smooth river stones.',
    kind: 'koi_pond',
  },
  {
    id: 'park-2',
    index: 2,
    unlockSeconds: UNLOCK_THRESHOLDS[1],
    col: GRID_SLOTS[1][0],
    row: GRID_SLOTS[1][1],
    name: 'Cedar & Maple Grove',
    category: 'Canopy',
    description: 'A quiet stand of tall trees filtering the morning light.',
    kind: 'tree_grove',
  },
  {
    id: 'park-3',
    index: 3,
    unlockSeconds: UNLOCK_THRESHOLDS[2],
    col: GRID_SLOTS[2][0],
    row: GRID_SLOTS[2][1],
    name: 'Botanical Flower Beds',
    category: 'Flora',
    description: 'Terraced beds of lavender, sage, and seasonal blooms.',
    kind: 'flower_bed',
  },
  {
    id: 'park-4',
    index: 4,
    unlockSeconds: UNLOCK_THRESHOLDS[3],
    col: GRID_SLOTS[3][0],
    row: GRID_SLOTS[3][1],
    name: 'Arched Footbridge',
    category: 'Pathway',
    description: 'Curved cedar bridge linking the meadow trails.',
    kind: 'footbridge',
  },
  {
    id: 'park-5',
    index: 5,
    unlockSeconds: UNLOCK_THRESHOLDS[4],
    col: GRID_SLOTS[4][0],
    row: GRID_SLOTS[4][1],
    name: 'Octagonal Reading Gazebo',
    category: 'Pavilion',
    description: 'A sheltered timber gazebo built for open-air reading.',
    kind: 'gazebo',
  },
  {
    id: 'park-6',
    index: 6,
    unlockSeconds: UNLOCK_THRESHOLDS[5],
    col: GRID_SLOTS[5][0],
    row: GRID_SLOTS[5][1],
    name: 'Parkside Espresso Stand',
    category: 'Commons',
    description: 'Small shaded kiosk serving tea and warm pastries.',
    kind: 'cafe',
  },
  {
    id: 'park-7',
    index: 7,
    unlockSeconds: UNLOCK_THRESHOLDS[6],
    col: GRID_SLOTS[6][0],
    row: GRID_SLOTS[6][1],
    name: 'Stone Courtyard Fountain',
    category: 'Water',
    description: 'Tiered limestone fountain humming softly in the center.',
    kind: 'plaza_fountain',
  },
  {
    id: 'park-8',
    index: 8,
    unlockSeconds: UNLOCK_THRESHOLDS[7],
    col: GRID_SLOTS[7][0],
    row: GRID_SLOTS[7][1],
    name: 'Whispering Pine Stand',
    category: 'Canopy',
    description: 'Dense evergreens sheltering songbirds on the ridge.',
    kind: 'tree_grove',
  },
  {
    id: 'park-9',
    index: 9,
    unlockSeconds: UNLOCK_THRESHOLDS[8],
    col: GRID_SLOTS[8][0],
    row: GRID_SLOTS[8][1],
    name: 'Lantern Garden Pavilion',
    category: 'Pavilion',
    description: 'Timber tea pavilion illuminated by hanging paper lamps.',
    kind: 'lantern_pavilion',
  },
  {
    id: 'park-10',
    index: 10,
    unlockSeconds: UNLOCK_THRESHOLDS[9],
    col: GRID_SLOTS[9][0],
    row: GRID_SLOTS[9][1],
    name: 'Glass Conservatory',
    category: 'Landmark',
    description: 'Vaulted botanical greenhouse nurturing ferns and palms.',
    kind: 'conservatory',
  },
  {
    id: 'park-11',
    index: 11,
    unlockSeconds: UNLOCK_THRESHOLDS[10],
    col: GRID_SLOTS[10][0],
    row: GRID_SLOTS[10][1],
    name: 'Stone Amphitheater',
    category: 'Commons',
    description: 'Semi-circular limestone seating for outdoor lectures.',
    kind: 'amphitheater',
  },
  {
    id: 'park-12',
    index: 12,
    unlockSeconds: UNLOCK_THRESHOLDS[11],
    col: GRID_SLOTS[11][0],
    row: GRID_SLOTS[11][1],
    name: 'Park Ranger Bookhouse',
    category: 'Study',
    description: 'Field-guide library tucked beside the eastern trail.',
    kind: 'bookshop',
  },
  {
    id: 'park-13',
    index: 13,
    unlockSeconds: UNLOCK_THRESHOLDS[12],
    col: GRID_SLOTS[12][0],
    row: GRID_SLOTS[12][1],
    name: 'Upper Terrace Blooms',
    category: 'Flora',
    description: 'A second terraced flower garden along the south edge.',
    kind: 'flower_bed',
  },
  {
    id: 'park-14',
    index: 14,
    unlockSeconds: UNLOCK_THRESHOLDS[13],
    col: GRID_SLOTS[13][0],
    row: GRID_SLOTS[13][1],
    name: 'Sculpted Bridge Gate',
    category: 'Pathway',
    description: 'Stone arch gateway framing the western promenade.',
    kind: 'bridge_arch',
  },
  {
    id: 'park-15',
    index: 15,
    unlockSeconds: UNLOCK_THRESHOLDS[14],
    col: GRID_SLOTS[14][0],
    row: GRID_SLOTS[14][1],
    name: 'Garden Clocktower',
    category: 'Monument',
    description: 'Ivy-clad chime tower rising above the canopy.',
    kind: 'clocktower',
  },
  {
    id: 'park-16',
    index: 16,
    unlockSeconds: UNLOCK_THRESHOLDS[15],
    col: GRID_SLOTS[15][0],
    row: GRID_SLOTS[15][1],
    name: 'Canopy Observatory',
    category: 'Apex Monument',
    description: 'Stargazing dome overlooking the entire botanical reserve.',
    kind: 'observatory_dome',
  },
];

export function getSubjectLevelNumber(totalSeconds: number): number {
  if (totalSeconds <= LEVEL_DURATION_SECONDS) return 1;
  return Math.min(MAX_LEVELS, Math.floor((totalSeconds - 1) / LEVEL_DURATION_SECONDS) + 1);
}

export function getSecondsInLevel(totalSeconds: number, levelNumber: number): number {
  const start = (levelNumber - 1) * LEVEL_DURATION_SECONDS;
  if (totalSeconds <= start) return 0;
  return Math.min(LEVEL_DURATION_SECONDS, totalSeconds - start);
}

export function getBlueprintsForStyle(style: SettlementStyle): StructureBlueprint[] {
  switch (style) {
    case 'village':
      return VILLAGE_STRUCTURES;
    case 'park':
      return PARK_STRUCTURES;
    case 'city':
    default:
      return CITY_STRUCTURES;
  }
}

export function getUnlockedStructures(
  style: SettlementStyle,
  totalSeconds: number,
  levelNumber: number = getSubjectLevelNumber(totalSeconds)
): StructureBlueprint[] {
  const levelSeconds = getSecondsInLevel(totalSeconds, levelNumber);
  return getBlueprintsForStyle(style).filter((b) => levelSeconds >= b.unlockSeconds);
}

export function getNextStructure(
  style: SettlementStyle,
  totalSeconds: number,
  levelNumber: number = getSubjectLevelNumber(totalSeconds)
): StructureBlueprint | null {
  const levelSeconds = getSecondsInLevel(totalSeconds, levelNumber);
  return getBlueprintsForStyle(style).find((b) => levelSeconds < b.unlockSeconds) ?? null;
}

export function getThemeById(id: EnvironmentId): EnvironmentTheme {
  return ENVIRONMENT_THEMES.find((t) => t.id === id) ?? ENVIRONMENT_THEMES[0];
}

export function getTotalStudySeconds(subjects: SubjectCity[]): number {
  return subjects.reduce((sum, s) => sum + s.totalSeconds, 0);
}

export function isEnvironmentUnlocked(theme: EnvironmentTheme, totalStudySeconds: number): boolean {
  return totalStudySeconds >= theme.unlockSeconds;
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export function formatReadableDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hrs > 0) {
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }
  if (mins > 0) {
    return secs > 0 && mins < 5 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  return `${secs}s`;
}

export function createStarterSubjects(): SubjectCity[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'sub-math',
      name: 'Mathematics',
      style: 'city',
      totalSeconds: 0,
      createdAt: now,
      lastStudiedAt: now,
    },
    {
      id: 'sub-cs',
      name: 'Computer Science',
      style: 'city',
      totalSeconds: 0,
      createdAt: now,
      lastStudiedAt: now,
    },
    {
      id: 'sub-bio',
      name: 'Biology',
      style: 'park',
      totalSeconds: 0,
      createdAt: now,
      lastStudiedAt: now,
    },
    {
      id: 'sub-hist',
      name: 'History',
      style: 'village',
      totalSeconds: 0,
      createdAt: now,
      lastStudiedAt: now,
    },
  ];
}
