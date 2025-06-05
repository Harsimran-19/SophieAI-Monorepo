export const BASE_API_URL =
  "https://sophie-backend-671377043906.us-central1.run.app"
// export const BASE_API_URL='http://localhost:8080';

export const API_ROUTES = {
  // Resume Analysis
  ANALYZE_RESUME: "/analyze-resume",

  // Resume Builder
  EXTRACT_PDF_TEXT: "/extract-pdf-text",
  PARSE_RESUME: "/resume-builder-parser",
  SECTION_ANALYSIS: "/section-analysis",
  DESCRIPTION_ANALYSIS: "/builder-description-analysis",

  // Job Matching
  MATCH_RESUME_JOB: "/match-resume-job",

  // System
  HEALTH_CHECK: "/health",

  // Generation
  GENERATE_COVER_LETTER: "/generate-cover-letter",

  // Optimization
  OPTIMIZE_RESUME: "/optimize-resume",

  // Download as PDF
  DOWNLOAD_RESUME_PDF: "/convert/resume-to-pdf",
}

export const getApiUrl = (route: keyof typeof API_ROUTES) =>
  `${BASE_API_URL}${API_ROUTES[route]}`
