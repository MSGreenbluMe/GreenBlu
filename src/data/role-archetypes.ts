// GreenBlu.ai Role Archetypes
// 15+ job roles with comprehensive personality requirements

import type { RoleArchetype } from '../types';

export const roleArchetypes: RoleArchetype[] = [
  // ==================== ENGINEERING ====================
  {
    role_id: 'software-engineer',
    title: 'Software Engineer',
    category: 'engineering',
    description: 'Builds and maintains software systems through code. Solves complex technical problems and creates scalable solutions.',

    required_genius: {
      primary: ['invention', 'discernment', 'tenacity'],
      secondary: ['wonder', 'enablement']
    },

    ideal_big_five: {
      openness: { min: 60, max: 90, weight: 0.8 },
      conscientiousness: { min: 55, max: 85, weight: 0.9 },
      extraversion: { min: 30, max: 70, weight: 0.3 },
      agreeableness: { min: 40, max: 75, weight: 0.5 },
      neuroticism: { min: 20, max: 50, weight: 0.6 }
    },

    mbti_preferences: {
      EI: 'neutral',
      SN: 'N',
      TF: 'T',
      JP: 'neutral'
    },

    flow_triggers_needed: [
      'Deep problem-solving',
      'Building complex systems',
      'Debugging challenging issues',
      'Learning new technologies'
    ],

    energy_profile: {
      high_energy_tasks: ['Coding', 'Architecture design', 'Technical problem-solving'],
      low_energy_tasks: ['Long meetings', 'Extensive documentation', 'Office politics'],
      autonomy_level: 'high',
      collaboration_level: 'medium'
    },

    typical_tasks: [
      { task: 'Write and review code', frequency: 'daily', complexity: 'high', energy_requirement: 'high' },
      { task: 'Debug and fix issues', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Code reviews', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Design system architecture', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Team meetings and standups', frequency: 'daily', complexity: 'low', energy_requirement: 'low' },
      { task: 'Documentation', frequency: 'weekly', complexity: 'low', energy_requirement: 'medium' }
    ],

    derived_traits_weight: {
      stress_resilience: 0.7,
      optimism: 0.5,
      flow_tendency: 0.9,
      collaboration_preference: 0.5,
      structure_need: 0.6,
      energy_baseline: 0.6,
      recovery_speed: 0.6,
      risk_tolerance: 0.7
    }
  },

  {
    role_id: 'frontend-engineer',
    title: 'Frontend Engineer',
    category: 'engineering',
    description: 'Crafts user interfaces and experiences. Combines technical skill with design sensibility to build beautiful, functional web applications.',

    required_genius: {
      primary: ['invention', 'wonder', 'discernment'],
      secondary: ['enablement', 'tenacity']
    },

    ideal_big_five: {
      openness: { min: 65, max: 95, weight: 0.9 },
      conscientiousness: { min: 60, max: 90, weight: 0.8 },
      extraversion: { min: 35, max: 75, weight: 0.4 },
      agreeableness: { min: 50, max: 80, weight: 0.6 },
      neuroticism: { min: 20, max: 45, weight: 0.7 }
    },

    mbti_preferences: {
      EI: 'neutral',
      SN: 'N',
      TF: 'neutral',
      JP: 'P'
    },

    flow_triggers_needed: [
      'Creating beautiful interfaces',
      'Solving UX challenges',
      'Animation and interaction design',
      'Performance optimization'
    ],

    energy_profile: {
      high_energy_tasks: ['UI development', 'Design implementation', 'User experience optimization'],
      low_energy_tasks: ['Backend integration issues', 'Browser compatibility debugging'],
      autonomy_level: 'high',
      collaboration_level: 'medium'
    },

    typical_tasks: [
      { task: 'Build UI components', frequency: 'daily', complexity: 'high', energy_requirement: 'high' },
      { task: 'Implement designs', frequency: 'daily', complexity: 'medium', energy_requirement: 'high' },
      { task: 'Optimize performance', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Collaborate with designers', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Cross-browser testing', frequency: 'weekly', complexity: 'low', energy_requirement: 'low' }
    ],

    derived_traits_weight: {
      stress_resilience: 0.6,
      optimism: 0.7,
      flow_tendency: 0.9,
      collaboration_preference: 0.6,
      structure_need: 0.5,
      energy_baseline: 0.7,
      recovery_speed: 0.6,
      risk_tolerance: 0.6
    }
  },

  {
    role_id: 'data-scientist',
    title: 'Data Scientist',
    category: 'data',
    description: 'Extracts insights from data using statistics, machine learning, and analytical thinking. Transforms raw data into actionable intelligence.',

    required_genius: {
      primary: ['discernment', 'wonder', 'invention'],
      secondary: ['tenacity', 'galvanizing']
    },

    ideal_big_five: {
      openness: { min: 70, max: 95, weight: 0.9 },
      conscientiousness: { min: 65, max: 90, weight: 0.8 },
      extraversion: { min: 30, max: 65, weight: 0.4 },
      agreeableness: { min: 45, max: 75, weight: 0.5 },
      neuroticism: { min: 15, max: 40, weight: 0.7 }
    },

    mbti_preferences: {
      EI: 'I',
      SN: 'N',
      TF: 'T',
      JP: 'neutral'
    },

    flow_triggers_needed: [
      'Data exploration and analysis',
      'Building predictive models',
      'Discovering patterns',
      'Solving analytical puzzles'
    ],

    energy_profile: {
      high_energy_tasks: ['Model development', 'Data exploration', 'Statistical analysis'],
      low_energy_tasks: ['Data cleaning', 'Stakeholder management', 'Repetitive reporting'],
      autonomy_level: 'high',
      collaboration_level: 'medium'
    },

    typical_tasks: [
      { task: 'Analyze datasets', frequency: 'daily', complexity: 'high', energy_requirement: 'high' },
      { task: 'Build ML models', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Data cleaning and preprocessing', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Present findings to stakeholders', frequency: 'weekly', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Code reviews and collaboration', frequency: 'weekly', complexity: 'medium', energy_requirement: 'low' }
    ],

    derived_traits_weight: {
      stress_resilience: 0.7,
      optimism: 0.6,
      flow_tendency: 0.9,
      collaboration_preference: 0.5,
      structure_need: 0.7,
      energy_baseline: 0.6,
      recovery_speed: 0.6,
      risk_tolerance: 0.8
    }
  },

  // ==================== DESIGN ====================
  {
    role_id: 'product-designer',
    title: 'Product Designer',
    category: 'design',
    description: 'Designs user experiences and interfaces for digital products. Balances user needs, business goals, and technical constraints.',

    required_genius: {
      primary: ['wonder', 'invention', 'discernment'],
      secondary: ['enablement', 'galvanizing']
    },

    ideal_big_five: {
      openness: { min: 75, max: 95, weight: 1.0 },
      conscientiousness: { min: 55, max: 85, weight: 0.7 },
      extraversion: { min: 45, max: 80, weight: 0.6 },
      agreeableness: { min: 55, max: 85, weight: 0.7 },
      neuroticism: { min: 20, max: 50, weight: 0.6 }
    },

    mbti_preferences: {
      EI: 'neutral',
      SN: 'N',
      TF: 'F',
      JP: 'P'
    },

    flow_triggers_needed: [
      'Creating design concepts',
      'User research synthesis',
      'Prototyping interactions',
      'Solving user problems'
    ],

    energy_profile: {
      high_energy_tasks: ['Designing interfaces', 'User research', 'Prototyping', 'Creative exploration'],
      low_energy_tasks: ['Pixel-perfect adjustments', 'Design system maintenance', 'Endless revisions'],
      autonomy_level: 'medium',
      collaboration_level: 'high'
    },

    typical_tasks: [
      { task: 'User research and interviews', frequency: 'weekly', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Create wireframes and mockups', frequency: 'daily', complexity: 'high', energy_requirement: 'high' },
      { task: 'Design reviews and critiques', frequency: 'weekly', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Prototype interactions', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Collaborate with engineers', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' }
    ],

    derived_traits_weight: {
      stress_resilience: 0.6,
      optimism: 0.7,
      flow_tendency: 0.8,
      collaboration_preference: 0.8,
      structure_need: 0.5,
      energy_baseline: 0.7,
      recovery_speed: 0.6,
      risk_tolerance: 0.7
    }
  },

  {
    role_id: 'ux-researcher',
    title: 'UX Researcher',
    category: 'design',
    description: 'Studies user behavior and needs through research. Provides insights that guide product decisions and design direction.',

    required_genius: {
      primary: ['wonder', 'discernment', 'enablement'],
      secondary: ['invention', 'galvanizing']
    },

    ideal_big_five: {
      openness: { min: 70, max: 90, weight: 0.9 },
      conscientiousness: { min: 60, max: 85, weight: 0.8 },
      extraversion: { min: 50, max: 80, weight: 0.7 },
      agreeableness: { min: 60, max: 90, weight: 0.8 },
      neuroticism: { min: 20, max: 45, weight: 0.6 }
    },

    mbti_preferences: {
      EI: 'E',
      SN: 'N',
      TF: 'F',
      JP: 'J'
    },

    flow_triggers_needed: [
      'Conducting user interviews',
      'Analyzing research data',
      'Discovering user insights',
      'Presenting findings'
    ],

    energy_profile: {
      high_energy_tasks: ['User interviews', 'Research synthesis', 'Insight presentation'],
      low_energy_tasks: ['Data entry', 'Recruitment logistics', 'Administrative tasks'],
      autonomy_level: 'medium',
      collaboration_level: 'high'
    },

    typical_tasks: [
      { task: 'Plan and conduct user research', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Analyze research findings', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Present insights to teams', frequency: 'weekly', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Recruit participants', frequency: 'weekly', complexity: 'low', energy_requirement: 'low' },
      { task: 'Collaborate with designers', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' }
    ],

    derived_traits_weight: {
      stress_resilience: 0.6,
      optimism: 0.7,
      flow_tendency: 0.7,
      collaboration_preference: 0.9,
      structure_need: 0.7,
      energy_baseline: 0.7,
      recovery_speed: 0.6,
      risk_tolerance: 0.5
    }
  },

  // ==================== PRODUCT ====================
  {
    role_id: 'product-manager',
    title: 'Product Manager',
    category: 'product',
    description: 'Defines product vision and strategy. Balances user needs, business goals, and technical feasibility to drive product success.',

    required_genius: {
      primary: ['discernment', 'galvanizing', 'enablement'],
      secondary: ['wonder', 'tenacity']
    },

    ideal_big_five: {
      openness: { min: 65, max: 85, weight: 0.7 },
      conscientiousness: { min: 65, max: 90, weight: 0.9 },
      extraversion: { min: 60, max: 90, weight: 0.8 },
      agreeableness: { min: 55, max: 80, weight: 0.7 },
      neuroticism: { min: 15, max: 40, weight: 0.8 }
    },

    mbti_preferences: {
      EI: 'E',
      SN: 'N',
      TF: 'neutral',
      JP: 'J'
    },

    flow_triggers_needed: [
      'Strategic planning',
      'Stakeholder alignment',
      'Problem-solving',
      'Product decisions'
    ],

    energy_profile: {
      high_energy_tasks: ['Strategy development', 'User feedback analysis', 'Roadmap planning'],
      low_energy_tasks: ['Status updates', 'Meeting overload', 'Firefighting'],
      autonomy_level: 'medium',
      collaboration_level: 'high'
    },

    typical_tasks: [
      { task: 'Define product strategy', frequency: 'monthly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Prioritize roadmap', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Stakeholder meetings', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'User research and feedback', frequency: 'weekly', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Work with engineering and design', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' }
    ],

    derived_traits_weight: {
      stress_resilience: 0.9,
      optimism: 0.8,
      flow_tendency: 0.6,
      collaboration_preference: 0.9,
      structure_need: 0.7,
      energy_baseline: 0.8,
      recovery_speed: 0.7,
      risk_tolerance: 0.7
    }
  },

  // ==================== MARKETING ====================
  {
    role_id: 'content-marketer',
    title: 'Content Marketing Manager',
    category: 'marketing',
    description: 'Creates compelling content that engages audiences and drives growth. Combines creativity with data-driven strategy.',

    required_genius: {
      primary: ['wonder', 'galvanizing', 'invention'],
      secondary: ['discernment', 'enablement']
    },

    ideal_big_five: {
      openness: { min: 70, max: 95, weight: 0.9 },
      conscientiousness: { min: 55, max: 80, weight: 0.6 },
      extraversion: { min: 55, max: 85, weight: 0.7 },
      agreeableness: { min: 50, max: 80, weight: 0.6 },
      neuroticism: { min: 20, max: 50, weight: 0.5 }
    },

    mbti_preferences: {
      EI: 'E',
      SN: 'N',
      TF: 'F',
      JP: 'P'
    },

    flow_triggers_needed: [
      'Creative writing',
      'Content ideation',
      'Storytelling',
      'Audience engagement'
    ],

    energy_profile: {
      high_energy_tasks: ['Writing', 'Creative brainstorming', 'Content strategy'],
      low_energy_tasks: ['Analytics reporting', 'SEO optimization', 'Administrative tasks'],
      autonomy_level: 'high',
      collaboration_level: 'medium'
    },

    typical_tasks: [
      { task: 'Create content', frequency: 'daily', complexity: 'high', energy_requirement: 'high' },
      { task: 'Content strategy and planning', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Analyze content performance', frequency: 'weekly', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Collaborate with marketing team', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'SEO and optimization', frequency: 'weekly', complexity: 'low', energy_requirement: 'low' }
    ],

    derived_traits_weight: {
      stress_resilience: 0.6,
      optimism: 0.8,
      flow_tendency: 0.8,
      collaboration_preference: 0.6,
      structure_need: 0.5,
      energy_baseline: 0.7,
      recovery_speed: 0.6,
      risk_tolerance: 0.6
    }
  },

  {
    role_id: 'growth-marketer',
    title: 'Growth Marketing Manager',
    category: 'marketing',
    description: 'Drives user acquisition and retention through data-driven experiments. Combines analytical thinking with creative marketing.',

    required_genius: {
      primary: ['invention', 'discernment', 'tenacity'],
      secondary: ['galvanizing', 'wonder']
    },

    ideal_big_five: {
      openness: { min: 65, max: 90, weight: 0.8 },
      conscientiousness: { min: 60, max: 85, weight: 0.8 },
      extraversion: { min: 50, max: 80, weight: 0.6 },
      agreeableness: { min: 45, max: 75, weight: 0.5 },
      neuroticism: { min: 20, max: 45, weight: 0.6 }
    },

    mbti_preferences: {
      EI: 'neutral',
      SN: 'N',
      TF: 'T',
      JP: 'J'
    },

    flow_triggers_needed: [
      'Running experiments',
      'Analyzing growth metrics',
      'Optimizing funnels',
      'Scaling campaigns'
    ],

    energy_profile: {
      high_energy_tasks: ['Experiment design', 'Data analysis', 'Growth strategy'],
      low_energy_tasks: ['Routine reporting', 'Campaign maintenance', 'Administrative work'],
      autonomy_level: 'high',
      collaboration_level: 'medium'
    },

    typical_tasks: [
      { task: 'Design and run growth experiments', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Analyze growth metrics', frequency: 'daily', complexity: 'high', energy_requirement: 'high' },
      { task: 'Optimize conversion funnels', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Present results to leadership', frequency: 'weekly', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Collaborate with product team', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' }
    ],

    derived_traits_weight: {
      stress_resilience: 0.7,
      optimism: 0.7,
      flow_tendency: 0.8,
      collaboration_preference: 0.6,
      structure_need: 0.7,
      energy_baseline: 0.7,
      recovery_speed: 0.7,
      risk_tolerance: 0.8
    }
  },

  // ==================== SALES ====================
  {
    role_id: 'account-executive',
    title: 'Account Executive',
    category: 'sales',
    description: 'Builds relationships and closes deals. Understands customer needs and communicates value effectively.',

    required_genius: {
      primary: ['galvanizing', 'enablement', 'discernment'],
      secondary: ['tenacity', 'wonder']
    },

    ideal_big_five: {
      openness: { min: 55, max: 80, weight: 0.6 },
      conscientiousness: { min: 60, max: 85, weight: 0.7 },
      extraversion: { min: 70, max: 95, weight: 1.0 },
      agreeableness: { min: 55, max: 85, weight: 0.7 },
      neuroticism: { min: 15, max: 35, weight: 0.8 }
    },

    mbti_preferences: {
      EI: 'E',
      SN: 'neutral',
      TF: 'F',
      JP: 'neutral'
    },

    flow_triggers_needed: [
      'Customer conversations',
      'Closing deals',
      'Relationship building',
      'Overcoming objections'
    ],

    energy_profile: {
      high_energy_tasks: ['Sales calls', 'Client meetings', 'Deal negotiations'],
      low_energy_tasks: ['CRM data entry', 'Administrative tasks', 'Reporting'],
      autonomy_level: 'medium',
      collaboration_level: 'high'
    },

    typical_tasks: [
      { task: 'Prospect and reach out to leads', frequency: 'daily', complexity: 'medium', energy_requirement: 'high' },
      { task: 'Conduct sales calls and demos', frequency: 'daily', complexity: 'high', energy_requirement: 'high' },
      { task: 'Negotiate and close deals', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Update CRM', frequency: 'daily', complexity: 'low', energy_requirement: 'low' },
      { task: 'Team meetings and training', frequency: 'weekly', complexity: 'low', energy_requirement: 'medium' }
    ],

    derived_traits_weight: {
      stress_resilience: 0.9,
      optimism: 0.9,
      flow_tendency: 0.6,
      collaboration_preference: 0.8,
      structure_need: 0.6,
      energy_baseline: 0.9,
      recovery_speed: 0.8,
      risk_tolerance: 0.7
    }
  },

  // ==================== OPERATIONS ====================
  {
    role_id: 'operations-manager',
    title: 'Operations Manager',
    category: 'operations',
    description: 'Optimizes processes and ensures smooth operations. Balances efficiency, quality, and team effectiveness.',

    required_genius: {
      primary: ['discernment', 'enablement', 'tenacity'],
      secondary: ['invention', 'galvanizing']
    },

    ideal_big_five: {
      openness: { min: 50, max: 75, weight: 0.5 },
      conscientiousness: { min: 75, max: 95, weight: 1.0 },
      extraversion: { min: 50, max: 80, weight: 0.6 },
      agreeableness: { min: 60, max: 85, weight: 0.7 },
      neuroticism: { min: 15, max: 35, weight: 0.8 }
    },

    mbti_preferences: {
      EI: 'neutral',
      SN: 'S',
      TF: 'T',
      JP: 'J'
    },

    flow_triggers_needed: [
      'Process optimization',
      'Problem-solving',
      'Team coordination',
      'Systems improvement'
    ],

    energy_profile: {
      high_energy_tasks: ['Process improvement', 'Strategic planning', 'Team leadership'],
      low_energy_tasks: ['Crisis management', 'Conflict resolution', 'Repetitive tasks'],
      autonomy_level: 'medium',
      collaboration_level: 'high'
    },

    typical_tasks: [
      { task: 'Optimize operational processes', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Monitor performance metrics', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Team coordination and management', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Strategic planning', frequency: 'monthly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Handle operational issues', frequency: 'daily', complexity: 'medium', energy_requirement: 'high' }
    ],

    derived_traits_weight: {
      stress_resilience: 0.9,
      optimism: 0.7,
      flow_tendency: 0.6,
      collaboration_preference: 0.8,
      structure_need: 0.9,
      energy_baseline: 0.8,
      recovery_speed: 0.8,
      risk_tolerance: 0.5
    }
  },

  {
    role_id: 'project-manager',
    title: 'Project Manager',
    category: 'operations',
    description: 'Plans and executes projects from start to finish. Coordinates teams, manages timelines, and ensures successful delivery.',

    required_genius: {
      primary: ['enablement', 'discernment', 'tenacity'],
      secondary: ['galvanizing', 'invention']
    },

    ideal_big_five: {
      openness: { min: 55, max: 80, weight: 0.6 },
      conscientiousness: { min: 70, max: 95, weight: 1.0 },
      extraversion: { min: 55, max: 85, weight: 0.7 },
      agreeableness: { min: 65, max: 90, weight: 0.8 },
      neuroticism: { min: 15, max: 40, weight: 0.7 }
    },

    mbti_preferences: {
      EI: 'E',
      SN: 'neutral',
      TF: 'neutral',
      JP: 'J'
    },

    flow_triggers_needed: [
      'Project planning',
      'Team coordination',
      'Problem-solving',
      'Delivering milestones'
    ],

    energy_profile: {
      high_energy_tasks: ['Project planning', 'Team facilitation', 'Stakeholder management'],
      low_energy_tasks: ['Administrative details', 'Status reporting', 'Meeting overload'],
      autonomy_level: 'medium',
      collaboration_level: 'high'
    },

    typical_tasks: [
      { task: 'Plan project timelines and resources', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Coordinate team activities', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Track progress and remove blockers', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Stakeholder communication', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Risk management', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' }
    ],

    derived_traits_weight: {
      stress_resilience: 0.9,
      optimism: 0.7,
      flow_tendency: 0.6,
      collaboration_preference: 0.9,
      structure_need: 0.9,
      energy_baseline: 0.7,
      recovery_speed: 0.7,
      risk_tolerance: 0.6
    }
  },

  // ==================== LEADERSHIP ====================
  {
    role_id: 'engineering-manager',
    title: 'Engineering Manager',
    category: 'leadership',
    description: 'Leads engineering teams to success. Balances technical leadership with people management and strategic thinking.',

    required_genius: {
      primary: ['enablement', 'discernment', 'galvanizing'],
      secondary: ['invention', 'tenacity']
    },

    ideal_big_five: {
      openness: { min: 60, max: 85, weight: 0.7 },
      conscientiousness: { min: 65, max: 90, weight: 0.8 },
      extraversion: { min: 55, max: 85, weight: 0.8 },
      agreeableness: { min: 60, max: 90, weight: 0.8 },
      neuroticism: { min: 15, max: 35, weight: 0.9 }
    },

    mbti_preferences: {
      EI: 'E',
      SN: 'N',
      TF: 'neutral',
      JP: 'J'
    },

    flow_triggers_needed: [
      'Coaching team members',
      'Strategic planning',
      'Technical problem-solving',
      'Building high-performing teams'
    ],

    energy_profile: {
      high_energy_tasks: ['Team development', 'Strategic planning', 'Technical mentoring'],
      low_energy_tasks: ['Performance reviews', 'Conflict resolution', 'Budget management'],
      autonomy_level: 'medium',
      collaboration_level: 'high'
    },

    typical_tasks: [
      { task: '1-on-1s with team members', frequency: 'weekly', complexity: 'medium', energy_requirement: 'high' },
      { task: 'Technical decision-making', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Team planning and roadmapping', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Hiring and recruiting', frequency: 'monthly', complexity: 'high', energy_requirement: 'medium' },
      { task: 'Cross-functional collaboration', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' }
    ],

    derived_traits_weight: {
      stress_resilience: 0.9,
      optimism: 0.8,
      flow_tendency: 0.6,
      collaboration_preference: 0.9,
      structure_need: 0.7,
      energy_baseline: 0.8,
      recovery_speed: 0.8,
      risk_tolerance: 0.7
    }
  },

  {
    role_id: 'head-of-product',
    title: 'Head of Product',
    category: 'leadership',
    description: 'Defines product vision and strategy at the organizational level. Leads product teams and drives product excellence.',

    required_genius: {
      primary: ['discernment', 'galvanizing', 'wonder'],
      secondary: ['enablement', 'invention']
    },

    ideal_big_five: {
      openness: { min: 70, max: 90, weight: 0.8 },
      conscientiousness: { min: 65, max: 90, weight: 0.8 },
      extraversion: { min: 65, max: 90, weight: 0.9 },
      agreeableness: { min: 55, max: 80, weight: 0.7 },
      neuroticism: { min: 10, max: 30, weight: 0.9 }
    },

    mbti_preferences: {
      EI: 'E',
      SN: 'N',
      TF: 'neutral',
      JP: 'J'
    },

    flow_triggers_needed: [
      'Strategic thinking',
      'Vision setting',
      'Leadership decisions',
      'Organizational impact'
    ],

    energy_profile: {
      high_energy_tasks: ['Strategic planning', 'Vision communication', 'Team leadership'],
      low_energy_tasks: ['Administrative overhead', 'Politics', 'Routine status meetings'],
      autonomy_level: 'high',
      collaboration_level: 'high'
    },

    typical_tasks: [
      { task: 'Define product strategy and vision', frequency: 'monthly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Lead product team', frequency: 'daily', complexity: 'high', energy_requirement: 'high' },
      { task: 'Stakeholder management', frequency: 'daily', complexity: 'high', energy_requirement: 'medium' },
      { task: 'Roadmap planning and prioritization', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Organizational leadership', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' }
    ],

    derived_traits_weight: {
      stress_resilience: 0.9,
      optimism: 0.9,
      flow_tendency: 0.7,
      collaboration_preference: 0.9,
      structure_need: 0.7,
      energy_baseline: 0.9,
      recovery_speed: 0.8,
      risk_tolerance: 0.8
    }
  },

  // ==================== SPECIALIZED ROLES ====================
  {
    role_id: 'devops-engineer',
    title: 'DevOps Engineer',
    category: 'engineering',
    description: 'Builds and maintains infrastructure and deployment systems. Bridges development and operations for reliable software delivery.',

    required_genius: {
      primary: ['invention', 'tenacity', 'discernment'],
      secondary: ['enablement', 'wonder']
    },

    ideal_big_five: {
      openness: { min: 60, max: 85, weight: 0.7 },
      conscientiousness: { min: 70, max: 95, weight: 1.0 },
      extraversion: { min: 30, max: 65, weight: 0.4 },
      agreeableness: { min: 50, max: 75, weight: 0.5 },
      neuroticism: { min: 15, max: 40, weight: 0.8 }
    },

    mbti_preferences: {
      EI: 'I',
      SN: 'neutral',
      TF: 'T',
      JP: 'J'
    },

    flow_triggers_needed: [
      'Automating processes',
      'System optimization',
      'Infrastructure problem-solving',
      'Building reliable systems'
    ],

    energy_profile: {
      high_energy_tasks: ['Infrastructure design', 'Automation development', 'System optimization'],
      low_energy_tasks: ['On-call emergencies', 'Repetitive manual tasks', 'Documentation'],
      autonomy_level: 'high',
      collaboration_level: 'medium'
    },

    typical_tasks: [
      { task: 'Build and maintain CI/CD pipelines', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Monitor system health', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Automate deployment processes', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Incident response', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Collaborate with development teams', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' }
    ],

    derived_traits_weight: {
      stress_resilience: 0.9,
      optimism: 0.6,
      flow_tendency: 0.8,
      collaboration_preference: 0.5,
      structure_need: 0.8,
      energy_baseline: 0.7,
      recovery_speed: 0.7,
      risk_tolerance: 0.6
    }
  },

  {
    role_id: 'customer-success-manager',
    title: 'Customer Success Manager',
    category: 'sales',
    description: 'Ensures customer satisfaction and drives product adoption. Builds lasting relationships and advocates for customer needs.',

    required_genius: {
      primary: ['enablement', 'galvanizing', 'discernment'],
      secondary: ['wonder', 'tenacity']
    },

    ideal_big_five: {
      openness: { min: 60, max: 85, weight: 0.7 },
      conscientiousness: { min: 65, max: 90, weight: 0.8 },
      extraversion: { min: 70, max: 95, weight: 0.9 },
      agreeableness: { min: 70, max: 95, weight: 1.0 },
      neuroticism: { min: 15, max: 35, weight: 0.8 }
    },

    mbti_preferences: {
      EI: 'E',
      SN: 'neutral',
      TF: 'F',
      JP: 'neutral'
    },

    flow_triggers_needed: [
      'Helping customers succeed',
      'Building relationships',
      'Problem-solving for clients',
      'Seeing customer wins'
    ],

    energy_profile: {
      high_energy_tasks: ['Customer calls', 'Success planning', 'Relationship building'],
      low_energy_tasks: ['Escalation management', 'Administrative tasks', 'Reporting'],
      autonomy_level: 'medium',
      collaboration_level: 'high'
    },

    typical_tasks: [
      { task: 'Customer check-ins and support', frequency: 'daily', complexity: 'medium', energy_requirement: 'high' },
      { task: 'Onboard new customers', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Track customer health metrics', frequency: 'weekly', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Handle escalations', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Collaborate with product and sales', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' }
    ],

    derived_traits_weight: {
      stress_resilience: 0.8,
      optimism: 0.9,
      flow_tendency: 0.6,
      collaboration_preference: 0.9,
      structure_need: 0.6,
      energy_baseline: 0.8,
      recovery_speed: 0.7,
      risk_tolerance: 0.5
    }
  },

  {
    role_id: 'technical-writer',
    title: 'Technical Writer',
    category: 'engineering',
    description: 'Creates clear documentation for technical products. Translates complex concepts into understandable content.',

    required_genius: {
      primary: ['wonder', 'enablement', 'discernment'],
      secondary: ['invention', 'tenacity']
    },

    ideal_big_five: {
      openness: { min: 65, max: 90, weight: 0.8 },
      conscientiousness: { min: 70, max: 95, weight: 0.9 },
      extraversion: { min: 35, max: 70, weight: 0.4 },
      agreeableness: { min: 60, max: 85, weight: 0.7 },
      neuroticism: { min: 20, max: 45, weight: 0.6 }
    },

    mbti_preferences: {
      EI: 'I',
      SN: 'N',
      TF: 'neutral',
      JP: 'J'
    },

    flow_triggers_needed: [
      'Writing clear documentation',
      'Organizing information',
      'Learning new technologies',
      'Improving user understanding'
    ],

    energy_profile: {
      high_energy_tasks: ['Writing documentation', 'Information architecture', 'User research'],
      low_energy_tasks: ['Endless revisions', 'Meeting overload', 'Formatting tasks'],
      autonomy_level: 'high',
      collaboration_level: 'medium'
    },

    typical_tasks: [
      { task: 'Write and update documentation', frequency: 'daily', complexity: 'high', energy_requirement: 'high' },
      { task: 'Collaborate with engineers', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Organize information architecture', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Review and edit content', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'User testing of documentation', frequency: 'monthly', complexity: 'medium', energy_requirement: 'medium' }
    ],

    derived_traits_weight: {
      stress_resilience: 0.6,
      optimism: 0.7,
      flow_tendency: 0.8,
      collaboration_preference: 0.6,
      structure_need: 0.8,
      energy_baseline: 0.6,
      recovery_speed: 0.6,
      risk_tolerance: 0.5
    }
  },

  {
    role_id: 'business-analyst',
    title: 'Business Analyst',
    category: 'operations',
    description: 'Analyzes business processes and requirements. Bridges business needs with technical solutions.',

    required_genius: {
      primary: ['discernment', 'wonder', 'enablement'],
      secondary: ['invention', 'tenacity']
    },

    ideal_big_five: {
      openness: { min: 60, max: 85, weight: 0.7 },
      conscientiousness: { min: 70, max: 95, weight: 0.9 },
      extraversion: { min: 45, max: 75, weight: 0.6 },
      agreeableness: { min: 60, max: 85, weight: 0.7 },
      neuroticism: { min: 20, max: 45, weight: 0.7 }
    },

    mbti_preferences: {
      EI: 'neutral',
      SN: 'N',
      TF: 'T',
      JP: 'J'
    },

    flow_triggers_needed: [
      'Analyzing complex problems',
      'Defining requirements',
      'Process improvement',
      'Stakeholder alignment'
    ],

    energy_profile: {
      high_energy_tasks: ['Business analysis', 'Requirements gathering', 'Process mapping'],
      low_energy_tasks: ['Status meetings', 'Routine reporting', 'Administrative tasks'],
      autonomy_level: 'medium',
      collaboration_level: 'high'
    },

    typical_tasks: [
      { task: 'Gather and document requirements', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Analyze business processes', frequency: 'weekly', complexity: 'high', energy_requirement: 'high' },
      { task: 'Stakeholder meetings', frequency: 'daily', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Create process documentation', frequency: 'weekly', complexity: 'medium', energy_requirement: 'medium' },
      { task: 'Support implementation', frequency: 'weekly', complexity: 'medium', energy_requirement: 'medium' }
    ],

    derived_traits_weight: {
      stress_resilience: 0.7,
      optimism: 0.7,
      flow_tendency: 0.7,
      collaboration_preference: 0.8,
      structure_need: 0.9,
      energy_baseline: 0.7,
      recovery_speed: 0.7,
      risk_tolerance: 0.6
    }
  }
];

// Helper function to get role by ID
export function getRoleById(roleId: string): RoleArchetype | undefined {
  return roleArchetypes.find(role => role.role_id === roleId);
}

// Helper function to get roles by category
export function getRolesByCategory(category: RoleArchetype['category']): RoleArchetype[] {
  return roleArchetypes.filter(role => role.category === category);
}

// Helper function to get all categories
export function getAllCategories(): RoleArchetype['category'][] {
  return ['engineering', 'design', 'product', 'data', 'marketing', 'sales', 'operations', 'leadership'];
}
