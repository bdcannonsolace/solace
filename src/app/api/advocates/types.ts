export type ListAdvocateFilters = {
  firstName?: string;
  lastName?: string;
  city?: string;
  degree?: string;
  specialties?: string[]; // matches any of the provided specialties
  yearsOfExperience?: number; // exact match
  minYearsOfExperience?: number; // inclusive lower bound
  maxYearsOfExperience?: number; // inclusive upper bound
};


