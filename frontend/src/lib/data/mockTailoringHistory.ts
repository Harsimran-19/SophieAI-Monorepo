export interface TailoringRecord {
  id: string
  jobTitle: string
  company: string
  date: string
  status: "completed" | "in_progress"
  resumeName: string
  matchScore: number | null
  jobDescription: string
  companyDescription?: string // Optional
  requirements: string[]
  generatedFiles: {
    type: "resume" | "cover_letter"
    filename: string
    downloadUrl: string
  }[]
}

export interface MockJobData {
  role: string
  company: string
  jobDescription: string
  companyDescription: string
}

export const mockJobDescriptions: Record<string, MockJobData> = {
  google: {
    role: "Senior Frontend Developer",
    company: "Google",
    jobDescription: `As a Senior Frontend Developer at Google, you will:
• Lead the development of complex web applications using React, TypeScript, and modern web technologies
• Collaborate with UX designers and backend engineers to deliver exceptional user experiences
• Mentor junior developers and contribute to technical architecture decisions
• Drive best practices in code quality, testing, and performance optimization
• Work on projects that impact millions of users globally

Required Skills:
• 5+ years of experience with modern JavaScript/TypeScript and frontend frameworks
• Strong understanding of web performance, accessibility, and responsive design
• Experience with state management, build tools, and testing frameworks
• Excellent problem-solving and communication skills
• Bachelor's degree in Computer Science or related field`,
    companyDescription: `Google's mission is to organize the world's information and make it universally accessible and useful. Through products and platforms like Search, Maps, Gmail, Android, Google Cloud, Chrome and YouTube, Google plays a meaningful role in the daily lives of billions of people and has become one of the most widely-known companies in the world. Google is an American multinational technology company focusing on artificial intelligence, search engine technology, online advertising, cloud computing, computer software, quantum computing, e-commerce, and consumer electronics.`,
  },
  meta: {
    role: "Product Manager",
    company: "Meta",
    jobDescription: `As a Product Manager at Meta, you will:
• Drive product strategy and execution for our social media platforms
• Work with cross-functional teams to define product requirements
• Analyze user data and market trends to inform product decisions
• Lead product launches and measure their impact
• Balance user needs with business objectives

Required Skills:
• 3+ years of product management experience
• Strong analytical and problem-solving abilities
• Experience with data-driven decision making
• Excellent communication and stakeholder management
• Technical background preferred`,
    companyDescription: `Meta (formerly Facebook) builds technologies that help people connect, find communities, and grow businesses. When Facebook launched in 2004, it changed the way people connect. Apps like Messenger, Instagram and WhatsApp further empowered billions around the world. Now, Meta is moving beyond 2D screens toward immersive experiences like augmented and virtual reality to help build the next evolution in social technology.`,
  },
  amazon: {
    role: "Full Stack Developer",
    company: "Amazon",
    jobDescription: `As a Full Stack Developer at Amazon, you will:
• Design and implement scalable web applications using AWS services
• Write high-quality, maintainable code in both frontend and backend
• Participate in code reviews and contribute to technical discussions
• Troubleshoot and debug complex technical issues
• Work in an agile environment with continuous deployment

Required Skills:
• Strong experience with JavaScript/TypeScript and Node.js
• Familiarity with AWS services and cloud architecture
• Experience with microservices and distributed systems
• Strong problem-solving and analytical skills
• Bachelor's degree in Computer Science or equivalent`,
    companyDescription: `Amazon is guided by four principles: customer obsession rather than competitor focus, passion for invention, commitment to operational excellence, and long-term thinking. Amazon is one of the world's leading technology companies, known for e-commerce, cloud computing (AWS), artificial intelligence, and digital streaming. We are driven by the excitement of building technologies, inventing products, and providing services that transform lives and businesses.`,
  },
  netflix: {
    role: "Data Scientist",
    company: "Netflix",
    jobDescription: `As a Data Scientist at Netflix, you will:
• Develop and deploy machine learning models to improve content recommendations
• Analyze user behavior and engagement patterns
• Create data visualizations and dashboards for stakeholders
• Collaborate with product and engineering teams
• Drive data-informed decision making

Required Skills:
• Advanced degree in Statistics, Mathematics, or Computer Science
• Strong programming skills in Python and SQL
• Experience with machine learning and statistical modeling
• Knowledge of A/B testing and causal inference
• Excellent communication skills`,
    companyDescription: `Netflix is the world's leading streaming entertainment service with over 230 million paid memberships in over 190 countries enjoying TV series, films and games across a wide variety of genres and languages. Members can watch as much as they want, anytime, anywhere, on any internet-connected screen. Members can play, pause and resume watching, all without commercials or commitments.`,
  },
}

