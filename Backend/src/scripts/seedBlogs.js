import 'dotenv/config';
import mongoose from 'mongoose';
import BlogPost from '../models/BlogPost.js';

const sampleBlogs = [
  {
    title: 'How Car Title Loans Work: A Comprehensive UK & International Guide',
    slug: 'how-car-title-loans-work-comprehensive-guide',
    category: 'Title Loans',
    description: 'Learn how to unlock your vehicle’s equity without handing over your keys. A transparent breakdown of loan terms, valuation, and repayment.',
    coverImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Oliver Wright',
      role: 'Head of Lending Operations',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    readTime: '5 min read',
    status: 'PUBLISHED',
    tags: ['Car Title Loans', 'Borrowing', 'Vehicle Valuation'],
    blocks: [
      {
        id: 'blk-1',
        type: 'heading',
        content: 'Unlocking Capital From Your Vehicle Without Losing Mobility',
        order: 0,
      },
      {
        id: 'blk-2',
        type: 'text',
        content: 'When unexpected financial needs arise, traditional bank loans can take weeks of underwriting, extensive credit checks, and endless paperwork. A car title loan offers a streamlined, asset-backed alternative by allowing you to borrow against the appraised equity of your car, truck, or SUV.',
        order: 1,
      },
      {
        id: 'blk-3',
        type: 'image',
        imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
        caption: 'Title loans evaluate the true market equity of your vehicle while allowing you to keep driving daily.',
        order: 2,
      },
      {
        id: 'blk-4',
        type: 'heading',
        content: 'The Four-Step Approval Process',
        order: 3,
      },
      {
        id: 'blk-5',
        type: 'text',
        content: 'At Title Bros, the journey from application to funding is designed to be frictionless. First, submit your basic vehicle details (year, make, model, mileage). Second, our algorithmic appraisal calculates your maximum loan amount. Third, upload your proof of ownership and photo ID. Once verified, funds are wired directly into your bank account within hours.',
        order: 4,
      },
      {
        id: 'blk-6',
        type: 'text',
        content: 'Crucially, you keep possession of your vehicle throughout the entire repayment cycle. Title Bros holds the lien notation until the balance is settled, ensuring your commute, family obligations, and daily lifestyle continue uninterrupted.',
        order: 5,
      },
    ],
  },
  {
    title: 'Top 7 Ways to Maximize Your Vehicle Equity Before an Appraisal',
    slug: 'maximize-vehicle-equity-before-appraisal',
    category: 'Vehicle Equity',
    description: 'Discover simple maintenance and presentation steps that can significantly raise your car’s valuation and qualify you for higher borrowing limits.',
    coverImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Marcus Vance',
      role: 'Senior Automotive Appraiser',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    readTime: '4 min read',
    status: 'PUBLISHED',
    tags: ['Maintenance', 'Equity', 'Appraisal'],
    blocks: [
      {
        id: 'blk-10',
        type: 'heading',
        content: 'The Art of Automotive Valuation',
        order: 0,
      },
      {
        id: 'blk-11',
        type: 'text',
        content: 'Vehicle valuation is both science and presentation. While algorithmic valuation models rely heavily on year, make, mileage, and historical market comps, visual condition and mechanical records play an immense role during final appraisal.',
        order: 1,
      },
      {
        id: 'blk-12',
        type: 'image',
        imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80',
        caption: 'A clean interior and verified service history can increase appraised value by up to 15%.',
        order: 2,
      },
      {
        id: 'blk-13',
        type: 'heading',
        content: 'Keep Organized Service Records',
        order: 3,
      },
      {
        id: 'blk-14',
        type: 'text',
        content: 'Having an up-to-date logbook or digital service history demonstrating regular oil changes, brake inspections, and scheduled maintenance immediately reassures underwriters. Even a brief professional detailing session can reveal pristine paint condition that translates into a noticeably higher loan offer.',
        order: 4,
      },
    ],
  },
  {
    title: 'Understanding Repayment Schedules and Low-Interest Options',
    slug: 'understanding-repayment-schedules-low-interest-options',
    category: 'Financial Tips',
    description: 'How to choose the ideal loan term, calculate monthly payments, and avoid prepayment penalties for a stress-free borrowing experience.',
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Sophia Patel',
      role: 'Financial Advisory Lead',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    },
    readTime: '4 min read',
    status: 'PUBLISHED',
    tags: ['Finance', 'Repayment', 'Budgeting'],
    blocks: [
      {
        id: 'blk-20',
        type: 'heading',
        content: 'Structuring a Loan That Works for Your Budget',
        order: 0,
      },
      {
        id: 'blk-21',
        type: 'text',
        content: 'Borrowing should be a tool that solves problems, not one that compounds stress. Choosing a realistic repayment schedule tailored to your monthly cash flow is the key to a healthy loan experience.',
        order: 1,
      },
      {
        id: 'blk-22',
        type: 'image',
        imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
        caption: 'Clear transparency and zero prepayment penalties empower borrowers to pay down balances faster.',
        order: 2,
      },
      {
        id: 'blk-23',
        type: 'text',
        content: 'At Title Bros, all loan proposals detail the exact annual percentage rate (APR), total interest payable, and monthly amortization upfront. We never charge hidden origination fees or prepayment penalties, meaning you can settle your loan early and save on interest at any time.',
        order: 3,
      },
    ],
  },
];

async function seed() {
  try {
    console.log('[Blog Seeder] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Blog Seeder] Connected to database.');

    for (const blog of sampleBlogs) {
      const existing = await BlogPost.findOne({ slug: blog.slug });
      if (!existing) {
        await BlogPost.create(blog);
        console.log(`[Blog Seeder] Created: "${blog.title}"`);
      } else {
        console.log(`[Blog Seeder] Blog already exists: "${blog.title}"`);
      }
    }

    console.log('[Blog Seeder] Blog seeding complete!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Blog Seeder] Error seeding blogs:', err);
    process.exit(1);
  }
}

seed();
