export type CourseCategoryTag =
  // Core categories
  | 'foundational' // represents the foundational in one of the course categories
  | 'advanced' // represents the advanced in one of the course categories
  | 'specialized' // represents the specialized in one of the course categories

  // High-level domains
  | 'stem'
  | 'mathematics'
  | 'humanities'
  | 'business'
  | 'arts'
  | 'social-sciences'

  // Science categories
  | 'physical-sciences'
  | 'life-sciences'
  | 'earth-sciences'
  | 'formal-sciences'

  // Technology categories
  | 'computer-science'
  | 'information-technology'
  | 'software-development'
  | 'data-technology'
  | 'cybersecurity'
  | 'cloud-computing'

  // Engineering categories
  | 'engineering-core'
  | 'electrical'
  | 'mechanical'
  | 'chemical'
  | 'civil'
  | 'industrial'
  | 'environmental'
  | 'biomedical'

  // Development categories
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'mobile'
  | 'desktop'
  | 'embedded'
  | 'gaming'

  // Data & AI categories
  | 'artificial-intelligence'
  | 'machine-learning'
  | 'data-science'
  | 'data-engineering'
  | 'analytics'

  // Infrastructure categories
  | 'devops'
  | 'cloud'
  | 'networking'
  | 'security'
  | 'quality-assurance'

  // Business categories
  | 'management'
  | 'finance'
  | 'economics'
  | 'marketing'
  | 'entrepreneurship'

  // Design categories
  | 'user-experience'
  | 'user-interface'
  | 'graphic-design'
  | 'industrial-design'

  // Framework categories
  | 'framework-frontend'
  | 'framework-backend'
  | 'framework-mobile'
  | 'framework-desktop'

  // Database categories
  | 'database-relational'
  | 'database-nosql'
  | 'database-graph'
  | 'database-timeseries'
  | 'database-inmemory'

  // Cloud categories
  | 'cloud-provider'
  | 'cloud-service'
  | 'cloud-native'

  // Tool categories
  | 'tool-containerization'
  | 'tool-orchestration'
  | 'tool-version-control'
  | 'tool-ci-cd'
  | 'tool-infrastructure'

  // Language categories
  | 'programming-language'
  | 'markup-language'
  | 'query-language'
  | 'scripting-language';

