require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const Opportunity = require('./src/models/Opportunity');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-opportunity-engine').then(async () => {
    const opps = await Opportunity.find({});
    console.log('Total:', opps.length);
    const hasPython = await Opportunity.find({ 'skills.skill': /python/i });
    console.log('Python matches:', hasPython.length);
    if(hasPython.length > 0) console.log(hasPython[0].skills);
    process.exit();
}).catch(console.log);
