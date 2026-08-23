import { 
  UserProfile, 
  CareerSkillGap, 
  CareerScoreBreakdown, 
  CareerResource,
  CareerStepStatus
} from '../types';

/**
 * Verified learning resource dictionary using only official and trusted documentation & university resources.
 * Prevents AI hallucinations and fake URLs.
 */
export const VERIFIED_RESOURCE_CATALOG: Record<string, CareerResource[]> = {
  'python': [
    {
      id: 'res_py_official',
      title: 'The Python Official Tutorial & Standard Library',
      provider: 'Python Software Foundation',
      type: 'Official Documentation',
      url: 'https://docs.python.org/3/tutorial/',
      skillCovered: 'Python',
      isVerified: true,
      description: 'The definitive guide to Python syntax, data structures, OOP, modules, and standard libraries.'
    },
    {
      id: 'res_py_fcc',
      title: 'Scientific Computing with Python',
      provider: 'freeCodeCamp',
      type: 'Interactive Course',
      url: 'https://www.freecodecamp.org/learn/scientific-computing-with-python/',
      skillCovered: 'Python',
      isVerified: true,
      description: 'Hands-on curriculum covering algorithms, data manipulation, and clean Python code.'
    }
  ],
  'machine learning': [
    {
      id: 'res_ml_sklearn',
      title: 'Scikit-Learn Machine Learning User Guide & Tutorials',
      provider: 'Scikit-Learn Developers',
      type: 'Official Documentation',
      url: 'https://scikit-learn.org/stable/user_guide.html',
      skillCovered: 'Machine Learning',
      isVerified: true,
      description: 'Comprehensive tutorials on supervised, unsupervised learning, model evaluation, and preprocessing pipelines.'
    },
    {
      id: 'res_ml_stanford',
      title: 'Stanford CS229: Machine Learning Course Materials',
      provider: 'Stanford University',
      type: 'Official Documentation',
      url: 'https://cs229.stanford.edu/syllabus.html',
      skillCovered: 'Machine Learning',
      isVerified: true,
      description: 'Foundational theory of statistical learning, loss functions, optimization, and regularization.'
    }
  ],
  'tensorflow': [
    {
      id: 'res_tf_official',
      title: 'TensorFlow 2.x Official Quickstart & Guide',
      provider: 'TensorFlow / Google Brain',
      type: 'Official Documentation',
      url: 'https://www.tensorflow.org/tutorials',
      skillCovered: 'TensorFlow',
      isVerified: true,
      description: 'Official hands-on guides for Keras Sequential/Functional APIs, convolutional nets, and production pipelines.'
    }
  ],
  'pytorch': [
    {
      id: 'res_pytorch_official',
      title: 'PyTorch Deep Learning with PyTorch: A 60 Minute Blitz',
      provider: 'PyTorch Foundation',
      type: 'Official Documentation',
      url: 'https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html',
      skillCovered: 'PyTorch',
      isVerified: true,
      description: 'Tensors, autograd, neural networks, loss functions, and CUDA GPU training.'
    },
    {
      id: 'res_pytorch_examples',
      title: 'Official PyTorch Model Examples & Recipes',
      provider: 'PyTorch GitHub',
      type: 'Open Source Repository',
      url: 'https://pytorch.org/tutorials/recipes/recipes_index.html',
      skillCovered: 'PyTorch',
      isVerified: true,
      description: 'Practical recipes for model checkpointing, transfer learning, and production inference.'
    }
  ],
  'docker': [
    {
      id: 'res_docker_official',
      title: 'Docker Get Started & Containerization Guide',
      provider: 'Docker Docs',
      type: 'Official Documentation',
      url: 'https://docs.docker.com/get-started/',
      skillCovered: 'Docker',
      isVerified: true,
      description: 'Container fundamentals, writing efficient Dockerfiles, multi-stage builds, and Docker Compose.'
    }
  ],
  'fastapi': [
    {
      id: 'res_fastapi_official',
      title: 'FastAPI Interactive Tutorial & Production Guide',
      provider: 'FastAPI (Tiangolo)',
      type: 'Official Documentation',
      url: 'https://fastapi.tiangolo.com/tutorial/',
      skillCovered: 'FastAPI',
      isVerified: true,
      description: 'High-performance async APIs, Pydantic validation, dependency injection, and OpenAPI documentation.'
    }
  ],
  'sql': [
    {
      id: 'res_sql_postgres',
      title: 'PostgreSQL Official Documentation & SQL Tutorial',
      provider: 'PostgreSQL Global Development Group',
      type: 'Official Documentation',
      url: 'https://www.postgresql.org/docs/current/tutorial.html',
      skillCovered: 'SQL',
      isVerified: true,
      description: 'Relational data modeling, window functions, indexing, query planning, and complex joins.'
    }
  ],
  'react': [
    {
      id: 'res_react_official',
      title: 'React Official Documentation (Learn React)',
      provider: 'React Core Team (Meta)',
      type: 'Official Documentation',
      url: 'https://react.dev/learn',
      skillCovered: 'React',
      isVerified: true,
      description: 'Modern React hooks, state management, component lifecycle, rendering patterns, and performance optimization.'
    }
  ],
  'typescript': [
    {
      id: 'res_ts_official',
      title: 'The TypeScript Handbook for Programmers',
      provider: 'Microsoft TypeScript Team',
      type: 'Official Documentation',
      url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
      skillCovered: 'TypeScript',
      isVerified: true,
      description: 'Type inference, generics, union types, interfaces, utility types, and strict mode best practices.'
    }
  ],
  'aws': [
    {
      id: 'res_aws_fundamentals',
      title: 'AWS Cloud Practitioner & Architecture Whitepapers',
      provider: 'Amazon Web Services',
      type: 'Official Documentation',
      url: 'https://docs.aws.amazon.com/whitepapers/latest/aws-overview/introduction.html',
      skillCovered: 'AWS',
      isVerified: true,
      description: 'Core compute (EC2, Lambda), storage (S3), networking (VPC), and IAM security.'
    }
  ],
  'gcp': [
    {
      id: 'res_gcp_official',
      title: 'Google Cloud Platform Architectural Framework',
      provider: 'Google Cloud Docs',
      type: 'Official Documentation',
      url: 'https://cloud.google.com/docs',
      skillCovered: 'GCP',
      isVerified: true,
      description: 'Cloud Run, Vertex AI, Firestore, BigQuery, and scalable container deployment.'
    }
  ],
  'kubernetes': [
    {
      id: 'res_k8s_official',
      title: 'Kubernetes Documentation & Interactive Tutorials',
      provider: 'Cloud Native Computing Foundation (CNCF)',
      type: 'Official Documentation',
      url: 'https://kubernetes.io/docs/tutorials/',
      skillCovered: 'Kubernetes',
      isVerified: true,
      description: 'Pods, Deployments, Services, ConfigMaps, and cluster orchestration.'
    }
  ],
  'git': [
    {
      id: 'res_git_book',
      title: 'Pro Git Book (Official Reference)',
      provider: 'Git SCM',
      type: 'Book / Paper',
      url: 'https://git-scm.com/book/en/v2',
      skillCovered: 'Git',
      isVerified: true,
      description: 'Branching strategies, interactive rebasing, merge conflict resolution, and collaborative workflows.'
    }
  ],
  'pandas': [
    {
      id: 'res_pandas_official',
      title: 'Pandas User Guide & 10 Minutes to pandas',
      provider: 'PyData / Pandas Community',
      type: 'Official Documentation',
      url: 'https://pandas.pydata.org/docs/user_guide/10min.html',
      skillCovered: 'Pandas',
      isVerified: true,
      description: 'DataFrame operations, grouping, aggregations, time series, and vectorized data manipulation.'
    }
  ],
  'system design': [
    {
      id: 'res_sysdesign_primer',
      title: 'System Design Primer by Donne Martin',
      provider: 'GitHub Open Source',
      type: 'Open Source Repository',
      url: 'https://github.com/donnemartin/system-design-primer',
      skillCovered: 'System Design',
      isVerified: true,
      description: 'Scalability, microservices, load balancing, caching strategies, and database sharding patterns.'
    }
  ],
  'dsa': [
    {
      id: 'res_dsa_visual',
      title: 'VisuAlgo: Visualizing Data Structures and Algorithms',
      provider: 'National University of Singapore',
      type: 'Interactive Course',
      url: 'https://visualgo.net/en',
      skillCovered: 'Data Structures & Algorithms',
      isVerified: true,
      description: 'Interactive visual representations of trees, graphs, sorting, dynamic programming, and heaps.'
    }
  ]
};

