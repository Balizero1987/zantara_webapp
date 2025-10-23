// ZANTARA Team Configuration
// All Bali Zero collaborators with roles and permissions

export const TEAM_MEMBERS = {
  // Management & Leadership
  'zero@balizero.com': {
    id: 'zero',
    name: 'Zero Master',
    role: 'CEO',
    department: 'management',
    badge: '👑',
    permissions: ['admin', 'all_dashboards', 'financial_data', 'team_management'],
    welcomeMessage: 'Welcome back Zero! Ready to scale Bali Zero to infinity? ∞',
    dashboardWidgets: ['revenue_overview', 'team_performance', 'client_pipeline', 'ai_insights']
  },

  'boss@balizero.com': {
    id: 'boss',
    name: 'Boss',
    role: 'The Bridge - Leadership',
    department: 'management',
    badge: '🌀',
    permissions: ['admin', 'strategic_planning', 'team_coordination'],
    welcomeMessage: 'Benvenuto Boss! Quale visione strategica esploriamo oggi?',
    dashboardWidgets: ['strategic_overview', 'team_synergy', 'innovation_tracker']
  },

  // Setup & Operations Team
  'adit@balizero.com': {
    id: 'adit',
    name: 'ADIT',
    role: 'Supervisor - Setup',
    department: 'setup',
    badge: '⚡',
    permissions: ['setup_management', 'client_applications', 'team_supervision'],
    welcomeMessage: 'Halo Adit! Ada aplikasi visa atau company yang perlu di-handle hari ini?',
    dashboardWidgets: ['active_applications', 'team_workload', 'priority_cases', 'completion_rates']
  },

  'anton@balizero.com': {
    id: 'anton',
    name: 'ANTON',
    role: 'Executive - Setup',
    department: 'setup',
    badge: '🎯',
    permissions: ['client_management', 'application_processing'],
    welcomeMessage: 'Ciao Anton! Quali decisioni strategiche prendiamo oggi per i client?',
    dashboardWidgets: ['client_pipeline', 'application_status', 'urgent_tasks']
  },

  'krishna@balizero.com': {
    id: 'krishna',
    name: 'KRISHNA',
    role: 'Executive - Setup',
    department: 'setup',
    badge: '✅',
    permissions: ['checklist_management', 'quality_control'],
    welcomeMessage: 'Hi Krishna! Checklist master, cosa dobbiamo completare oggi?',
    dashboardWidgets: ['checklist_overview', 'completion_tracker', 'quality_metrics']
  },

  'ari@balizero.com': {
    id: 'ari',
    name: 'ARI',
    role: 'Team Leader - Setup',
    department: 'setup',
    badge: '💍',
    permissions: ['team_leadership', 'milestone_tracking', 'project_coordination'],
    welcomeMessage: 'Selamat datang Ari! Milestone apa yang kita capai hari ini?',
    dashboardWidgets: ['milestone_tracker', 'team_progress', 'project_timeline']
  },

  'surya@balizero.com': {
    id: 'surya',
    name: 'SURYA',
    role: 'Team Leader - Setup',
    department: 'setup',
    badge: '📚',
    permissions: ['training', 'knowledge_management', 'process_optimization'],
    welcomeMessage: 'Namaste Surya! Pronto per una lezione di efficienza oggi?',
    dashboardWidgets: ['knowledge_base', 'training_progress', 'process_efficiency']
  },

  // Tax Department
  'angel@balizero.com': {
    id: 'angel',
    name: 'ANGEL',
    role: 'Tax Lead',
    department: 'tax',
    badge: '🔎',
    permissions: ['tax_management', 'npwp_processing', 'compliance_oversight'],
    welcomeMessage: 'Hello Angel! Ready untuk handle urusan pajak dan NPWP hari ini?',
    dashboardWidgets: ['tax_applications', 'compliance_status', 'npwp_tracker', 'deadline_alerts']
  },

  'veronika@balizero.com': {
    id: 'veronika',
    name: 'VERONIKA',
    role: 'Tax Manager',
    department: 'tax',
    badge: '📊',
    permissions: ['tax_strategy', 'client_consulting', 'regulatory_compliance'],
    welcomeMessage: 'Добро пожаловать Veronika! Які податкові питання вирішуємо сьогодні?',
    dashboardWidgets: ['tax_consulting', 'client_portfolios', 'regulatory_updates', 'revenue_tracking']
  },

  'dewa_ayu@balizero.com': {
    id: 'dewa_ayu',
    name: 'DEWA AYU',
    role: 'Tax Lead',
    department: 'tax',
    badge: '🗂️',
    permissions: ['document_management', 'tax_filing', 'client_coordination'],
    welcomeMessage: 'Selamat pagi Dewa Ayu! Dokumen pajak apa yang perlu kita urus?',
    dashboardWidgets: ['document_tracker', 'filing_deadlines', 'client_communications']
  },

  'faisha@balizero.com': {
    id: 'faisha',
    name: 'FAISHA',
    role: 'Take Care - Tax',
    department: 'tax',
    badge: '🧾',
    permissions: ['client_support', 'tax_calculations', 'document_preparation'],
    welcomeMessage: 'Assalamualaikum Faisha! Siap bantu client dengan perhitungan pajak?',
    dashboardWidgets: ['client_support', 'tax_calculator', 'document_prep']
  },

  'kadek@balizero.com': {
    id: 'kadek',
    name: 'KADEK',
    role: 'Tax Lead',
    department: 'tax',
    badge: '📐',
    permissions: ['methodical_processing', 'systematic_analysis'],
    welcomeMessage: 'Om Swastiastu Kadek! Metode sistematis apa yang kita terapkan hari ini?',
    dashboardWidgets: ['systematic_analysis', 'process_optimization', 'accuracy_metrics']
  },

  // Advisory & Consulting
  'marta@balizero.com': {
    id: 'marta',
    name: 'MARTA',
    role: 'Advisory - Setup (🇺🇦)',
    department: 'advisory',
    badge: '🧐',
    permissions: ['strategic_advisory', 'market_analysis', 'client_consulting'],
    welcomeMessage: 'Вітаю Marta! Готові до стратегічного аналізу та консультацій?',
    dashboardWidgets: ['market_analysis', 'strategic_insights', 'client_advisory', 'trend_analysis']
  },

  'olena@balizero.com': {
    id: 'olena',
    name: 'OLENA',
    role: 'Advisory - Tax (🇺🇦)',
    department: 'advisory',
    badge: '🌐',
    permissions: ['tax_strategy', 'international_compliance', 'strategic_planning'],
    welcomeMessage: 'Привіт Olena! Яку стратегію податкового планування розробляємо?',
    dashboardWidgets: ['tax_strategy', 'international_compliance', 'strategic_planning']
  },

  'ruslana@balizero.com': {
    id: 'ruslana',
    name: 'RUSLANA',
    role: 'Regina - Ukraine',
    department: 'advisory',
    badge: '👑',
    permissions: ['executive_decisions', 'team_motivation', 'cultural_leadership'],
    welcomeMessage: 'Слава Україні, Ruslana! Готові надихнути команду на нові звершення?',
    dashboardWidgets: ['team_morale', 'cultural_initiatives', 'leadership_metrics']
  },

  // Marketing & Communications
  'nina@balizero.com': {
    id: 'nina',
    name: 'NINA',
    role: 'Supervisor - Marketing',
    department: 'marketing',
    badge: '🎤',
    permissions: ['marketing_campaigns', 'content_creation', 'brand_management'],
    welcomeMessage: 'Hello Nina! Ready to create inspiring content yang motivasi team dan client?',
    dashboardWidgets: ['campaign_performance', 'content_calendar', 'brand_metrics', 'engagement_stats']
  },

  'sahira@balizero.com': {
    id: 'sahira',
    name: 'SAHIRA',
    role: 'Junior - Marketing',
    department: 'marketing',
    badge: '🌟',
    permissions: ['content_support', 'social_media', 'creative_assistance'],
    welcomeMessage: 'Hai Sahira! Siap untuk creative collaboration dan positive vibes hari ini?',
    dashboardWidgets: ['creative_projects', 'social_media_stats', 'learning_progress', 'support_needed']
  },

  // Reception & Client Relations
  'rina@balizero.com': {
    id: 'rina',
    name: 'RINA',
    role: 'Reception',
    department: 'reception',
    badge: '🌸',
    permissions: ['client_relations', 'appointment_management', 'first_contact'],
    welcomeMessage: 'Selamat pagi Rina! Siap memberikan pelayanan terbaik untuk client hari ini?',
    dashboardWidgets: ['appointment_calendar', 'client_inquiries', 'first_impressions', 'satisfaction_scores']
  },

  // Creative & Innovation
  'vino@balizero.com': {
    id: 'vino',
    name: 'VINO',
    role: 'Junior - Setup',
    department: 'setup',
    badge: '🎨',
    permissions: ['creative_solutions', 'innovation_projects', 'out_of_box_thinking'],
    welcomeMessage: 'Hey Vino! Ide kreatif out-of-the-box apa yang kita explore hari ini?',
    dashboardWidgets: ['creative_projects', 'innovation_tracker', 'idea_pipeline', 'experimentation']
  },

  // Executive Support
  'amanda@balizero.com': {
    id: 'amanda',
    name: 'AMANDA',
    role: 'Executive - Setup',
    department: 'setup',
    badge: '📒',
    permissions: ['executive_support', 'documentation', 'organization'],
    welcomeMessage: 'Hi Amanda! Siap organize dan dokumentasi semua dengan detail dan emoji? 📝',
    dashboardWidgets: ['organization_tools', 'documentation_status', 'executive_calendar', 'task_lists']
  },

  'dea@balizero.com': {
    id: 'dea',
    name: 'DEA',
    role: 'Executive - Setup',
    department: 'setup',
    badge: '✨',
    permissions: ['positive_energy', 'team_motivation', 'client_happiness'],
    welcomeMessage: 'Ciao DEA! Ready to spread positive energy dan make everyone smile? ✨',
    dashboardWidgets: ['team_happiness', 'positive_metrics', 'client_satisfaction', 'energy_tracker']
  }
};

