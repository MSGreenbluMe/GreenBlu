export type Chronotype = 'lark' | 'owl' | 'intermediate';

export interface CircadianCurve {
  hour: number; // 0-23
  energy: number; // 0-100
  focus: number; // 0-100
  creativity: number; // 0-100
}

export interface ChronotypeProfile {
  type: Chronotype;
  optimalWakeTime: string; // HH:MM
  optimalSleepTime: string; // HH:MM
  peakEnergyWindow: { start: number; end: number }; // hours (0-23)
  peakFocusWindow: { start: number; end: number };
  peakCreativityWindow: { start: number; end: number };
  description: string;
}

/**
 * Calculate chronotype based on questionnaire responses
 */
export function calculateChronotype(
  wakePreference: 'early' | 'late' | 'flexible',
  productiveTime: 'morning' | 'afternoon' | 'evening' | 'night',
  personType: 'morning' | 'evening' | 'neither'
): Chronotype {
  let score = 0;

  // Wake preference scoring
  if (wakePreference === 'early') score += 2;
  else if (wakePreference === 'late') score -= 2;

  // Productive time scoring
  if (productiveTime === 'morning') score += 2;
  else if (productiveTime === 'afternoon') score += 0;
  else if (productiveTime === 'evening') score -= 1;
  else if (productiveTime === 'night') score -= 2;

  // Person type scoring
  if (personType === 'morning') score += 2;
  else if (personType === 'evening') score -= 2;

  // Determine chronotype
  if (score >= 3) return 'lark';
  if (score <= -3) return 'owl';
  return 'intermediate';
}

/**
 * Get chronotype profile with optimal times
 */
export function getChronotypeProfile(chronotype: Chronotype): ChronotypeProfile {
  switch (chronotype) {
    case 'lark':
      return {
        type: 'lark',
        optimalWakeTime: '06:00',
        optimalSleepTime: '22:00',
        peakEnergyWindow: { start: 8, end: 10 },
        peakFocusWindow: { start: 9, end: 12 },
        peakCreativityWindow: { start: 10, end: 12 },
        description: 'Early bird - most productive in the morning hours',
      };

    case 'owl':
      return {
        type: 'owl',
        optimalWakeTime: '09:00',
        optimalSleepTime: '01:00',
        peakEnergyWindow: { start: 14, end: 18 },
        peakFocusWindow: { start: 16, end: 20 },
        peakCreativityWindow: { start: 20, end: 23 },
        description: 'Night owl - most productive in afternoon and evening',
      };

    case 'intermediate':
    default:
      return {
        type: 'intermediate',
        optimalWakeTime: '07:30',
        optimalSleepTime: '23:30',
        peakEnergyWindow: { start: 10, end: 14 },
        peakFocusWindow: { start: 10, end: 16 },
        peakCreativityWindow: { start: 14, end: 17 },
        description: 'Intermediate - balanced energy throughout the day',
      };
  }
}

/**
 * Generate 24-hour circadian curve based on chronotype
 */
export function generateCircadianCurve(chronotype: Chronotype): CircadianCurve[] {
  const curve: CircadianCurve[] = [];

  for (let hour = 0; hour < 24; hour++) {
    curve.push({
      hour,
      energy: calculateEnergy(chronotype, hour),
      focus: calculateFocus(chronotype, hour),
      creativity: calculateCreativity(chronotype, hour),
    });
  }

  return curve;
}

/**
 * Calculate energy level for a specific hour
 */
function calculateEnergy(chronotype: Chronotype, hour: number): number {
  switch (chronotype) {
    case 'lark':
      // Larks: high energy 6-12, dip 13-15, moderate 16-20, low 21-5
      if (hour >= 6 && hour <= 10) return 85 + (10 - Math.abs(hour - 8)) * 1.5; // Peak 8-10
      if (hour >= 11 && hour <= 12) return 75;
      if (hour >= 13 && hour <= 15) return 50 - (hour - 13) * 5; // Post-lunch dip
      if (hour >= 16 && hour <= 20) return 55;
      if (hour >= 21 || hour <= 5) return 20 - Math.min(hour >= 21 ? hour - 21 : 5 - hour, 5) * 2;
      return 40;

    case 'owl':
      // Owls: low 6-10, building 11-14, peak 15-20, good 21-23, low 0-5
      if (hour >= 6 && hour <= 10) return 30 + (hour - 6) * 4;
      if (hour >= 11 && hour <= 14) return 55 + (hour - 11) * 7;
      if (hour >= 15 && hour <= 18) return 85 + (17 - Math.abs(hour - 17)) * 2; // Peak 16-18
      if (hour >= 19 && hour <= 23) return 75 - (hour - 19) * 3;
      if (hour >= 0 && hour <= 5) return 25;
      return 50;

    case 'intermediate':
    default:
      // Intermediate: gradual rise 6-11, peak 11-15, gradual decline 16-22, low 23-5
      if (hour >= 6 && hour <= 11) return 40 + (hour - 6) * 9;
      if (hour >= 12 && hour <= 15) return 85 - Math.abs(hour - 13) * 3;
      if (hour >= 16 && hour <= 22) return 70 - (hour - 16) * 6;
      if (hour >= 23 || hour <= 5) return 25;
      return 50;
  }
}

