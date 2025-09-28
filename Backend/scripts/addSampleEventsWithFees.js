// Backend/scripts/addSampleEventsWithFees.js
const mongoose = require('mongoose');
const Event = require('../models/Event');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sportnest', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample events with different registration fees
const sampleEvents = [
  {
    name: "Basketball Championship",
    description: "Annual basketball championship tournament with prizes for winners",
    venue: "Main Sports Complex",
    capacity: 50,
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    startTime: "09:00",
    endTime: "17:00",
    registrationFee: 500, // Rs. 500
    status: "approved"
  },
  {
    name: "Football Training Session",
    description: "Professional football training with certified coaches",
    venue: "Football Ground A",
    capacity: 30,
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    startTime: "14:00",
    endTime: "16:00",
    registrationFee: 300, // Rs. 300
    status: "approved"
  },
  {
    name: "Tennis Workshop",
    description: "Learn tennis fundamentals from professional instructors",
    venue: "Tennis Courts",
    capacity: 20,
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    startTime: "10:00",
    endTime: "12:00",
    registrationFee: 750, // Rs. 750
    status: "approved"
  },
  {
    name: "Swimming Competition",
    description: "Inter-club swimming competition with medals",
    venue: "Olympic Pool",
    capacity: 40,
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
    startTime: "08:00",
    endTime: "14:00",
    registrationFee: 400, // Rs. 400
    status: "approved"
  },
  {
    name: "Cricket Match",
    description: "Friendly cricket match between teams",
    venue: "Cricket Ground",
    capacity: 100,
    date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 4 weeks from now
    startTime: "15:00",
    endTime: "19:00",
    registrationFee: 200, // Rs. 200
    status: "approved"
  },
  {
    name: "Badminton Tournament",
    description: "Singles and doubles badminton tournament",
    venue: "Badminton Hall",
    capacity: 32,
    date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 5 weeks from now
    startTime: "09:00",
    endTime: "18:00",
    registrationFee: 600, // Rs. 600
    status: "approved"
  },
  {
    name: "Volleyball League",
    description: "Weekly volleyball league matches",
    venue: "Volleyball Court",
    capacity: 24,
    date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000), // 6 weeks from now
    startTime: "16:00",
    endTime: "20:00",
    registrationFee: 150, // Rs. 150
    status: "approved"
  },
  {
    name: "Table Tennis Championship",
    description: "Annual table tennis championship with trophies",
    venue: "Table Tennis Hall",
    capacity: 16,
    date: new Date(Date.now() + 49 * 24 * 60 * 60 * 1000), // 7 weeks from now
    startTime: "10:00",
    endTime: "16:00",
    registrationFee: 800, // Rs. 800
    status: "approved"
  },
  {
    name: "Free Yoga Session",
    description: "Complimentary yoga session for all members",
    venue: "Yoga Studio",
    capacity: 25,
    date: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000), // 8 weeks from now
    startTime: "07:00",
    endTime: "08:30",
    registrationFee: 0, // Free event
    status: "approved"
  },
  {
    name: "Athletics Meet",
    description: "Track and field athletics competition",
    venue: "Athletics Track",
    capacity: 60,
    date: new Date(Date.now() + 63 * 24 * 60 * 60 * 1000), // 9 weeks from now
    startTime: "08:00",
    endTime: "17:00",
    registrationFee: 350, // Rs. 350
    status: "approved"
  }
];

async function addSampleEventsWithFees() {
  try {
    console.log('Adding sample events with different registration fees...');
    
    // Add sample events
    const createdEvents = await Event.insertMany(sampleEvents);
    
    console.log(`Successfully added ${createdEvents.length} sample events:`);
    createdEvents.forEach(event => {
      console.log(`- ${event.name}: Rs. ${event.registrationFee} (${event.registrationFee === 0 ? 'Free' : 'Paid'})`);
    });
    
    console.log('\nSample events with registration fees added successfully!');
    console.log('You can now view these events in the ApprovedEvents page with different fees.');
    
  } catch (error) {
    console.error('Error adding sample events:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
addSampleEventsWithFees();