// Department Configurations
export const DEPARTMENTS = {
  management: {
    name: 'Management & Leadership',
    color: '#6366f1',
    icon: '👑',
    channels: ['#management', '#strategic-planning', '#leadership']
  },
  setup: {
    name: 'Setup & Operations',
    color: '#10b981',
    icon: '⚡',
    channels: ['#setup-team', '#operations', '#client-applications']
  },
  tax: {
    name: 'Tax Department',
    color: '#f59e0b',
    icon: '📊',
    channels: ['#tax-team', '#compliance', '#npwp-processing']
  },
  advisory: {
    name: 'Advisory & Consulting',
    color: '#8b5cf6',
    icon: '🧐',
    channels: ['#advisory', '#consulting', '#strategy']
  },
  marketing: {
    name: 'Marketing & Communications',
    color: '#ef4444',
    icon: '🎤',
    channels: ['#marketing', '#content-creation', '#campaigns']
  },
  reception: {
    name: 'Reception & Client Relations',
    color: '#06b6d4',
    icon: '🌸',
    channels: ['#reception', '#client-relations', '#first-contact']
  }
};

// Role-based permissions
export const PERMISSIONS = {
  admin: ['all_access', 'user_management', 'system_settings'],
  supervisor: ['team_oversight', 'performance_metrics', 'resource_allocation'],
  lead: ['project_management', 'team_coordination', 'quality_control'],
  executive: ['strategic_input', 'client_management', 'decision_making'],
  junior: ['task_execution', 'learning_access', 'collaboration_tools'],
  reception: ['client_interface', 'scheduling', 'first_contact_management']
};

