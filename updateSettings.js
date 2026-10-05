const mongoose = require('mongoose');
require('dotenv').config();
const SiteSettings = require('./models/SiteSettings');

async function updateSettings() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const conchSettings = {
    companyName: 'Conch Gas Limited',
    siteTitle: 'Conch Gas Limited | LPG & Industrial Gas Supplier Kampala Uganda',
    tagline: 'Reliable, Safe & Fast LPG & Industrial Gas Solutions in Uganda',
    aboutText: 'Conch Gas Ltd. Is a part of Conch Group Limited And it is based on long-term experience and historical achievements in the fields of construction and contracting for a period of 15 years.',
    address: 'Plot 155, Kira Road near Kira Road Police Station P.O.Box 26105 Kampala- Uganda',
    phone: '+256 200 900 010',
    whatsapp: '+256 703 978 198',
    email: 'sales@conchgas.com',
    workingHours: 'Mon - Sat 08:00 - 20:00 (Sunday Delivery Available)',
    copyright: 'Copyright© © 2020 Conch Gas Limited - All Rights Reserved.',
    socialLinks: {
      facebook: 'https://facebook.com/conchgas',
      instagram: 'https://instagram.com/conchgas',
      twitter: 'https://twitter.com/conchgas',
      youtube: 'https://youtube.com/conchgas'
    }
  };

  let s = await SiteSettings.findOne();
  if (s) {
    Object.assign(s, conchSettings);
    await s.save();
    console.log('SiteSettings updated in DB!');
  } else {
    await SiteSettings.create(conchSettings);
    console.log('SiteSettings created in DB!');
  }

  process.exit(0);
}

updateSettings().catch(err => {
  console.error(err);
  process.exit(1);
});