// Define topic structure
export interface Course {
  id: string;
  title: string;
  description: string;
  tags: CourseCategoryTag[];
  prerequisites?: string[]; // IDs of prerequisite topics
  estimatedHours?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

// Create the courses by category
// Mathematics courses
const mathematicsCourses: Course[] = [
  {
    id: 'basic-arithmetic',
    title: 'Basic Arithmetic',
    description: 'Operations, fractions, decimals, percentages and basic mathematical operations',
    tags: ['foundational', 'stem', 'mathematics'],
    difficulty: 'beginner',
  },
  {
    id: 'pre-algebra',
    title: 'Pre-Algebra',
    description: 'Variables, equations, inequalities and introduction to algebraic concepts',
    tags: ['foundational', 'stem', 'mathematics'],
    prerequisites: ['basic-arithmetic'],
    difficulty: 'beginner',
  },
  {
    id: 'algebra-1',
    title: 'Algebra I',
    description: 'Linear equations, systems, polynomials, factoring',
    tags: ['foundational', 'stem', 'mathematics'],
    prerequisites: ['pre-algebra'],
    difficulty: 'beginner',
  },
  {
    id: 'algebra-2',
    title: 'Algebra II',
    description: 'Functions, logarithms, exponentials, conics, sequences and series',
    tags: ['foundational', 'stem', 'mathematics'],
    prerequisites: ['algebra-1'],
    difficulty: 'intermediate',
  },
  {
    id: 'geometry',
    title: 'Geometry',
    description: 'Euclidean geometry, proofs, area, volume, coordinate geometry',
    tags: ['foundational', 'stem', 'mathematics'],
    prerequisites: ['algebra-1'],
    difficulty: 'intermediate',
  },
  {
    id: 'trigonometry',
    title: 'Trigonometry',
    description: 'Unit circle, identities, graphs, laws of sines and cosines',
    tags: ['foundational', 'stem', 'mathematics'],
    prerequisites: ['algebra-2', 'geometry'],
    difficulty: 'intermediate',
  },
  {
    id: 'precalculus',
    title: 'Precalculus',
    description: 'Advanced functions, introduction to limits',
    tags: ['foundational', 'stem', 'mathematics'],
    prerequisites: ['algebra-2', 'trigonometry'],
    difficulty: 'intermediate',
  },
  {
    id: 'calculus-1',
    title: 'Calculus I',
    description: 'Limits, derivatives, applications of derivatives',
    tags: ['foundational', 'stem', 'mathematics'],
    prerequisites: ['precalculus'],
    difficulty: 'intermediate',
  },
  {
    id: 'calculus-2',
    title: 'Calculus II',
    description: 'Integrals, techniques of integration, applications of integrals, sequences and series',
    tags: ['foundational', 'stem', 'mathematics'],
    prerequisites: ['calculus-1'],
    difficulty: 'advanced',
  },
  {
    id: 'calculus-3',
    title: 'Calculus III',
    description: 'Multivariable functions, partial derivatives, multiple integrals, vector calculus',
    tags: ['foundational', 'stem', 'mathematics'],
    prerequisites: ['calculus-2'],
    difficulty: 'advanced',
  },
  {
    id: 'linear-algebra',
    title: 'Linear Algebra',
    description: 'Vectors, matrices, systems of linear equations, determinants, eigenvalues/eigenvectors, vector spaces',
    tags: ['foundational', 'stem', 'mathematics', 'software-development', 'data-science'],
    prerequisites: ['calculus-1'],
    difficulty: 'intermediate',
  },
  {
    id: 'differential-equations',
    title: 'Differential Equations',
    description: 'First order, second order, linear systems, Laplace transforms',
    tags: ['foundational', 'physical-sciences', 'engineering-core', 'mathematics'],
    prerequisites: ['calculus-2', 'linear-algebra'],
    difficulty: 'advanced',
  },
  {
    id: 'probability-theory',
    title: 'Probability Theory',
    description: 'Basic concepts, conditional probability, Bayes theorem, random variables, distributions',
    tags: ['foundational', 'stem', 'mathematics', 'data-science'],
    prerequisites: ['calculus-1'],
    difficulty: 'intermediate',
  },
  {
    id: 'statistics',
    title: 'Statistics',
    description: 'Descriptive statistics, inferential statistics, hypothesis testing, regression analysis',
    tags: ['foundational', 'stem', 'mathematics', 'data-science', 'analytics'],
    prerequisites: ['probability-theory'],
    difficulty: 'intermediate',
  },
  {
    id: 'discrete-mathematics',
    title: 'Discrete Mathematics',
    description: 'Set theory, logic, combinatorics, graph theory, Boolean algebra',
    tags: ['foundational', 'software-development', 'computer-science', 'mathematics'],
    prerequisites: ['algebra-2'],
    difficulty: 'intermediate',
  },
];

// Computer Science core courses
const computerScienceCourses: Course[] = [
  {
    id: 'intro-to-programming',
    title: 'Introduction to Programming',
    description: 'Programming logic, variables, control flow, functions, input/output operations',
    tags: ['foundational', 'software-development', 'computer-science'],
    difficulty: 'beginner',
  },
  {
    id: 'data-structures',
    title: 'Data Structures',
    description: 'Arrays, linked lists, stacks, queues, trees, graphs, hash tables, heaps',
    tags: ['foundational', 'software-development', 'computer-science'],
    prerequisites: ['intro-to-programming', 'discrete-mathematics'],
    difficulty: 'intermediate',
  },
  {
    id: 'algorithms',
    title: 'Algorithms',
    description: 'Algorithm analysis, searching, sorting, recursion, graph algorithms',
    tags: ['foundational', 'software-development', 'computer-science'],
    prerequisites: ['data-structures'],
    difficulty: 'intermediate',
  },
  {
    id: 'oop-concepts',
    title: 'Object-Oriented Programming',
    description: 'Classes, objects, encapsulation, inheritance, polymorphism, abstraction',
    tags: ['foundational', 'software-development', 'computer-science'],
    prerequisites: ['intro-to-programming'],
    difficulty: 'intermediate',
  },
  {
    id: 'operating-systems',
    title: 'Operating Systems',
    description: 'Process management, memory management, file systems, concurrency, deadlock',
    tags: ['foundational', 'information-technology', 'computer-science', 'software-development'],
    prerequisites: ['data-structures'],
    difficulty: 'intermediate',
  },
  {
    id: 'computer-networks',
    title: 'Computer Networks',
    description: 'Network models, IP addressing, protocols, network devices',
    tags: ['foundational', 'information-technology', 'computer-science', 'networking'],
    prerequisites: ['intro-to-programming'],
    difficulty: 'intermediate',
  },
  {
    id: 'database-fundamentals',
    title: 'Database Fundamentals',
    description: 'Relational model, SQL basics, database normalization, NoSQL concepts',
    tags: ['foundational', 'software-development', 'database-relational', 'database-nosql', 'computer-science'],
    prerequisites: ['intro-to-programming'],
    difficulty: 'intermediate',
  },
];

// Web Development courses
const webDevelopmentCourses: Course[] = [
  {
    id: 'html-css',
    title: 'HTML & CSS',
    description: 'HTML5 elements, CSS selectors, box model, layout, responsive design',
    tags: ['foundational', 'frontend', 'software-development'],
    difficulty: 'beginner',
  },
  {
    id: 'javascript-fundamentals',
    title: 'JavaScript Fundamentals',
    description: 'JavaScript syntax, data types, functions, DOM manipulation, asynchronous JS',
    tags: ['foundational', 'frontend', 'software-development'],
    prerequisites: ['html-css'],
    difficulty: 'beginner',
  },
  {
    id: 'typescript',
    title: 'TypeScript',
    description: 'TypeScript types, interfaces, classes, generics, and advanced features',
    tags: ['software-development', 'frontend', 'programming-language'],
    prerequisites: ['javascript-fundamentals'],
    difficulty: 'intermediate',
  },
  {
    id: 'react',
    title: 'React',
    description: 'Components, hooks, state management, routing, and React ecosystem',
    tags: ['software-development', 'frontend', 'framework-frontend'],
    prerequisites: ['javascript-fundamentals'],
    difficulty: 'intermediate',
  },
  {
    id: 'angular',
    title: 'Angular',
    description: 'Components, services, RxJS, routing, state management with NgRx',
    tags: ['software-development', 'frontend', 'framework-frontend'],
    prerequisites: ['typescript'],
    difficulty: 'intermediate',
  },
  {
    id: 'vue',
    title: 'Vue.js',
    description: 'Components, composition API, state management, routing',
    tags: ['software-development', 'frontend', 'framework-frontend'],
    prerequisites: ['javascript-fundamentals'],
    difficulty: 'intermediate',
  },
  {
    id: 'svelte',
    title: 'Svelte & SvelteKit',
    description: 'Components, reactivity, stores, SvelteKit for applications',
    tags: ['software-development', 'frontend', 'framework-frontend'],
    prerequisites: ['javascript-fundamentals'],
    difficulty: 'intermediate',
  },
  {
    id: 'nextjs',
    title: 'Next.js',
    description: 'React framework with SSR, SSG, file-based routing, API routes',
    tags: ['software-development', 'frontend', 'fullstack', 'framework-frontend'],
    prerequisites: ['react'],
    difficulty: 'intermediate',
  },
  {
    id: 'nodejs',
    title: 'Node.js',
    description: 'JavaScript runtime, modules, file system, streams, event loop',
    tags: ['foundational', 'backend', 'software-development'],
    prerequisites: ['javascript-fundamentals'],
    difficulty: 'intermediate',
  },
  {
    id: 'express',
    title: 'Express.js',
    description: 'Node.js web framework, routing, middleware, error handling',
    tags: ['software-development', 'backend', 'framework-backend'],
    prerequisites: ['nodejs'],
    difficulty: 'intermediate',
  },
  {
    id: 'python-web',
    title: 'Python Web Development',
    description: 'Web development with Python, focusing on Django or Flask',
    tags: ['software-development', 'backend', 'framework-backend'],
    prerequisites: ['python-basics'],
    difficulty: 'intermediate',
  },
  {
    id: 'sql-databases',
    title: 'SQL Databases',
    description: 'Advanced SQL, database design, indexing, transactions with PostgreSQL, MySQL',
    tags: ['foundational', 'backend', 'software-development', 'database-relational'],
    prerequisites: ['database-fundamentals'],
    difficulty: 'intermediate',
  },
  {
    id: 'nosql-databases',
    title: 'NoSQL Databases',
    description: 'MongoDB, Redis, data modeling in NoSQL environments',
    tags: ['software-development', 'backend', 'database-nosql'],
    prerequisites: ['database-fundamentals'],
    difficulty: 'intermediate',
  },
  {
    id: 'api-design',
    title: 'API Design',
    description: 'RESTful APIs, GraphQL, gRPC, best practices, documentation',
    tags: ['foundational', 'backend', 'software-development'],
    prerequisites: ['express'],
    difficulty: 'intermediate',
  },
  {
    id: 'web-security',
    title: 'Web Security',
    description: 'OWASP Top 10, authentication, authorization, secure coding practices',
    tags: ['foundational', 'software-development', 'security'],
    prerequisites: ['html-css', 'javascript-fundamentals', 'database-fundamentals'],
    difficulty: 'intermediate',
  },
];

// Mobile Development courses
const mobileDevelopmentCourses: Course[] = [
  {
    id: 'ios-development',
    title: 'iOS Development',
    description: 'Swift, UIKit, SwiftUI, iOS app architecture and development',
    tags: ['mobile', 'software-development', 'framework-mobile'],
    difficulty: 'intermediate',
  },
  {
    id: 'android-development',
    title: 'Android Development',
    description: 'Kotlin, Android SDK, Jetpack Compose, Android app architecture',
    tags: ['mobile', 'software-development', 'framework-mobile'],
    difficulty: 'intermediate',
  },
  {
    id: 'react-native',
    title: 'React Native',
    description: 'Cross-platform mobile development with React Native',
    tags: ['mobile', 'software-development', 'framework-mobile'],
    prerequisites: ['react'],
    difficulty: 'intermediate',
  },
  {
    id: 'flutter',
    title: 'Flutter',
    description: 'Cross-platform development with Flutter and Dart',
    tags: ['mobile', 'software-development', 'framework-mobile'],
    difficulty: 'intermediate',
  },
];

// DevOps & Cloud courses
const devOpsCourses: Course[] = [
  {
    id: 'git-version-control',
    title: 'Git & Version Control',
    description: 'Git basics, branching strategies, workflow management',
    tags: ['foundational', 'software-development', 'devops', 'tool-version-control'],
    difficulty: 'beginner',
  },
  {
    id: 'docker',
    title: 'Docker & Containerization',
    description: 'Container concepts, Dockerfile, Docker Compose, container orchestration',
    tags: ['devops', 'cloud', 'tool-containerization'],
    difficulty: 'intermediate',
  },
  {
    id: 'kubernetes',
    title: 'Kubernetes',
    description: 'Container orchestration, pods, services, deployments, scaling',
    tags: ['advanced', 'specialized', 'devops', 'cloud', 'tool-orchestration'],
    prerequisites: ['docker'],
    difficulty: 'advanced',
  },
  {
    id: 'ci-cd',
    title: 'CI/CD Pipelines',
    description: 'Continuous integration, continuous delivery, automation tools',
    tags: ['devops', 'software-development'],
    prerequisites: ['git-version-control'],
    difficulty: 'intermediate',
  },
];

// Cloud Provider courses
const cloudCourses: Course[] = [
  {
    id: 'aws-essentials',
    title: 'AWS Essentials',
    description: 'Core AWS services: EC2, S3, RDS, Lambda, IAM',
    tags: ['cloud', 'cloud-provider'],
    difficulty: 'intermediate',
  },
  {
    id: 'azure-essentials',
    title: 'Azure Essentials',
    description: 'Core Azure services: VMs, Storage, SQL Database, Functions, Azure AD',
    tags: ['cloud', 'cloud-service'],
    difficulty: 'intermediate',
  },
  {
    id: 'gcp-essentials',
    title: 'GCP Essentials',
    description: 'Core Google Cloud services: Compute Engine, Storage, Cloud SQL, Cloud Functions',
    tags: ['cloud', 'cloud-native'],
    difficulty: 'intermediate',
  },
  {
    id: 'infrastructure-as-code',
    title: 'Infrastructure as Code',
    description: 'Terraform, CloudFormation, automated infrastructure provisioning',
    tags: ['devops', 'cloud', 'tool-infrastructure'],
    prerequisites: ['aws-essentials', 'azure-essentials', 'gcp-essentials'],
    difficulty: 'advanced',
  },
];

// Data Science & AI/ML courses
const dataScienceCourses: Course[] = [
  {
    id: 'python-data-science',
    title: 'Python for Data Science',
    description: 'Python libraries for data science: NumPy, Pandas, Matplotlib',
    tags: ['foundational', 'data-science', 'programming-language'],
    prerequisites: ['python-basics'],
    difficulty: 'intermediate',
  },
  {
    id: 'machine-learning-fundamentals',
    title: 'Machine Learning Fundamentals',
    description: 'Supervised/unsupervised learning, model evaluation, feature engineering',
    tags: ['foundational', 'data-science', 'artificial-intelligence', 'machine-learning'],
    prerequisites: ['python-data-science', 'statistics', 'linear-algebra'],
    difficulty: 'intermediate',
  },
  {
    id: 'deep-learning',
    title: 'Deep Learning',
    description: 'Neural networks, CNN, RNN, transformers, using TensorFlow or PyTorch',
    tags: ['advanced', 'artificial-intelligence', 'machine-learning', 'data-science'],
    prerequisites: ['machine-learning-fundamentals'],
    difficulty: 'advanced',
  },
  {
    id: 'nlp',
    title: 'Natural Language Processing',
    description: 'Text preprocessing, embeddings, sentiment analysis, topic modeling, large language models',
    tags: ['advanced', 'specialized', 'artificial-intelligence', 'machine-learning', 'data-science'],
    prerequisites: ['deep-learning'],
    difficulty: 'advanced',
  },
  {
    id: 'computer-vision',
    title: 'Computer Vision',
    description: 'Image classification, object detection, image segmentation, GANs',
    tags: ['advanced', 'specialized', 'artificial-intelligence', 'machine-learning', 'data-science'],
    prerequisites: ['deep-learning'],
    difficulty: 'advanced',
  },
  {
    id: 'data-engineering',
    title: 'Data Engineering',
    description: 'ETL/ELT, data pipelines, data warehousing, big data technologies',
    tags: ['advanced', 'data-engineering', 'data-science'],
    prerequisites: ['python-data-science', 'sql-databases'],
    difficulty: 'advanced',
  },
];

// Physics courses
const physicsCourses: Course[] = [
  {
    id: 'classical-mechanics',
    title: 'Classical Mechanics',
    description: 'Kinematics, Newton\'s laws, energy, momentum, rotational motion, oscillations.',
    tags: ['foundational', 'physical-sciences', 'engineering-core'],
    prerequisites: ['calculus-1'],
    difficulty: 'intermediate',
  },
  {
    id: 'electromagnetism',
    title: 'Electromagnetism',
    description: 'Electric fields, magnetic fields, circuits, Maxwell\'s equations, electromagnetic waves.',
    tags: ['foundational', 'physical-sciences', 'electrical'],
    prerequisites: ['classical-mechanics', 'calculus-3'],
    difficulty: 'advanced',
  },
  {
    id: 'thermodynamics-statistical-mechanics',
    title: 'Thermodynamics & Statistical Mechanics',
    description: 'Laws of thermodynamics, heat transfer, kinetic theory, statistical ensembles.',
    tags: ['foundational', 'physical-sciences', 'mechanical', 'chemical'],
    prerequisites: ['classical-mechanics', 'calculus-2'],
    difficulty: 'advanced',
  },
  {
    id: 'quantum-mechanics-1',
    title: 'Quantum Mechanics I',
    description: 'Foundations of quantum theory, Schrödinger equation, simple potentials, hydrogen atom.',
    tags: ['foundational', 'physical-sciences', 'mathematics'],
    prerequisites: ['electromagnetism', 'differential-equations', 'linear-algebra'],
    difficulty: 'advanced',
  },
  {
    id: 'optics',
    title: 'Optics',
    description: 'Geometric optics, wave optics, interference, diffraction, polarization.',
    tags: ['physical-sciences'],
    prerequisites: ['electromagnetism'],
    difficulty: 'advanced',
  },
];

// Chemistry courses
const chemistryCourses: Course[] = [
  {
    id: 'general-chemistry-1',
    title: 'General Chemistry I',
    description: 'Matter, measurement, atoms, molecules, stoichiometry, reactions, thermochemistry, atomic structure, periodicity.',
    tags: ['foundational', 'physical-sciences', 'stem'],
    prerequisites: ['algebra-1'],
    difficulty: 'beginner',
  },
  {
    id: 'general-chemistry-2',
    title: 'General Chemistry II',
    description: 'Bonding theories, intermolecular forces, liquids/solids, solutions, kinetics, equilibrium, acids/bases, thermodynamics.',
    tags: ['foundational', 'physical-sciences', 'stem'],
    prerequisites: ['general-chemistry-1'],
    difficulty: 'intermediate',
  },
  {
    id: 'organic-chemistry-1',
    title: 'Organic Chemistry I',
    description: 'Nomenclature, structure, bonding, alkanes, alkenes, alkynes, stereochemistry, substitution/elimination reactions.',
    tags: ['foundational', 'life-sciences', 'physical-sciences'],
    prerequisites: ['general-chemistry-2'],
    difficulty: 'intermediate',
  },
  {
    id: 'organic-chemistry-2',
    title: 'Organic Chemistry II',
    description: 'Spectroscopy (NMR, IR, Mass Spec), alcohols, ethers, aldehydes, ketones, carboxylic acids, amines, aromatic compounds.',
    tags: ['advanced', 'physical-sciences'],
    prerequisites: ['organic-chemistry-1'],
    difficulty: 'advanced',
  },
  {
    id: 'physical-chemistry-thermo-kinetics',
    title: 'Physical Chemistry: Thermodynamics & Kinetics',
    description: 'Chemical thermodynamics, phase equilibria, chemical kinetics, reaction mechanisms.',
    tags: ['advanced', 'physical-sciences'],
    prerequisites: ['general-chemistry-2', 'calculus-3', 'thermodynamics-statistical-mechanics'],
    difficulty: 'advanced',
  },
  {
    id: 'physical-chemistry-quantum-spectroscopy',
    title: 'Physical Chemistry: Quantum & Spectroscopy',
    description: 'Quantum chemistry, atomic and molecular structure, spectroscopy.',
    tags: ['advanced', 'specialized', 'physical-sciences'],
    prerequisites: ['general-chemistry-2', 'calculus-3', 'quantum-mechanics-1'],
    difficulty: 'expert',
  },
  {
    id: 'biochemistry',
    title: 'Biochemistry',
    description: 'Structure and function of biomolecules, metabolic pathways, enzyme kinetics.',
    tags: ['advanced', 'physical-sciences', 'life-sciences'],
    prerequisites: ['organic-chemistry-2', 'cell-biology'],
    difficulty: 'advanced',
  },
];

// Biology courses
const biologyCourses: Course[] = [
  {
    id: 'intro-biology',
    title: 'Introduction to Biology',
    description: 'Fundamental concepts of life, scientific method, basic chemistry of life, cell structure and function overview.',
    tags: ['foundational', 'life-sciences', 'stem'],
    difficulty: 'beginner',
  },
  {
    id: 'cell-biology',
    title: 'Cell Biology',
    description: 'Detailed study of eukaryotic and prokaryotic cells, organelles, membrane transport, cell cycle, cellular respiration, photosynthesis.',
    tags: ['foundational', 'life-sciences'],
    prerequisites: ['intro-biology', 'general-chemistry-1'],
    difficulty: 'intermediate',
  },
  {
    id: 'molecular-biology',
    title: 'Molecular Biology',
    description: 'DNA structure/replication, transcription, translation, gene regulation, biotechnology techniques.',
    tags: ['life-sciences'],
    prerequisites: ['cell-biology', 'general-chemistry-2'],
    difficulty: 'intermediate',
  },
  {
    id: 'genetics',
    title: 'Genetics',
    description: 'Mendelian genetics, chromosomal inheritance, molecular genetics, population genetics.',
    tags: ['foundational', 'life-sciences'],
    prerequisites: ['cell-biology'],
    difficulty: 'intermediate',
  },
  {
    id: 'evolutionary-biology',
    title: 'Evolutionary Biology',
    description: 'Mechanisms of evolution, natural selection, speciation, phylogenetics, history of life.',
    tags: ['life-sciences'],
    prerequisites: ['genetics', 'intro-biology'],
    difficulty: 'intermediate',
  },
  {
    id: 'ecology',
    title: 'Ecology',
    description: 'Interactions between organisms and their environment; population, community, and ecosystem ecology.',
    tags: ['life-sciences', 'environmental'],
    prerequisites: ['intro-biology', 'statistics'],
    difficulty: 'intermediate',
  },
  {
    id: 'anatomy-physiology',
    title: 'Human Anatomy & Physiology',
    description: 'Structure and function of human organ systems.',
    tags: ['life-sciences', 'biomedical'],
    prerequisites: ['intro-biology'],
    difficulty: 'intermediate',
  },
  {
    id: 'microbiology',
    title: 'Microbiology',
    description: 'Study of microorganisms including bacteria, viruses, fungi, and protists; microbial genetics and metabolism.',
    tags: ['life-sciences'],
    prerequisites: ['cell-biology', 'genetics'],
    difficulty: 'advanced',
  },
];

// Electrical Engineering courses
const electricalEngineeringCourses: Course[] = [
  {
    id: 'circuit-theory',
    title: 'Circuit Theory',
    description: 'DC/AC circuit analysis, network theorems, resonance, filters, transient analysis.',
    tags: ['foundational', 'electrical'],
    prerequisites: ['calculus-2', 'differential-equations', 'physics'],
    difficulty: 'intermediate',
  },
  {
    id: 'digital-logic-design',
    title: 'Digital Logic Design',
    description: 'Boolean algebra, logic gates, combinational and sequential circuit design, FPGAs introduction.',
    tags: ['foundational', 'electrical', 'computer-science'],
    prerequisites: ['discrete-mathematics'],
    difficulty: 'intermediate',
  },
  {
    id: 'electronics-1',
    title: 'Electronics I',
    description: 'Semiconductor physics, diodes, BJTs, MOSFETs characteristics and basic amplifier circuits.',
    tags: ['foundational', 'electrical'],
    prerequisites: ['circuit-theory'],
    difficulty: 'intermediate',
  },
  {
    id: 'electronics-2',
    title: 'Electronics II',
    description: 'Amplifier design, operational amplifiers, frequency response, feedback, oscillators.',
    tags: ['electrical'],
    prerequisites: ['electronics-1'],
    difficulty: 'advanced',
  },
  {
    id: 'signals-systems',
    title: 'Signals and Systems',
    description: 'Continuous and discrete-time signals, system properties, Fourier, Laplace, and Z-transforms.',
    tags: ['foundational', 'electrical'],
    prerequisites: ['circuit-theory', 'differential-equations', 'linear-algebra'],
    difficulty: 'advanced',
  },
  {
    id: 'control-systems',
    title: 'Control Systems',
    description: 'System modeling, time/frequency domain analysis, stability, controller design (PID).',
    tags: ['electrical', 'mechanical', 'industrial', 'chemical'],
    prerequisites: ['signals-systems'],
    difficulty: 'advanced',
  },
];

// Mechanical Engineering courses
const mechanicalEngineeringCourses: Course[] = [
  {
    id: 'engineering-statics',
    title: 'Engineering Statics',
    description: 'Equilibrium of particles and rigid bodies, trusses, frames, centroids, moments of inertia.',
    tags: ['foundational', 'mechanical', 'civil', 'engineering-core'],
    prerequisites: ['calculus-1', 'classical-mechanics'],
    difficulty: 'intermediate',
  },
  {
    id: 'engineering-dynamics',
    title: 'Engineering Dynamics',
    description: 'Kinematics and kinetics of particles and rigid bodies, work-energy, impulse-momentum.',
    tags: ['foundational', 'mechanical', 'civil', 'engineering-core'],
    prerequisites: ['engineering-statics', 'calculus-2', 'differential-equations'],
    difficulty: 'intermediate',
  },
  {
    id: 'mechanics-of-materials',
    title: 'Mechanics of Materials',
    description: 'Stress, strain, torsion, bending, shear, deflection, buckling, combined loadings.',
    tags: ['foundational', 'mechanical', 'civil', 'engineering-core'],
    prerequisites: ['engineering-statics'],
    difficulty: 'intermediate',
  },
  {
    id: 'fluid-mechanics',
    title: 'Fluid Mechanics',
    description: 'Fluid properties, statics, kinematics, Bernoulli equation, dimensional analysis, pipe flow, boundary layers.',
    tags: ['foundational', 'mechanical', 'civil', 'chemical', 'engineering-core'],
    prerequisites: ['engineering-dynamics', 'calculus-3', 'differential-equations'],
    difficulty: 'advanced',
  },
  {
    id: 'heat-transfer',
    title: 'Heat Transfer',
    description: 'Conduction, convection, radiation, heat exchangers design and analysis.',
    tags: ['mechanical', 'chemical', 'engineering-core'],
    prerequisites: ['fluid-mechanics', 'thermodynamics-statistical-mechanics'],
    difficulty: 'advanced',
  },
  {
    id: 'materials-science-engineering',
    title: 'Materials Science & Engineering',
    description: 'Atomic structure, crystal structures, defects, phase diagrams, mechanical properties, material processing and selection.',
    tags: ['foundational', 'engineering-core', 'mechanical', 'civil', 'biomedical'],
    prerequisites: ['general-chemistry-1', 'engineering-statics'],
    difficulty: 'intermediate',
  },
  {
    id: 'machine-design',
    title: 'Machine Design',
    description: 'Design of machine elements (gears, bearings, shafts, fasteners), failure theories, fatigue analysis.',
    tags: ['mechanical', 'engineering-core'],
    prerequisites: ['mechanics-of-materials', 'engineering-dynamics'],
    difficulty: 'advanced',
  },
];

// Civil Engineering courses
const civilEngineeringCourses: Course[] = [
  {
    id: 'structural-analysis',
    title: 'Structural Analysis',
    description: 'Analysis of determinate and indeterminate structures (trusses, beams, frames), influence lines, deflection methods.',
    tags: ['foundational', 'civil', 'engineering-core'],
    prerequisites: ['mechanics-of-materials'],
    difficulty: 'advanced',
  },
  {
    id: 'reinforced-concrete-design',
    title: 'Reinforced Concrete Design',
    description: 'Design of concrete beams, slabs, columns, and footings according to building codes.',
    tags: ['advanced', 'civil', 'engineering-core'],
    prerequisites: ['structural-analysis'],
    difficulty: 'advanced',
  },
  {
    id: 'steel-design',
    title: 'Steel Design',
    description: 'Design of steel members (tension, compression, beams) and connections according to specifications.',
    tags: ['advanced', 'civil', 'engineering-core'],
    prerequisites: ['structural-analysis'],
    difficulty: 'advanced',
  },
  {
    id: 'geotechnical-engineering',
    title: 'Geotechnical Engineering',
    description: 'Soil properties, classification, compaction, seepage, effective stress, consolidation, shear strength, foundation basics.',
    tags: ['foundational', 'civil', 'engineering-core'],
    prerequisites: ['mechanics-of-materials', 'fluid-mechanics'],
    difficulty: 'advanced',
  },
  {
    id: 'transportation-engineering',
    title: 'Transportation Engineering',
    description: 'Traffic flow theory, highway capacity, geometric design of highways, pavement design fundamentals.',
    tags: ['civil', 'engineering-core'],
    prerequisites: ['statistics', 'calculus-1'],
    difficulty: 'intermediate',
  },
  {
    id: 'environmental-engineering-fundamentals',
    title: 'Environmental Engineering Fundamentals',
    description: 'Water quality, water/wastewater treatment processes, air pollution sources and control basics, solid waste management.',
    tags: ['civil', 'environmental', 'chemical', 'engineering-core'],
    prerequisites: ['general-chemistry-1', 'fluid-mechanics', 'calculus-2'],
    difficulty: 'intermediate',
  },
  {
    id: 'hydrology-hydraulics',
    title: 'Hydrology and Hydraulics',
    description: 'Hydrologic cycle, precipitation analysis, runoff estimation, open channel flow principles, hydraulic structures.',
    tags: ['civil', 'environmental', 'engineering-core'],
    prerequisites: ['fluid-mechanics'],
    difficulty: 'advanced',
  },
];

// Chemical Engineering courses
const chemicalEngineeringCourses: Course[] = [
  {
    id: 'chemical-process-principles',
    title: 'Chemical Process Principles',
    description: 'Material balances, energy balances on chemical processes, properties of fluids.',
    tags: ['foundational', 'chemical', 'engineering-core'],
    prerequisites: ['general-chemistry-1', 'calculus-1'],
    difficulty: 'intermediate',
  },
  {
    id: 'chemical-engineering-thermodynamics',
    title: 'Chemical Engineering Thermodynamics',
    description: 'Laws of thermodynamics applied to chemical systems, phase equilibria, chemical reaction equilibria.',
    tags: ['foundational', 'chemical', 'engineering-core'],
    prerequisites: ['chemical-process-principles', 'calculus-3', 'thermodynamics-statistical-mechanics'],
    difficulty: 'advanced',
  },
  {
    id: 'chemical-reaction-engineering',
    title: 'Chemical Reaction Engineering',
    description: 'Chemical kinetics, design and analysis of chemical reactors (Batch, CSTR, PFR).',
    tags: ['chemical', 'engineering-core'],
    prerequisites: ['chemical-engineering-thermodynamics', 'differential-equations'],
    difficulty: 'advanced',
  },
  {
    id: 'transport-phenomena',
    title: 'Transport Phenomena (Mass, Heat, Momentum)',
    description: 'Unified study of momentum, heat, and mass transfer in chemical processes.',
    tags: ['advanced', 'specialized', 'chemical', 'engineering-core'],
    prerequisites: ['fluid-mechanics', 'heat-transfer', 'differential-equations'],
    difficulty: 'expert',
  },
  {
    id: 'separation-processes',
    title: 'Separation Processes',
    description: 'Design and analysis of separation techniques like distillation, absorption, extraction, membrane separation.',
    tags: ['advanced', 'specialized', 'chemical', 'engineering-core'],
    prerequisites: ['chemical-engineering-thermodynamics', 'transport-phenomena'],
    difficulty: 'expert',
  },
];

// Programming language courses
const programmingLanguageCourses: Course[] = [
  {
    id: 'python',
    title: 'Python',
    description: 'Python syntax, data structures, control flow, functions, modules',
    tags: ['programming-language', 'software-development'],
    prerequisites: ['intro-to-programming'],
    difficulty: 'beginner',
  },
  {
    id: 'java',
    title: 'Java',
    description: 'Java syntax, OOP in Java, collections, exception handling',
    tags: ['programming-language', 'software-development'],
    prerequisites: ['intro-to-programming'],
    difficulty: 'beginner',
  },
  {
    id: 'csharp',
    title: 'C#',
    description: 'C# syntax, .NET framework, LINQ, async programming',
    tags: ['programming-language', 'software-development'],
    prerequisites: ['intro-to-programming'],
    difficulty: 'beginner',
  },
  {
    id: 'javascript',
    title: 'JavaScript',
    description: 'JavaScript syntax, data types, functions, DOM manipulation, asynchronous JS',
    tags: ['programming-language', 'software-development'],
    prerequisites: ['intro-to-programming'],
    difficulty: 'beginner',
  },
  {
    id: 'c',
    title: 'C',
    description: 'C programming language basics, syntax, data types, functions, pointers, arrays, strings, structures, and file handling.',
    tags: ['programming-language', 'software-development'],
    prerequisites: ['intro-to-programming'],
    difficulty: 'beginner',
  },
  {
    id: 'c++',
    title: 'C++',
    description: 'C++ programming language basics, syntax, data types, functions, pointers, arrays, strings, structures, and file handling.',
    tags: ['programming-language', 'software-development'],
    prerequisites: ['c'],
    difficulty: 'beginner',
  },
  {
    id: 'go',
    title: 'Go',
    description: 'Go programming language basics, syntax, data types, functions, pointers, arrays, strings, structures, and file handling.',
    tags: ['programming-language', 'software-development'],
    prerequisites: ['intro-to-programming'],
    difficulty: 'beginner',
  },
  {
    id: 'rust',
    title: 'Rust',
    description: 'Rust programming language basics, syntax, data types, functions, pointers, arrays, strings, structures, and file handling.',
    tags: ['programming-language', 'software-development'],
    prerequisites: ['intro-to-programming'],
    difficulty: 'beginner',
  },
  {
    id: 'swift',
    title: 'Swift',
    description: 'Swift programming language basics, syntax, data types, functions, pointers, arrays, strings, structures, and file handling.',
    tags: ['programming-language', 'software-development'],
    prerequisites: ['intro-to-programming'],
    difficulty: 'beginner',
  },
  {
    id: 'kotlin',
    title: 'Kotlin',
    description: 'Kotlin programming language basics, syntax, data types, functions, pointers, arrays, strings, structures, and file handling.',
    tags: ['programming-language', 'software-development'],
    prerequisites: ['intro-to-programming'],
    difficulty: 'beginner',
  },
  {
    id: 'dart',
    title: 'Dart',
    description: 'Dart programming language basics, syntax, data types, functions, pointers, arrays, strings, structures, and file handling.',
    tags: ['programming-language', 'software-development'],
    prerequisites: ['intro-to-programming'],
    difficulty: 'beginner',
  },
  {
    id: 'ruby',
    title: 'Ruby',
    description: 'Ruby programming language basics, syntax, data types, functions, pointers, arrays, strings, structures, and file handling.',
    tags: ['programming-language', 'software-development'],
    prerequisites: ['intro-to-programming'],
    difficulty: 'beginner',
  },
  {
    id: 'php',
    title: 'PHP',
    description: 'PHP programming language basics, syntax, data types, functions, pointers, arrays, strings, structures, and file handling.',
    tags: ['programming-language', 'software-development'],
    prerequisites: ['intro-to-programming'],
    difficulty: 'beginner',
  },
];

// Economics courses
const economicsCourses: Course[] = [
  {
    id: 'microeconomics',
    title: 'Microeconomics',
    description: 'Microeconomics basics, supply and demand, game theory, market equilibrium, consumer behavior, producer behavior, and game theory.',
    tags: ['foundational', 'economics'],
    prerequisites: ['basic-arithmetic'],
    difficulty: 'beginner',
  },
  {
    id: 'macroeconomics',
    title: 'Macroeconomics',
    description: 'Macroeconomics basics, national income, inflation, unemployment, economic growth, and fiscal and monetary policy.',
    tags: ['economics'],
    prerequisites: ['microeconomics'],
    difficulty: 'beginner',
  },
];

// Specialized courses for additionalCourses
const specializedCourses: Course[] = [
  {
    id: 'technical-writing-fundamentals',
    title: 'Technical Writing Fundamentals',
    description: 'Fundamentals of technical documentation, API documentation, user guides, and technical communication',
    tags: ['foundational', 'information-technology'],
    difficulty: 'beginner'
  },
  {
    id: 'blockchain-fundamentals',
    title: 'Blockchain Fundamentals',
    description: 'Introduction to blockchain technology, distributed ledgers, consensus mechanisms, and smart contracts',
    tags: ['foundational', 'specialized', 'computer-science'],
    difficulty: 'intermediate'
  },
  {
    id: 'cryptocurrency-and-digital-assets',
    title: 'Cryptocurrency and Digital Assets',
    description: 'Understanding cryptocurrencies, digital assets, tokenomics, and blockchain applications in finance',
    tags: ['specialized', 'finance', 'computer-science'],
    prerequisites: ['blockchain-fundamentals'],
    difficulty: 'intermediate'
  },
  {
    id: 'ar-vr-fundamentals',
    title: 'AR/VR Development Fundamentals',
    description: 'Fundamentals of augmented and virtual reality development, 3D graphics, and spatial computing',
    tags: ['specialized', 'computer-science', 'user-interface'],
    difficulty: 'intermediate'
  },
  {
    id: 'quantum-computing-basics',
    title: 'Quantum Computing Basics',
    description: 'Introduction to quantum computing concepts, quantum algorithms, and quantum programming',
    tags: ['specialized', 'computer-science', 'physical-sciences'],
    prerequisites: ['linear-algebra', 'quantum-mechanics-1'],
    difficulty: 'advanced'
  },
  {
    id: 'web3-development',
    title: 'Web3 Development',
    description: 'Development of decentralized applications (dApps), smart contracts, and web3 technologies',
    tags: ['specialized', 'software-development'],
    prerequisites: ['blockchain-fundamentals', 'javascript-fundamentals'],
    difficulty: 'intermediate'
  }
];

// Combine all course categories into baseCourses
const courses: Course[] = [
  ...mathematicsCourses,
  ...computerScienceCourses,
  ...webDevelopmentCourses,
  ...mobileDevelopmentCourses,
  ...devOpsCourses,
  ...cloudCourses,
  ...dataScienceCourses,
  ...physicsCourses,
  ...chemistryCourses,
  ...biologyCourses,
  ...electricalEngineeringCourses,
  ...mechanicalEngineeringCourses,
  ...civilEngineeringCourses,
  ...chemicalEngineeringCourses,
  ...programmingLanguageCourses,
  ...economicsCourses,
  ...specializedCourses,
];

export default courses;