/**
 * Calculate focus level for a specific hour
 */
function calculateFocus(chronotype: Chronotype, hour: number): number {
  switch (chronotype) {
    case 'lark':
      // Larks: best focus 9-12
      if (hour >= 9 && hour <= 12) return 90 - Math.abs(hour - 10.5) * 3;
      if (hour >= 13 && hour <= 15) return 45;
      if (hour >= 6 && hour <= 8) return 65;
      if (hour >= 16 && hour <= 20) return 55;
      return 30;

    case 'owl':
      // Owls: best focus 16-20
      if (hour >= 16 && hour <= 20) return 90 - Math.abs(hour - 18) * 2;
      if (hour >= 21 && hour <= 23) return 70;
      if (hour >= 12 && hour <= 15) return 65;
      if (hour >= 6 && hour <= 11) return 35;
      return 25;

    case 'intermediate':
    default:
      // Intermediate: best focus 10-16
      if (hour >= 10 && hour <= 16) return 85 - Math.abs(hour - 13) * 2;
      if (hour >= 6 && hour <= 9) return 50;
      if (hour >= 17 && hour <= 21) return 60;
      return 30;
  }
}

/**
 * Calculate creativity level for a specific hour
 */
function calculateCreativity(chronotype: Chronotype, hour: number): number {
  switch (chronotype) {
    case 'lark':
      // Larks: creative in morning and when slightly tired (evening)
      if (hour >= 10 && hour <= 12) return 85;
      if (hour >= 18 && hour <= 20) return 75; // Slightly tired = creative
      if (hour >= 6 && hour <= 9) return 60;
      return 40;

    case 'owl':
      // Owls: creative in evening and night
      if (hour >= 20 && hour <= 23) return 90 - (23 - hour) * 2;
      if (hour >= 15 && hour <= 19) return 75;
      if (hour >= 12 && hour <= 14) return 60;
      return 35;

    case 'intermediate':
    default:
      // Intermediate: creative mid-day and early evening
      if (hour >= 14 && hour <= 17) return 85 - Math.abs(hour - 15.5) * 3;
      if (hour >= 10 && hour <= 13) return 70;
      if (hour >= 18 && hour <= 20) return 65;
      return 45;
  }
}

/**
 * Get current circadian phase (0-1, where 0.5 is peak energy)
 */
export function getCurrentCircadianPhase(chronotype: Chronotype, currentHour: number): number {
  const curve = generateCircadianCurve(chronotype);
  const currentEnergy = curve[currentHour].energy;
  const maxEnergy = Math.max(...curve.map((c) => c.energy));

  return currentEnergy / maxEnergy;
}

/**
 * Get recommended activity for current time based on chronotype
 */
export function getRecommendedActivity(chronotype: Chronotype, currentHour: number): string {
  const curve = generateCircadianCurve(chronotype);
  const current = curve[currentHour];

  if (current.focus >= 75) return 'Deep analytical work';
  if (current.creativity >= 75) return 'Creative brainstorming';
  if (current.energy >= 75 && current.focus < 75) return 'Meetings and collaboration';
  if (current.energy >= 50) return 'Routine tasks';
  if (current.energy < 50) return 'Rest and recovery';

  return 'Light administrative work';
}

/**
 * Calculate optimal check-in times based on chronotype (3-4 times per day)
 */
export function getOptimalCheckInTimes(chronotype: Chronotype): number[] {
  const profile = getChronotypeProfile(chronotype);

  switch (chronotype) {
    case 'lark':
      return [8, 11, 14, 19]; // Morning peak, pre-lunch, afternoon, evening

    case 'owl':
      return [10, 14, 17, 21]; // Late morning, afternoon, evening peak, night

    case 'intermediate':
    default:
      return [9, 12, 15, 20]; // Morning, noon, afternoon, evening
  }
}
