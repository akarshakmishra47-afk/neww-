/**
 * End-to-end integration test for Student Opportunity Engine.
 * Run with: node test-e2e.js
 * 
 * Tests: Register → Login → Profile → Skills → Opportunities → Recommendations
 *        → Skill Gaps → Projects → Roadmap → Applications → Notifications → AI
 */

const BASE_URL = 'http://localhost:3000/api';

// Unique test email to avoid conflicts
const TEST_EMAIL = `e2e_${Date.now()}@test.com`;
const TEST_PASSWORD = 'TestPassword123!';
let TOKEN = null;
let STUDENT_ID = null;
let OPPORTUNITY_ID = null;
let APPLICATION_ID = null;

let passed = 0;
let failed = 0;
const results = [];

async function req(method, path, body, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const json = await res.json().catch(() => ({}));
  return { status: res.status, ...json };
}

function assert(label, condition, details = '') {
  if (condition) {
    passed++;
    results.push(`  ✅ ${label}`);
  } else {
    failed++;
    results.push(`  ❌ ${label}${details ? ` — ${details}` : ''}`);
  }
}

function section(name) {
  results.push(`\n━━━ ${name} ━━━`);
}

async function run() {
  console.log('🚀 Starting End-to-End Tests...\n');

  // ═══ AUTH ═══
  section('AUTHENTICATION');

  // 1. Register
  const reg = await req('POST', '/auth/register', {
    name: 'E2E Student',
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  }, false);
  assert('Register returns 201', reg.status === 201);
  assert('Register returns token', !!reg.data?.token);
  if (reg.data?.token) {
    TOKEN = reg.data.token;
    STUDENT_ID = reg.data._id;
  }

  // 2. Login
  const login = await req('POST', '/auth/login', { email: TEST_EMAIL, password: TEST_PASSWORD }, false);
  assert('Login returns 200', login.success === true);
  assert('Login returns token', !!login.data?.token);
  if (login.data?.token) TOKEN = login.data.token;

  // 3. Wrong password
  const badLogin = await req('POST', '/auth/login', { email: TEST_EMAIL, password: 'wrong' }, false);
  assert('Wrong password returns 401', badLogin.status === 401);

  // 4. Protected route without token
  const noAuth = await req('GET', '/student/profile', null, false);
  assert('No token blocked with 401', noAuth.status === 401);

  // 5. Get current user
  const me = await req('GET', '/auth/me');
  assert('GET /auth/me returns profile', me.success === true && me.data?.email === TEST_EMAIL);

  // ═══ PROFILE ═══
  section('STUDENT PROFILE');

  const profileUpdate = await req('PUT', '/student/profile', {
    name: 'E2E Student Updated',
    education: { degree: 'B.Tech', branch: 'Computer Science', college: 'Test Uni', year: 3, cgpa: 8.5 },
    interests: ['Machine Learning', 'Web Development'],
    careerGoals: ['AI/ML Engineer', 'Web Developer'],
    preferences: { remote: true, preferredOpportunityTypes: ['INTERNSHIP', 'HACKATHON'] }
  });
  assert('Profile update succeeds', profileUpdate.success === true);

  const profile = await req('GET', '/student/profile');
  assert('Profile retrieval succeeds', profile.success === true);
  assert('Profile has education', profile.data?.education?.degree === 'B.Tech');
  assert('Profile has career goals', Array.isArray(profile.data?.careerGoals) && profile.data.careerGoals.length > 0);

  // ═══ SKILLS ═══
  section('SKILLS');

  const skillsUpdate = await req('PUT', '/student/skills', {
    skills: [
      { name: 'Python', level: 60 },
      { name: 'JavaScript', level: 75 },
      { name: 'Machine Learning', level: 40 },
      { name: 'React', level: 55 }
    ]
  });
  assert('Skills update succeeds', skillsUpdate.success === true);
  assert('Skills array returned', Array.isArray(skillsUpdate.data) && skillsUpdate.data.length === 4);

  const skills = await req('GET', '/student/skills');
  assert('Skills retrieval succeeds', skills.success === true);
  assert('Skills has level field (not proficiency)', skills.data?.[0]?.level !== undefined);

  // Skill analysis
  const analysis = await req('GET', '/skills/student/skill-analysis');
  assert('Skill analysis works', analysis.success === true);
  assert('Skill analysis returns career gaps', Array.isArray(analysis.data));

  // Skill gaps
  const gaps = await req('GET', '/skills/student/skill-gaps');
  assert('Skill gaps endpoint works', gaps.success === true);
  assert('Skill gaps returns array', Array.isArray(gaps.data));

  // ═══ OPPORTUNITIES ═══
  section('OPPORTUNITIES');

  // Create a test opportunity
  const oppCreate = await req('POST', '/opportunities', {
    title: 'E2E Test Internship',
    description: 'A test internship for E2E testing purposes.',
    type: 'INTERNSHIP',
    organization: 'E2E Corp',
    skills: [
      { skill: 'Python', importance: 'required' },
      { skill: 'Machine Learning', importance: 'preferred' }
    ],
    careerDomains: ['AI/ML Engineer'],
    location: 'Remote',
    remote: true,
    tags: ['machine learning', 'python'],
    eligibility: { minimumCGPA: 7.0, minimumYear: 2 },
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE'
  });
  assert('Create opportunity succeeds', oppCreate.success === true);
  if (oppCreate.data?._id) OPPORTUNITY_ID = oppCreate.data._id;

  // List with pagination
  const opps = await req('GET', '/opportunities?type=INTERNSHIP&page=1&limit=5');
  assert('Opportunity list returns data', opps.success === true && Array.isArray(opps.data));
  assert('Opportunity list has pagination metadata', opps.pagination?.total !== undefined);

  // Get by ID
  if (OPPORTUNITY_ID) {
    const opp = await req('GET', `/opportunities/${OPPORTUNITY_ID}`);
    assert('Get opportunity by ID works', opp.success === true && opp.data?._id === OPPORTUNITY_ID);
  }

  // Search
  const search = await req('GET', '/search?q=python');
  assert('Search endpoint works', search.success === true);
  assert('Search returns results', Array.isArray(search.data));

  // ═══ RECOMMENDATIONS ═══
  section('RECOMMENDATIONS');

  // Refresh (regenerate for this student)
  const refresh = await req('POST', '/recommendations/refresh');
  assert('Recommendation refresh works', refresh.success === true);

  // Get recommendations
  const recs = await req('GET', '/recommendations?limit=10');
  assert('Get recommendations works', recs.success === true);
  assert('Recommendations data is array', Array.isArray(recs.data));

  if (recs.data?.length > 0) {
    const firstRec = recs.data[0];
    assert('Recommendation has matchScore', firstRec.matchScore != null);
    assert('Recommendation has breakdown', firstRec.breakdown != null);
    assert('Recommendation has matchedSkills array', Array.isArray(firstRec.matchedSkills));
    assert('Recommendation has missingSkills array', Array.isArray(firstRec.missingSkills));
    assert('Recommendation has reasons array', Array.isArray(firstRec.reasons));
    assert('matchScore is between 0 and 100', firstRec.matchScore >= 0 && firstRec.matchScore <= 100);
    assert('matchScore is not hardcoded', firstRec.matchScore !== 92 && firstRec.matchScore !== 87);
  }

  // Type filter
  const internshipRecs = await req('GET', '/recommendations?type=INTERNSHIP');
  assert('Recommendation type filter works', internshipRecs.success === true);

  // ═══ PROJECTS ═══
  section('PROJECTS');

  const projects = await req('GET', '/projects/recommended');
  assert('Project recommendations work', projects.success === true);
  assert('Projects returns array', Array.isArray(projects.data));

  // ═══ CAREER ROADMAP ═══
  section('CAREER ROADMAP');

  const roadmapGen = await req('POST', '/roadmap/generate', { targetCareer: 'AI/ML Engineer' });
  assert('Roadmap generation works', roadmapGen.success === true);
  assert('Roadmap has nodes', Array.isArray(roadmapGen.data?.nodes) && roadmapGen.data.nodes.length > 0);
  assert('Roadmap has targetCareer', roadmapGen.data?.targetCareer === 'AI/ML Engineer');

  const roadmap = await req('GET', '/roadmap');
  assert('Roadmap retrieval works', roadmap.success === true && Array.isArray(roadmap.data));

  if (roadmapGen.data?.nodes?.[0]) {
    const nodeTitle = roadmapGen.data.nodes[0].title;
    const progressUpdate = await req('PUT', '/roadmap/progress', {
      targetCareer: 'AI/ML Engineer',
      nodeTitle,
      status: 'completed'
    });
    assert('Roadmap progress update works', progressUpdate.success === true);
  }

  // ═══ APPLICATIONS ═══
  section('APPLICATIONS');

  if (OPPORTUNITY_ID) {
    // Save opportunity
    const saved = await req('POST', '/applications', {
      opportunityId: OPPORTUNITY_ID,
      status: 'SAVED'
    });
    assert('Save opportunity works', saved.success === true || saved.status === 201);
    if (saved.data?._id) APPLICATION_ID = saved.data._id;

    // Apply
    const applied = await req('POST', '/applications', {
      opportunityId: OPPORTUNITY_ID,
      status: 'APPLIED',
      notes: 'E2E test application'
    });
    assert('Apply to opportunity works', applied.success === true);

    // Get applications
    const apps = await req('GET', '/applications');
    assert('Get applications works', apps.success === true && Array.isArray(apps.data));
    assert('Application exists in list', apps.data?.some(a => a.opportunityId?._id === OPPORTUNITY_ID || a.opportunityId === OPPORTUNITY_ID));

    // Update status
    if (APPLICATION_ID) {
      const update = await req('PUT', `/applications/${APPLICATION_ID}`, { status: 'APPLIED' });
      assert('Update application status works', update.success === true);
    }
  }

  // ═══ NOTIFICATIONS ═══
  section('NOTIFICATIONS');

  const notifs = await req('GET', '/notifications');
  assert('Get notifications works', notifs.success === true && Array.isArray(notifs.data));
  assert('Has at least one notification (welcome)', notifs.data?.length >= 1);

  if (notifs.data?.length > 0) {
    const notifId = notifs.data[0]._id;
    const markRead = await req('PUT', `/notifications/${notifId}/read`);
    assert('Mark notification as read works', markRead.success === true);
    assert('Notification read flag is true', markRead.data?.read === true);
  }

  // Mark all read
  const markAll = await req('PUT', '/notifications/read-all');
  assert('Mark all read works', markAll.success === true);

  // ═══ DASHBOARD ═══
  section('DASHBOARD');

  const dashboard = await req('GET', '/dashboard');
  assert('Dashboard endpoint works', dashboard.success === true);
  assert('Dashboard has profileCompletion', dashboard.data?.profileCompletion != null);
  assert('Dashboard has topRecommendations', Array.isArray(dashboard.data?.topRecommendations));
  assert('Dashboard has skillGaps', Array.isArray(dashboard.data?.skillGaps));
  assert('Dashboard has applicationSummary', dashboard.data?.applicationSummary != null);

  // ═══ AI ASSISTANT ═══
  section('AI ASSISTANT');

  const ai = await req('POST', '/ai/chat', { message: 'What career should I pursue given my Python skills?' });
  // AI may fail if no API key configured
  if (ai.success === true) {
    assert('AI chat returns response', !!ai.data?.reply);
    assert('AI response is non-empty string', typeof ai.data?.reply === 'string' && ai.data.reply.length > 0);
  } else {
    results.push(`  ⚠️  AI chat unavailable (no API key configured) — ${ai.message || 'Check AI_API_KEY in .env'}`);
  }

  // ═══ SECURITY ═══
  section('SECURITY (Cross-student isolation)');

  // Register second student
  const student2Email = `e2e_s2_${Date.now()}@test.com`;
  const reg2 = await req('POST', '/auth/register', { name: 'Student 2', email: student2Email, password: 'pass12345' }, false);
  const token2 = reg2.data?.token;

  if (token2 && APPLICATION_ID) {
    // Try to access student 1's application with student 2's token
    const originalToken = TOKEN;
    TOKEN = token2;
    const crossAccess = await req('GET', `/applications/${APPLICATION_ID}`);
    assert('Student 2 cannot see Student 1 application', crossAccess.success === false || crossAccess.status === 404);
    TOKEN = originalToken;
  }

  // ═══ SUMMARY ═══
  console.log('\n' + results.join('\n'));
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Total: ${passed + failed} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
  console.log(`${'─'.repeat(60)}\n`);

  if (failed > 0) {
    console.log('⚠️  Some tests failed. Review the issues above.\n');
    process.exit(1);
  } else {
    console.log('🎉 All tests passed!\n');
    process.exit(0);
  }
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