export const availableResumes = [
  {
    id: "1",
    name: "Software Engineer Resume",
    filename: "Lumi_Xu_resume.pdf",
    lastModified: "2 days ago",
  },
  {
    id: "2",
    name: "Product Manager Resume",
    filename: "Lumi_Xu_PM_resume.pdf",
    lastModified: "1 week ago",
  },
  {
    id: "3",
    name: "Data Scientist Resume",
    filename: "Lumi_Xu_DS_resume.pdf",
    lastModified: "2 weeks ago",
  },
]

export const mockTailoringHistory: TailoringRecord[] = [
  {
    id: "th1",
    jobTitle: "Senior Frontend Developer",
    company: "Google",
    date: "2024-05-28",
    status: "completed",
    resumeName: "Software Engineer Resume",
    matchScore: 95,
    jobDescription: mockJobDescriptions.google.jobDescription,
    companyDescription: mockJobDescriptions.google.companyDescription,
    requirements: [
      "5+ years of experience with modern JavaScript/TypeScript",
      "Strong understanding of web performance and accessibility",
      "Experience with state management and testing frameworks",
      "Excellent problem-solving and communication skills",
      "Bachelor's degree in Computer Science or related field",
    ],
    generatedFiles: [
      {
        type: "resume",
        filename: "Lumi_Xu_Google_SDE_Resume.pdf",
        downloadUrl: "/files/resume_google.pdf",
      },
      {
        type: "cover_letter",
        filename: "Lumi_Xu_Google_SDE_Cover_Letter.pdf",
        downloadUrl: "/files/cover_letter_google.pdf",
      },
    ],
  },
  {
    id: "th2",
    jobTitle: "Product Manager",
    company: "Meta",
    date: "2024-05-25",
    status: "completed",
    resumeName: "Product Manager Resume",
    matchScore: 88,
    jobDescription: mockJobDescriptions.meta.jobDescription,
    companyDescription: mockJobDescriptions.meta.companyDescription,
    requirements: [
      "3+ years of product management experience",
      "Strong analytical and problem-solving abilities",
      "Experience with data-driven decision making",
      "Excellent communication and stakeholder management",
      "Technical background preferred",
    ],
    generatedFiles: [
      {
        type: "resume",
        filename: "Lumi_Xu_Meta_PM_Resume.pdf",
        downloadUrl: "/files/resume_meta.pdf",
      },
    ],
  },
  {
    id: "th3",
    jobTitle: "Full Stack Developer",
    company: "Amazon",
    date: "2024-05-20",
    status: "in_progress",
    resumeName: "Software Engineer Resume",
    matchScore: null,
    jobDescription: mockJobDescriptions.amazon.jobDescription,
    companyDescription: mockJobDescriptions.amazon.companyDescription,
    requirements: [
      "Strong experience with JavaScript/TypeScript and Node.js",
      "Familiarity with AWS services and cloud architecture",
      "Experience with microservices and distributed systems",
      "Strong problem-solving and analytical skills",
      "Bachelor's degree in Computer Science or equivalent",
    ],
    generatedFiles: [],
  },
  {
    id: "th4",
    jobTitle: "Data Scientist",
    company: "Netflix",
    date: "2024-05-15",
    status: "completed",
    resumeName: "Data Scientist Resume",
    matchScore: 72,
    jobDescription: mockJobDescriptions.netflix.jobDescription,
    companyDescription: mockJobDescriptions.netflix.companyDescription,
    requirements: [
      "Advanced degree in Statistics, Mathematics, or Computer Science",
      "Strong programming skills in Python and SQL",
      "Experience with machine learning and statistical modeling",
      "Knowledge of A/B testing and causal inference",
      "Excellent communication skills",
    ],
    generatedFiles: [
      {
        type: "resume",
        filename: "Lumi_Xu_Netflix_DS_Resume.pdf",
        downloadUrl: "/files/resume_netflix.pdf",
      },
      {
        type: "cover_letter",
        filename: "Lumi_Xu_Netflix_DS_Cover_Letter.pdf",
        downloadUrl: "/files/cover_letter_netflix.pdf",
      },
    ],
  },
]
