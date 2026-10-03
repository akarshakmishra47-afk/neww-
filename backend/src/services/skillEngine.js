const Opportunity = require('../models/Opportunity');

/**
 * Mapping of career goals to required skills with proficiency levels.
 * Covers common student career paths. Keys are case-insensitively matched.
 */
const CAREER_SKILLS_MAP = {
  'AI/ML Engineer': [
    { name: 'Python', required: 80 },
    { name: 'Machine Learning', required: 70 },
    { name: 'Deep Learning', required: 60 },
    { name: 'TensorFlow', required: 55 },
    { name: 'SQL', required: 50 },
    { name: 'Data Structures', required: 60 },
    { name: 'Statistics', required: 55 }
  ],
  'Data Scientist': [
    { name: 'Python', required: 80 },
    { name: 'Statistics', required: 75 },
    { name: 'SQL', required: 70 },
    { name: 'Machine Learning', required: 60 },
    { name: 'Data Visualization', required: 65 },
    { name: 'Pandas', required: 65 }
  ],
  'Software Developer': [
    { name: 'Data Structures', required: 80 },
    { name: 'Algorithms', required: 80 },
    { name: 'Java', required: 70 },
    { name: 'System Design', required: 55 },
    { name: 'SQL', required: 50 }
  ],
  'Web Developer': [
    { name: 'HTML/CSS', required: 80 },
    { name: 'JavaScript', required: 80 },
    { name: 'React', required: 65 },
    { name: 'Node.js', required: 60 },
    { name: 'SQL', required: 50 }
  ],
  'Backend Developer': [
    { name: 'Node.js', required: 75 },
    { name: 'Python', required: 65 },
    { name: 'SQL', required: 70 },
    { name: 'MongoDB', required: 60 },
    { name: 'System Design', required: 55 },
    { name: 'REST API Design', required: 65 }
  ],
  'Frontend Developer': [
    { name: 'HTML/CSS', required: 85 },
    { name: 'JavaScript', required: 85 },
    { name: 'React', required: 75 },
    { name: 'TypeScript', required: 60 },
    { name: 'UI/UX Design', required: 50 }
  ],
  'DevOps Engineer': [
    { name: 'Linux', required: 75 },
    { name: 'Docker', required: 70 },
    { name: 'Kubernetes', required: 60 },
    { name: 'CI/CD', required: 65 },
    { name: 'Python', required: 55 },
    { name: 'AWS', required: 60 }
  ],
  'Cybersecurity Engineer': [
    { name: 'Networking', required: 75 },
    { name: 'Linux', required: 70 },
    { name: 'Python', required: 60 },
    { name: 'Cryptography', required: 55 },
    { name: 'Security Analysis', required: 65 }
  ],
  'Mobile App Developer': [
    { name: 'React Native', required: 75 },
    { name: 'JavaScript', required: 75 },
    { name: 'Flutter', required: 65 },
    { name: 'Dart', required: 60 },
    { name: 'REST API Design', required: 55 }
  ],
  'Cloud Engineer': [
    { name: 'AWS', required: 75 },
    { name: 'Linux', required: 70 },
    { name: 'Docker', required: 65 },
    { name: 'Python', required: 55 },
    { name: 'Terraform', required: 55 }
  ]
};

/**
 * Compares student skill levels against target career requirements.
 * Returns structured gap data.
 */
const analyzeGaps = (studentSkills, targetSkills) => {
  return targetSkills.map(target => {
    const studentSkill = studentSkills.find(
      s => s.name.toLowerCase() === target.name.toLowerCase()
    );
    const current = studentSkill ? studentSkill.level : 0;
    const gap = Math.max(0, target.required - current);
    const status = current >= target.required ? 'READY' : 'GAP';

    return {
      name: target.name,
      current,
      required: target.required,
      gap,
      status
    };
  });
};

/**
 * Returns skill gap analysis for all of a student's career goals.
 */
const getSkillGapsForCareer = (student) => {
  const gaps = [];
  if (!student.careerGoals || student.careerGoals.length === 0) return gaps;

  student.careerGoals.forEach(goal => {
    // Case-insensitive match against map keys
    const key = Object.keys(CAREER_SKILLS_MAP).find(
      k => k.toLowerCase() === goal.toLowerCase() ||
           goal.toLowerCase().includes(k.toLowerCase()) ||
           k.toLowerCase().includes(goal.toLowerCase())
    );
    if (key) {
      gaps.push({
        career: key,
        skills: analyzeGaps(student.skills || [], CAREER_SKILLS_MAP[key])
      });
    }
  });

  return gaps;
};

module.exports = {
  getSkillGapsForCareer,
  CAREER_SKILLS_MAP
};
