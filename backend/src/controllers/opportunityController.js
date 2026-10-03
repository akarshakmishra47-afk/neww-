const Opportunity = require('../models/Opportunity');

// Helper to fetch real-time authentic jobs
const fetchLiveJobs = async (limit = 5) => {
  try {
    const res = await fetch(`https://remotive.com/api/remote-jobs?limit=${limit}&category=software-dev`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.jobs.slice(0, limit).map(job => ({
      _id: `live_${job.id}`,
      title: job.title,
      type: 'JOB',
      organization: job.company_name,
      description: 'Authentic real-time opportunity fetched from Remotive API. ' + (job.description ? job.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' : ''),
      location: job.candidate_required_location || 'Remote',
      remote: true,
      skills: job.tags ? job.tags.slice(0, 3).map(t => ({ skill: t, importance: 'preferred' })) : [],
      careerDomains: ['Software Developer'],
      tags: job.tags ? job.tags.slice(0, 3) : [],
      stipend: job.salary || 'Not specified',
      status: 'ACTIVE',
      createdAt: job.publication_date,
      applyUrl: job.url
    }));
  } catch (err) {
    console.error('Failed to fetch live jobs:', err);
    return [];
  }
};

exports.getOpportunities = async (req, res) => {
  try {
    const { 
      page = 1, limit = 10, type, skill, career, 
      location, remote, status 
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (skill) query['skills.skill'] = new RegExp(skill, 'i');
    if (career) query.careerDomains = new RegExp(career, 'i');
    if (location) query.location = new RegExp(location, 'i');
    if (remote) query.remote = remote === 'true';
    
    // Only return active and unexpired opportunities unless specified otherwise
    if (status) {
      query.status = status;
    } else {
      query.status = 'ACTIVE';
      query.deadline = { $gte: new Date() };
    }

    let opportunities = await Opportunity.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean(); // Use lean to allow array spread modifications easily

    // Inject Real-time Authentic Jobs on the first page
    if (parseInt(page) === 1 && (!type || type.toUpperCase() === 'JOB' || type.toUpperCase() === 'INTERNSHIP')) {
      const liveJobs = await fetchLiveJobs(4); // Fetch 4 real-time jobs
      opportunities = [...liveJobs, ...opportunities];
    }

    const total = await Opportunity.countDocuments(query);

    res.json({
      success: true,
      data: opportunities,
      pagination: {
        total: total + 4,
        page: parseInt(page),
        pages: Math.ceil((total + 4) / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOpportunityById = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    res.json({ success: true, data: opportunity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.create(req.body);
    res.status(201).json({ success: true, data: opportunity, message: 'Opportunity created' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    res.json({ success: true, data: opportunity, message: 'Opportunity updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    res.json({ success: true, message: 'Opportunity deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
