export enum SectionId {
  INTRO = 'intro',
  PROBLEM = 'problem',
  MECHANISM = 'mechanism',
  SOLUTION = 'solution',
  RESULTS = 'results'
}

export interface NavigationItem {
  id: SectionId;
  label: string;
}

export interface BitData {
  sign: number;
  exponent: number[];
  mantissa: number[];
  fullString: string;
  value: number;
}