// Dashboard widgets per role
export const DASHBOARD_WIDGETS = {
  // Management widgets
  revenue_overview: { name: 'Revenue Overview', icon: '💰', department: 'management' },
  team_performance: { name: 'Team Performance', icon: '📈', department: 'management' },
  strategic_overview: { name: 'Strategic Overview', icon: '🎯', department: 'management' },

  // Setup widgets
  active_applications: { name: 'Active Applications', icon: '📋', department: 'setup' },
  client_pipeline: { name: 'Client Pipeline', icon: '🚀', department: 'setup' },
  completion_rates: { name: 'Completion Rates', icon: '✅', department: 'setup' },

  // Tax widgets
  tax_applications: { name: 'Tax Applications', icon: '📄', department: 'tax' },
  compliance_status: { name: 'Compliance Status', icon: '✔️', department: 'tax' },
  npwp_tracker: { name: 'NPWP Tracker', icon: '🆔', department: 'tax' },

  // Marketing widgets
  campaign_performance: { name: 'Campaign Performance', icon: '📊', department: 'marketing' },
  content_calendar: { name: 'Content Calendar', icon: '📅', department: 'marketing' },
  engagement_stats: { name: 'Engagement Stats', icon: '👥', department: 'marketing' },

  // Universal widgets
  ai_insights: { name: 'AI Insights', icon: '🧠', department: 'all' },
  team_chat: { name: 'Team Chat', icon: '💬', department: 'all' },
  knowledge_base: { name: 'Knowledge Base', icon: '📚', department: 'all' }
};

// Auto-detection function
export function detectTeamMember(email, userAgent = '', ip = '') {
  // Direct email match
  if (TEAM_MEMBERS[email]) {
    return TEAM_MEMBERS[email];
  }

  // Fallback for common email variations
  const emailVariations = {
    'adit@balizero.id': 'adit@balizero.com',
    'zero@bali-zero.com': 'zero@balizero.com',
    // Add more variations as needed
  };

  const normalizedEmail = emailVariations[email] || email;
  return TEAM_MEMBERS[normalizedEmail] || null;
}

// Generate welcome message with current context
export function generateWelcomeMessage(member, timeOfDay = 'morning') {
  const greetings = {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening'
  };

  const greeting = greetings[timeOfDay] || 'Hello';
  return `${greeting} ${member.name}! ${member.welcomeMessage}`;
}

// Get department members
export function getDepartmentMembers(department) {
  return Object.values(TEAM_MEMBERS).filter(member => member.department === department);
}

// Get user permissions
export function getUserPermissions(member) {
  return member.permissions || [];
}

// Check if user has permission
export function hasPermission(member, permission) {
  return getUserPermissions(member).includes(permission) ||
         getUserPermissions(member).includes('admin');
}