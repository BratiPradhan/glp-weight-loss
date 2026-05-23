import type { FormSchema, Screen } from './screen-types.js';

const age: Screen = {
  id: 'age',
  title: 'Age',
  inputType: 'number',
  prompt: 'What is your age?',
  min: 0,
  max: 120,
  unit: 'years',
  next: {
    default: 'weight',
    rules: [
      // Order matters: first match wins.
      // age < 18 → terminal ineligible
      {
        when: [{ field: 'age', op: 'lt', value: 18 }],
        goto: { type: 'ineligible', reason: 'underage' },
      },
      // age > 75 → terminal clinical review
      {
        when: [{ field: 'age', op: 'gt', value: 75 }],
        goto: { type: 'clinical-review', reason: 'age-over-75' },
      },
    ],
  },
};

const weight: Screen = {
  id: 'weight',
  title: 'Weight',
  inputType: 'number',
  prompt: 'Enter your weight in kilograms.',
  min: 20,
  max: 500,
  unit: 'kg',
  next: { default: 'height' },
};

const height: Screen = {
  id: 'height',
  title: 'Height',
  inputType: 'number',
  prompt: 'Enter your height in centimeters.',
  min: 50,
  max: 250,
  unit: 'cm',
  next: { default: 'bmi' },
};

const bmi: Screen = {
  id: 'bmi',
  title: 'BMI',
  inputType: 'computed',
  prompt: '', // computed screens have no prompt
  next: {
    default: 'pregnancy',
    rules: [
      {
        when: [{ field: 'bmi', op: 'lt', value: 25 }],
        goto: { type: 'ineligible', reason: 'bmi-too-low' },
      },
      {
        when: [{ field: 'bmi', op: 'gte', value: 40 }],
        goto: { type: 'clinical-review', reason: 'high-bmi' },
      },
    ],
  },
};

const pregnancy: Screen = {
  id: 'pregnancy',
  title: 'Pregnancy Status',
  inputType: 'radio',
  prompt: 'Are you currently pregnant?',
  options: ['Yes', 'No'] as const,
  next: {
    default: 'comorbidities',
    rules: [
      {
        when: [{ field: 'pregnancy', op: 'eq', value: 'Yes' }],
        goto: { type: 'ineligible', reason: 'pregnancy' },
      },
    ],
  },
};

const comorbidities: Screen = {
  id: 'comorbidities',
  title: 'Comorbid Conditions',
  inputType: 'checkbox',
  prompt: 'Which chronic conditions have you been diagnosed with? (Select all that apply)',
  options: ['Hypertension', 'Dyslipidemia', 'Sleep Apnea', 'GERD', 'Thyroid Disorder'] as const,
  next: { default: 'diabetes' },
};

const diabetes: Screen = {
  id: 'diabetes',
  title: 'Diabetes History',
  inputType: 'radio',
  prompt: 'Have you ever been diagnosed with diabetes?',
  options: ['Yes', 'No'] as const,
  next: {
    default: 'bloodPressure', // No → skip hba1c
    rules: [
      {
        when: [{ field: 'diabetes', op: 'eq', value: 'Yes' }],
        goto: 'hba1c',
      },
    ],
  },
};

const hba1c: Screen = {
  id: 'hba1c',
  title: 'Most Recent HbA1c',
  inputType: 'number',
  prompt: 'Enter your latest HbA1c (%) result.',
  min: 2,
  max: 20,
  unit: '%',
  next: {
    default: 'bloodPressure',
    rules: [
      {
        when: [{ field: 'hba1c', op: 'gt', value: 9.0 }],
        goto: { type: 'ineligible', reason: 'uncontrolled-diabetes' },
      },
    ],
  },
};

const bloodPressure: Screen = {
  id: 'bloodPressure',
  title: 'Blood Pressure',
  inputType: 'checkbox',
  prompt: 'Check all that apply based on your most recent blood pressure reading.',
  options: [
    'Normal',
    'Elevated',
    'Stage 1 Hypertension',
    'Stage 2 Hypertension',
    'Hypertensive Crisis',
  ] as const,
  next: { default: 'medications' },
};

const medications: Screen = {
  id: 'medications',
  title: 'Current Medications',
  inputType: 'checkbox',
  prompt: 'Which medications are you currently prescribed?',
  options: [
    'ACE inhibitors',
    'Beta blockers',
    'Statins',
    'Thyroid medication',
    'GLP-1 receptor agonist',
  ] as const,
  next: {
    default: 'smoking',
    rules: [
      {
        when: [{ field: 'medications', op: 'includes', value: 'GLP-1 receptor agonist' }],
        goto: { type: 'ineligible', reason: 'already-on-glp1' },
      },
    ],
  },
};

const smoking: Screen = {
  id: 'smoking',
  title: 'Smoking Status',
  inputType: 'radio',
  prompt: 'Do you currently smoke tobacco?',
  options: ['Yes', 'No'] as const,
  next: { default: 'alcohol' },
};

const alcohol: Screen = {
  id: 'alcohol',
  title: 'Alcohol Use',
  inputType: 'radio',
  prompt: 'How often do you consume alcohol?',
  options: ['Never', 'Monthly', 'Weekly', 'Daily'] as const,
  next: { default: 'activity' },
};

const activity: Screen = {
  id: 'activity',
  title: 'Physical Activity',
  inputType: 'radio',
  prompt: 'How would you describe your typical activity level?',
  options: ['Sedentary', 'Light', 'Moderate', 'Vigorous'] as const,
  next: { default: 'diet' },
};

const diet: Screen = {
  id: 'diet',
  title: 'Dietary Habits',
  inputType: 'checkbox',
  prompt: 'Which best describes your diet? (Select all that apply)',
  options: [
    'High sugar intake',
    'High processed foods',
    'Frequent sugary beverages',
    'High fiber diet',
    'Balanced diet',
  ] as const,
  next: {
    default: { type: 'evaluate' },
  },
};

const result: Screen = {
  id: 'result',
  title: 'Eligibility Result',
  inputType: 'computed',
  prompt: '',
  next: { default: { type: 'evaluate' } },
};

export const formSchema: FormSchema = {
  startScreen: 'age',
  screens: {
    age,
    weight,
    height,
    bmi,
    pregnancy,
    comorbidities,
    diabetes,
    hba1c,
    bloodPressure,
    medications,
    smoking,
    alcohol,
    activity,
    diet,
    result,
  },
};
