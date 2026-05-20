// Screen IDs are string literals so the type system catches typos.
export type ScreenId =
  | 'age'
  | 'weight'
  | 'height'
  | 'bmi'
  | 'pregnancy'
  | 'comorbidities'
  | 'diabetes'
  | 'hba1c'
  | 'bloodPressure'
  | 'medications'
  | 'smoking'
  | 'alcohol'
  | 'activity'
  | 'diet'
  | 'result';

// What kind of answer the user gives. Discriminated union later.
export type InputType = 'number' | 'radio' | 'checkbox' | 'computed';

// The actual answer values, keyed by screen.
// Discriminated structurally — we'll narrow by ScreenId in the evaluator.
export type NumberAnswer = number;
export type RadioAnswer = string;
export type CheckboxAnswer = string[];

export type AnswerValue = NumberAnswer | RadioAnswer | CheckboxAnswer;

// The full answer map for a session. Partial because not every screen
// will be answered before terminal states.
export type Answers = Partial<{
  age: number;
  weight: number;
  height: number;
  // bmi is computed, never user-entered
  pregnancy: 'Yes' | 'No';
  comorbidities: ComorbidOption[];
  diabetes: 'Yes' | 'No';
  hba1c: number;
  bloodPressure: BloodPressureOption[];
  medications: MedicationOption[];
  smoking: 'Yes' | 'No';
  alcohol: AlcoholFrequency;
  activity: ActivityLevel;
  diet: DietOption[];
}>;

// Option enums — keep these as string-literal unions so the
// evaluator gets exhaustiveness checks for free.
export type ComorbidOption =
  | 'Hypertension'
  | 'Dyslipidemia'
  | 'Sleep Apnea'
  | 'GERD'
  | 'Thyroid Disorder';

export type BloodPressureOption =
  | 'Normal'
  | 'Elevated'
  | 'Stage 1 Hypertension'
  | 'Stage 2 Hypertension'
  | 'Hypertensive Crisis';

export type MedicationOption =
  | 'ACE inhibitors'
  | 'Beta blockers'
  | 'Statins'
  | 'Thyroid medication'
  | 'GLP-1 receptor agonist';

export type AlcoholFrequency = 'Never' | 'Monthly' | 'Weekly' | 'Daily';

export type ActivityLevel = 'Sedentary' | 'Light' | 'Moderate' | 'Vigorous';

export type DietOption =
  | 'High sugar intake'
  | 'High processed foods'
  | 'Frequent sugary beverages'
  | 'High fiber diet'
  | 'Balanced diet';
