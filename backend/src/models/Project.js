const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  skills: [{ type: String }],
  careerDomains: [{ type: String }],
  estimatedDuration: { type: String },
  technologies: [{ type: String }],
  learningOutcomes: [{ type: String }],
  source: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);

