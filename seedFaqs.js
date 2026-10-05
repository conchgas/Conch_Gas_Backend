const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function updateFaqs() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
  const FAQ = require('./models/FAQ');
  const FaqHeader = require('./models/FaqHeader');

  const faqsData = [
    {
      question: 'What are the points to remember about Rubber Tubing?',
      answer: '<ul class="list-disc pl-5 space-y-1.5"><li>It must be of approved quality.</li><li>It should be as short as possible.</li><li>It should be easily accessible for inspection.</li><li>Keep it away from heat and fire.</li><li>Push it so as to cover the full length of the nozzle.</li><li>Make sure it does not get heated by the burner, or is looped/twisted.</li><li>Clean it with wet cloth only. Don’t use soap to ease the tube over the nozzle.</li><li>Check it regularly for cracks, holes, softness, and porosity especially at the ends.</li><li>Replace tubing every 2 years if not earlier.</li><li>Do not cover rubber tubing by any other object or sleeve.</li></ul>',
      sortOrder: 1,
      isActive: true
    },
    {
      question: 'The Pressure Regulator is Very Important Too',
      answer: 'It is connected to the outlet of the cylinder valve. Its function is to regulate the pressure of the gas coming out of the cylinder and supply it at a constant pressure to the hot plate.',
      sortOrder: 2,
      isActive: true
    },
    {
      question: 'To Light The Burners',
      answer: 'Turn the switch knob of the regulator anti-clockwise till it is in ON position. Hold a lighted matchstick near the burner head of the stove and turn the knob of the stove to ON position.',
      sortOrder: 3,
      isActive: true
    },
    {
      question: 'If You Smell Gas?',
      answer: '<ul class="list-disc pl-5 space-y-1.5"><li>Do not operate electrical switches.</li><li>Ensure that stove knobs are in OFF position.</li><li>Do not light a matchstick even to detect the leakage of LPG.</li><li>Switch OFF the pressure regulator by turning the knob clockwise to the OFF position.</li><li>Open all doors and windows.</li><li>If the smell persists, call your C-Gas distributor.</li><li>An experienced person can detach the regulator. Fix the safety cap on the valve.</li></ul>',
      sortOrder: 4,
      isActive: true
    },
    {
      question: 'Connecting the Filled Cylinder',
      answer: '<ul class="list-disc pl-5 space-y-1.5"><li>To remove the safety cap, press it down, PULL the cord and keeping it pulled, LIFT the cap off the valve of the cylinder.</li><li>Check whether sealing ring is in place inside the cylinder valve by feeling the same with the help of your little finger. Do not use the cylinder if the ring is missing, put back the safety cap and contact your distributor for replacement of cylinder.</li><li>To mount the regulator on the filled cylinder: Ensure switch knob of regulator is in OFF position. Grip regulator and pull up plastic bush. Place regulator vertically on valve and press down till its edge touches hexagon of valve with gentle swivel. Release black plastic bush and press down (you may hear click sound). Regulator is now locked on cylinder.</li></ul>',
      sortOrder: 5,
      isActive: true
    },
    {
      question: 'Disconnecting The Empty Cylinder',
      answer: '<ul class="list-disc pl-5 space-y-1.5"><li>Put out all the flames and fires including incense sticks, candle, lamp in the kitchen and adjoining rooms.</li><li>Close all the taps on the cooking stove.</li><li>Turn the switch knob of the regulator from ON position to OFF position.</li><li>Grip the regulator and pull the bush (black plastic locking ring) up and lift the regulator by giving a gentle swivel to detach from valve.</li><li>Place the delrin (plastic) safety cap on the valve of the cylinder. Press the cap firmly down until a distinct click is heard. Now the empty cylinder can be removed.</li></ul>',
      sortOrder: 6,
      isActive: true
    },
    {
      question: 'Safety Goes a Long Way (Good Habits for Your Safety)',
      answer: '<ul class="list-disc pl-5 space-y-1.5"><li>Do not wear nylon garments or similar fabric when cooking.</li><li>Never leave the cooking appliance unattended when in use.</li><li>Never try to Repair, Adjust or inspect any part of C-Gas Installation or allow fake mechanics to do so. Allow authorized engineers to inspect installation once in two years.</li><li>Do not use long curtains on windows near cooker.</li><li>Insist on redelivery check of refill cylinder at delivery.</li><li>Do not install cooking appliance on floor or on bare wooden table.</li><li>Never use C-Gas in a poorly ventilated room or cellar/basement.</li><li>No other heating device placed within one meter.</li><li>Never leave regulator in ON position overnight.</li><li>Always smell for leakage of LPG before lighting stove.</li><li>Never use rubber tube if it has cracks or is over 2 years old.</li></ul>',
      sortOrder: 7,
      isActive: true
    },
    {
      question: 'General Safety Health And Environment',
      answer: '<p class="mb-3">In C-GAS SAFETY, HEALTH & ENVIRONMENT is most important, and rightly so, in view of the ecological imbalance that the world is facing at large. C-Gas as a responsible Corporate Citizen is striving to strike a right balance between operating its business and maintaining a sense of harmony with its surroundings.</p><p class="mb-3">It is the PEOPLE who make their working environment safe by adopting safe work practices and it is these work practices that form a part of any Environment, Health & Safety (SH&E) Policy. The Objective of SH&E Policy is not only to bring about awareness, but to also promote a pollution free environment; and create a healthy surrounding and safe working conditions by constantly guiding all our actions within a consciously recognized and adopted set of standards.</p><p>The SAFETY, HEALTH & ENVIRONMENT Policy is a testimony to C-GAS’s Commitment towards protection of environment as we have a great responsibility to not only protect the health safety of our colleagues but also hand over a safe world to the future generation to come. We follow the SH&E Policy, not only in word but also in spirit, and actively contribute towards achieving its objectives.</p>',
      sortOrder: 8,
      isActive: true
    }
  ];

  await FAQ.deleteMany({});
  await FAQ.insertMany(faqsData);
  console.log('Inserted 8 Conch Gas safety FAQs');

  await FaqHeader.findOneAndUpdate({}, {
    title: 'Safety Guide & Frequently Asked Questions',
    subtitle: 'Important points to remember about rubber tubing, pressure regulator, cylinder exchange, and LPG handling.',
    bgImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80',
    metaViewTitle: 'Safety FAQs - Conch Gas Uganda',
    metaDescription: 'Frequently asked questions and safety guide for Conch Gas LPG cylinders, rubber tubing, and regulators.',
    metaKeywords: 'conch gas faq, lpg safety guide, gas cylinder regulator safety, kampala gas delivery'
  }, { upsert: true });
  console.log('Updated FaqHeader');

  process.exit(0);
}

updateFaqs().catch(err => {
  console.error(err);
  process.exit(1);
});
