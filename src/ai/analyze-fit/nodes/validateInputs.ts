import type { LangGraphRunnableConfig } from '@langchain/langgraph';

type ValidateInputsState = {
  resumeText: string;
  jobDescriptionText: string;
};

type ValidationResult = {
  valid: boolean;
  reason: string;
};

const RESUME_SECTION_HEADERS = [
  'experience',
  'education',
  'skills',
  'work history',
  'employment',
  'objective',
  'summary',
  'qualifications',
  'projects',
  'certifications',
  'professional',
];

const RESUME_ACTION_VERBS = [
  'managed',
  'developed',
  'led',
  'implemented',
  'achieved',
  'created',
  'designed',
  'built',
  'delivered',
  'improved',
  'increased',
  'reduced',
  'coordinated',
  'analyzed',
];

const JOB_SECTION_HEADERS = [
  'responsibilities',
  'requirements',
  'qualifications',
  'about the role',
  'about the position',
  "what you'll do",
  "what we're looking for",
  'we are looking for',
  'duties',
  'benefits',
  'about us',
  'the role',
];

const JOB_KEYWORDS = [
  'position',
  'role',
  'opportunity',
  'hiring',
  'apply',
  'candidate',
  'team',
  'company',
  'salary',
  'remote',
  'hybrid',
  'full-time',
  'part-time',
  'contract',
];

const REQUIREMENT_PATTERNS = [
  'years of experience',
  'years experience',
  'required',
  'preferred',
  'must have',
  'nice to have',
  'bonus',
  "bachelor's",
  "master's",
  'degree in',
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

const MIN_TEXT_LENGTH = 100;
const MIN_RESUME_MATCHES = 3;
const MIN_JD_MATCHES = 3;

function countMatches(text: string, patterns: string[]): number {
  const lowerText = text.toLowerCase();
  return patterns.filter((pattern) => lowerText.includes(pattern.toLowerCase())).length;
}

function isLikelyResume(text: string): ValidationResult {
  if (text.length < MIN_TEXT_LENGTH) {
    return { valid: false, reason: 'Text is too short to be a resume.' };
  }

  const sectionMatches = countMatches(text, RESUME_SECTION_HEADERS);
  const actionVerbMatches = countMatches(text, RESUME_ACTION_VERBS);
  const hasEmail = EMAIL_REGEX.test(text);
  const hasPhone = PHONE_REGEX.test(text);

  const totalScore = sectionMatches + actionVerbMatches + (hasEmail ? 1 : 0) + (hasPhone ? 1 : 0);

  if (totalScore >= MIN_RESUME_MATCHES) {
    return { valid: true, reason: 'Text contains resume indicators.' };
  }

  return {
    valid: false,
    reason:
      'Text does not appear to be a resume. Missing typical resume sections, professional experience, or contact information.',
  };
}

function isLikelyJobDescription(text: string): ValidationResult {
  if (text.length < MIN_TEXT_LENGTH) {
    return { valid: false, reason: 'Text is too short to be a job description.' };
  }

  const sectionMatches = countMatches(text, JOB_SECTION_HEADERS);
  const keywordMatches = countMatches(text, JOB_KEYWORDS);
  const requirementMatches = countMatches(text, REQUIREMENT_PATTERNS);

  const totalScore = sectionMatches + keywordMatches + requirementMatches;

  if (totalScore >= MIN_JD_MATCHES) {
    return { valid: true, reason: 'Text contains job description indicators.' };
  }

  return {
    valid: false,
    reason:
      'Text does not appear to be a job description. Missing typical job posting sections like responsibilities, requirements, or qualifications.',
  };
}

export const validateInputs = async (state: ValidateInputsState, config: LangGraphRunnableConfig) => {
  const { resumeText, jobDescriptionText } = state;

  const resumeValidation = isLikelyResume(resumeText);
  const jdValidation = isLikelyJobDescription(jobDescriptionText);

  let validationError: string | null = null;

  if (!resumeValidation.valid && !jdValidation.valid) {
    validationError = `Invalid inputs: Resume - ${resumeValidation.reason} Job Description - ${jdValidation.reason}`;
  } else if (!resumeValidation.valid) {
    validationError = `Invalid resume: ${resumeValidation.reason}`;
  } else if (!jdValidation.valid) {
    validationError = `Invalid job description: ${jdValidation.reason}`;
  }

  if (validationError) {
    config.writer?.({
      event: 'VALIDATION_FAILED',
      data: { message: validationError },
    });
  }

  return { validationError };
};

export const routeAfterValidation = (state: { validationError: string | null }) => {
  if (state.validationError) {
    return 'invalid';
  }
  return ['plotRadarChart', 'assessSkills'];
};
