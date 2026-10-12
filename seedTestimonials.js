const mongoose = require('mongoose');
require('dotenv').config();
const Testimonial = require('./models/Testimonial');

const testimonials = [
  {
    name: 'AMITA MILGLORIA',
    title: 'GENUINE QUALITY',
    rating: 5,
    country: 'Uganda',
    avatar: 'AM',
    review: "I'm genuinely impressed with C-gas ,they consistently deliver on Time with prompt & dependable service backed by a friendly team.The gas they deliver meets high safety & purity standards.I highly recommend them",
    designation: 'Verified Customer',
    date: 'Posted recently',
    isApproved: true,
    isFeatured: false,
    sortOrder: 1
  },
  {
    name: 'SENYONDO ADAM',
    title: 'EXCELLENT SERVICE',
    rating: 5,
    country: 'Uganda',
    avatar: 'SA',
    review: 'I appreciate the excellent service from Conch Gas Ltd. They are always reliable, deliver on time, and provide quality gas for my store. Their customer care is professional and friendly especiallya lady called Hellen who i have never met but makes work easy for me when we call for business, making it easy to work with them. I highly recommend their services.',
    designation: 'Store Owner',
    date: 'Posted recently',
    isApproved: true,
    isFeatured: true,
    sortOrder: 2
  },
  {
    name: 'MBAGA SHABAN',
    title: 'EXCELLENT MANAGEMENT',
    rating: 5,
    country: 'Uganda',
    avatar: 'MS',
    review: 'Thank you so much Conch Gas Ltd Staffs and Management for the gas services, deliveries are Swift and timley... Ordered for a refill on a Sunday 🤔and yes it was delivered . I will forever remain a Royal customer.👌',
    designation: 'Verified Customer',
    date: 'Posted recently',
    isApproved: true,
    isFeatured: false,
    sortOrder: 3
  },
  {
    name: 'KASOZI BRIAN',
    title: 'FAST & SAFE DELIVERY',
    rating: 5,
    country: 'Uganda',
    avatar: 'KB',
    review: 'Conch Gas provides genuine weight cylinders and very prompt delivery in Kampala. The cylinder seal was intact and the technician helped connect and test for leaks properly.',
    designation: 'Verified Customer',
    date: 'Posted 1 week ago',
    isApproved: true,
    isFeatured: false,
    sortOrder: 4
  },
  {
    name: 'NANKUNDA GRACE',
    title: 'BEST LPG SUPPLIER IN UGANDA',
    rating: 5,
    country: 'Uganda',
    avatar: 'NG',
    review: 'Their customer care is always on point. Ordering refills through WhatsApp is seamless and they deliver promptly right to my kitchen.',
    designation: 'Verified Customer',
    date: 'Posted 2 weeks ago',
    isApproved: true,
    isFeatured: false,
    sortOrder: 5
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
  await Testimonial.deleteMany({});
  await Testimonial.insertMany(testimonials);
  console.log('Testimonials successfully seeded!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