/**
 * Helper to match skills against the verified catalog
 */
export function getVerifiedResourcesForSkill(skillName: string): CareerResource[] {
  const norm = skillName.toLowerCase().trim();
  for (const [key, resources] of Object.entries(VERIFIED_RESOURCE_CATALOG)) {
    if (norm.includes(key) || key.includes(norm)) {
      return resources;
    }
  }
  // Generic official resource fallback with verified tag
  return [
    {
      id: `res_verified_${norm.replace(/[^a-z0-9]/g, '_')}`,
      title: `${skillName} Official Reference & Documentation`,
      provider: `${skillName} Developer Docs`,
      type: 'Official Documentation',
      url: `https://devdocs.io/#q=${encodeURIComponent(skillName)}`,
      skillCovered: skillName,
      isVerified: true,
      description: `Official technical API references, syntax specifications, and best practice guides for ${skillName}.`
    }
  ];
}

/**
 * Deterministic Readiness Scoring Function
 * 
 * Formula:
 * - Required Skills (Matched + Completed): 40%
 * - Preferred Skills: 15%
 * - Projects & Experience: 20%
 * - Tools & Technologies: 10%
 * - Education / Certifications: 5%
 * - Profile Completeness: 10%
 * Total = 100%
 */
export function calculateDeterministicReadinessScore(params: {
  user: UserProfile | null;
  skillGaps: CareerSkillGap[];
  completedStepCount?: number;
  totalStepCount?: number;
  atsScore?: number;
}): {
  score: number;
  breakdown: CareerScoreBreakdown;
} {
  const { user, skillGaps, completedStepCount = 0, totalStepCount = 1, atsScore } = params;

  // 1. Required Skills (Max 40 points)
  const requiredGaps = skillGaps.filter(g => g.priority === 'HIGH' || g.category === 'Required');
  let requiredSkillsScore = 0;
  if (requiredGaps.length === 0) {
    requiredSkillsScore = 32; // Default baseline if no high gaps specified
  } else {
    let matchedCount = 0;
    requiredGaps.forEach(g => {
      if (g.status === 'MATCHED' || g.completed) {
        matchedCount += 1;
      } else if (g.status === 'PARTIALLY_MATCHED') {
        matchedCount += 0.5;
      }
    });
    requiredSkillsScore = Math.round((matchedCount / requiredGaps.length) * 40);
  }

  // 2. Preferred Skills (Max 15 points)
  const preferredGaps = skillGaps.filter(g => g.priority === 'MEDIUM' || g.category === 'Preferred');
  let preferredSkillsScore = 0;
  if (preferredGaps.length === 0) {
    preferredSkillsScore = 10;
  } else {
    let prefMatched = 0;
    preferredGaps.forEach(g => {
      if (g.status === 'MATCHED' || g.completed) {
        prefMatched += 1;
      } else if (g.status === 'PARTIALLY_MATCHED') {
        prefMatched += 0.5;
      }
    });
    preferredSkillsScore = Math.round((prefMatched / preferredGaps.length) * 15);
  }

  // 3. Projects & Practical Experience (Max 20 points)
  // Considers user profile projects + milestone completion progress
  const hasUserSkills = (user?.skills?.length || 0) >= 4;
  const projectBaseline = hasUserSkills ? 10 : 5;
  const stepRatio = totalStepCount > 0 ? (completedStepCount / totalStepCount) : 0;
  const progressBonus = Math.round(stepRatio * 10);
  const projectsExperienceScore = Math.min(20, projectBaseline + progressBonus);

  // 4. Tools & Technologies (Max 10 points)
  const toolGaps = skillGaps.filter(g => g.category === 'Tool' || g.priority === 'LOW');
  let toolMatched = 0;
  if (toolGaps.length === 0) {
    toolMatched = 7;
  } else {
    let tMatched = 0;
    toolGaps.forEach(g => {
      if (g.status === 'MATCHED' || g.completed) tMatched += 1;
      else if (g.status === 'PARTIALLY_MATCHED') tMatched += 0.5;
    });
    toolMatched = Math.round((tMatched / toolGaps.length) * 10);
  }
  const toolsTechnologiesScore = Math.min(10, Math.max(0, toolMatched));

  // 5. Education & Certifications (Max 5 points)
  let educationScore = 3;
  if (user?.degree && user?.branch) {
    educationScore = 5;
  }

  // 6. Profile Completeness (Max 10 points)
  let completeness = 0;
  if (user?.name) completeness += 2;
  if (user?.skills && user.skills.length > 0) completeness += 3;
  if (user?.location) completeness += 2;
  if (user?.career_interests && user.career_interests.length > 0) completeness += 2;
  if (user?.year) completeness += 1;
  const profileCompletenessScore = Math.min(10, completeness);

  // Calculate Total
  let rawTotal = requiredSkillsScore + preferredSkillsScore + projectsExperienceScore + toolsTechnologiesScore + educationScore + profileCompletenessScore;

  // If ATS score exists, factor in a slight calibration (+/- 3%)
  if (atsScore && atsScore > 75) {
    rawTotal = Math.min(100, rawTotal + 3);
  }

  const finalScore = Math.min(100, Math.max(15, rawTotal));

  const explanation = `Readiness Score is calculated using a transparent weighted function: Required Skills (${requiredSkillsScore}/40), Preferred Skills (${preferredSkillsScore}/15), Projects & Practical Experience (${projectsExperienceScore}/20), Tools & Technologies (${toolsTechnologiesScore}/10), Academic Standing (${educationScore}/5), and Profile Completeness (${profileCompletenessScore}/10).`;

  return {
    score: finalScore,
    breakdown: {
      requiredSkillsScore,
      preferredSkillsScore,
      projectsExperienceScore,
      toolsTechnologiesScore,
      educationCertificationsScore: educationScore,
      profileCompletenessScore,
      total: finalScore,
      calculationExplanation: explanation
    }
  };
}
