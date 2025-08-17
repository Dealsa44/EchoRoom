export type GenderIdentity = 'male' | 'female' | 'non-binary' | 'other';

export type Orientation = 
  | 'heterosexual' 
  | 'homosexual' 
  | 'bisexual' 
  | 'asexual' 
  | 'pansexual' 
  | 'queer'
  | string; // For custom orientations

export type AttractionPreference = 'women' | 'men' | 'non-binary' | 'all-genders';

// Helper function to derive attraction preferences from gender and orientation
export const getAttractionPreferences = (genderIdentity: GenderIdentity, orientation: Orientation): AttractionPreference[] => {
  // Handle custom orientations as 'other'
  const normalizedOrientation = typeof orientation === 'string' && 
    !['heterosexual', 'homosexual', 'bisexual', 'asexual', 'pansexual', 'queer'].includes(orientation) 
    ? 'other' : orientation;

  switch (normalizedOrientation) {
    case 'heterosexual':
      if (genderIdentity === 'male') return ['women'];
      if (genderIdentity === 'female') return ['men'];
      if (genderIdentity === 'non-binary') return ['all-genders']; // Non-binary hetero is complex, default to all
      return ['all-genders'];
      
    case 'homosexual':
      if (genderIdentity === 'male') return ['men'];
      if (genderIdentity === 'female') return ['women'];
      if (genderIdentity === 'non-binary') return ['non-binary'];
      return ['all-genders'];
      
    case 'bisexual':
      return ['women', 'men'];
      
    case 'pansexual':
    case 'queer':
      return ['all-genders'];
      
    case 'asexual':
      return []; // Asexual people may not be sexually attracted to anyone, but could be romantically attracted
      
    case 'other':
    default:
      return ['all-genders']; // Default to all genders for unknown orientations
  }
};
