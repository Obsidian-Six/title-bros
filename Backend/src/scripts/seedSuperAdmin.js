import 'dotenv/config';
import mongoose from 'mongoose';
import User, { USER_ROLES, USER_STATUS } from '../models/User.js';
import LoanApplication, { LOAN_STATUS } from '../models/LoanApplication.js';
import CommunicationLog from '../models/CommunicationLog.js';

const seedData = async () => {
  try {
    console.log('[Seeder] Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seeder] MongoDB connected.');

    // 1. Seed or update Super Admin
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@titlebros.com').toLowerCase();
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@2026!';
    let superAdmin = await User.findOne({ email: superAdminEmail });

    if (!superAdmin) {
      superAdmin = await User.create({
        name: 'Super Administrator',
        email: superAdminEmail,
        password: superAdminPassword,
        role: USER_ROLES.SUPER_ADMIN,
        status: USER_STATUS.ACTIVE,
      });
      console.log(`[Seeder] Created Super Admin: ${superAdmin.email}`);
    } else {
      superAdmin.role = USER_ROLES.SUPER_ADMIN;
      superAdmin.status = USER_STATUS.ACTIVE;
      superAdmin.password = superAdminPassword;
      await superAdmin.save();
      console.log(`[Seeder] Verified Super Admin: ${superAdmin.email}`);
    }

    // 2. Seed or update Staff Admin (Loan Officer)
    const staffAdminEmail = 'admin@titlebros.com';
    const staffAdminPassword = 'AdminPass@2026!';
    let staffAdmin = await User.findOne({ email: staffAdminEmail });

    if (!staffAdmin) {
      staffAdmin = await User.create({
        name: 'Title Bros Staff Admin',
        email: staffAdminEmail,
        password: staffAdminPassword,
        role: USER_ROLES.ADMIN,
        status: USER_STATUS.ACTIVE,
        phone: '(702) 555-0100',
      });
      console.log(`[Seeder] Created Staff Admin: ${staffAdmin.email}`);
    } else {
      staffAdmin.role = USER_ROLES.ADMIN;
      staffAdmin.status = USER_STATUS.ACTIVE;
      staffAdmin.password = staffAdminPassword;
      await staffAdmin.save();
      console.log(`[Seeder] Verified Staff Admin: ${staffAdmin.email}`);
    }

    // 3. Seed Sample Borrowers
    const borrowers = [
      { name: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '(702) 555-0144' },
      { name: 'Marcus Rodriguez', email: 'marcus.r@example.com', phone: '(702) 555-0188' },
      { name: 'Emily Watson', email: 'emily.w@example.com', phone: '(702) 555-0177' },
      { name: 'David Kim', email: 'david.k@example.com', phone: '(702) 555-0199' },
      { name: 'James Wilson', email: 'james.w@example.com', phone: '(702) 555-0122' },
    ];

    const customerMap = {};
    for (const b of borrowers) {
      let user = await User.findOne({ email: b.email });
      if (!user) {
        user = await User.create({
          name: b.name,
          email: b.email,
          phone: b.phone,
          password: 'CustomerPass@2026!',
          role: USER_ROLES.CUSTOMER,
          status: USER_STATUS.ACTIVE,
        });
      }
      customerMap[b.email] = user._id;
    }

    // 4. Seed Loan Applications for each status if none exist
    const existingLoansCount = await LoanApplication.countDocuments();
    if (existingLoansCount <= 1) {
      console.log('[Seeder] Adding sample loan applications for every status...');

      // Under Review application
      await LoanApplication.create({
        customer: customerMap['marcus.r@example.com'],
        firstName: 'Marcus',
        lastName: 'Rodriguez',
        email: 'marcus.r@example.com',
        phone: '(702) 555-0188',
        vehicle: {
          year: 2019,
          make: 'Chevrolet',
          model: 'Silverado 1500',
          estimatedValue: 24000,
          condition: 'Good',
        },
        amountRequested: 8500,
        reasonForFunds: 'Commercial plumbing equipment purchase',
        employmentStatus: 'Self-Employed',
        zipCode: '89109',
        status: LOAN_STATUS.UNDER_REVIEW,
        assignedTo: staffAdmin._id,
        internalNotes: [
          {
            authorName: 'Title Bros Staff Admin',
            note: 'Title check clean in Nevada DMV registry. Verification underway.',
            createdAt: new Date(),
          },
        ],
        statusHistory: [
          { toStatus: LOAN_STATUS.NEW, changedByName: 'Marcus Rodriguez' },
          { toStatus: LOAN_STATUS.UNDER_REVIEW, changedByName: 'Title Bros Staff Admin', note: 'Assigned for assessment' },
        ],
      });

      // Pending Documents application
      await LoanApplication.create({
        customer: customerMap['emily.w@example.com'],
        firstName: 'Emily',
        lastName: 'Watson',
        email: 'emily.w@example.com',
        phone: '(702) 555-0177',
        vehicle: {
          year: 2020,
          make: 'Ford',
          model: 'Explorer XLT',
          estimatedValue: 21000,
          condition: 'Excellent',
        },
        amountRequested: 6200,
        reasonForFunds: 'Home repair',
        employmentStatus: 'Employed Full-Time',
        zipCode: '89104',
        status: LOAN_STATUS.PENDING_DOCUMENTS,
        requestedDocuments: ['Vehicle Title (Pink Slip)', 'Proof of Income / Pay Stub'],
        statusHistory: [
          { toStatus: LOAN_STATUS.NEW, changedByName: 'Emily Watson' },
          { toStatus: LOAN_STATUS.PENDING_DOCUMENTS, changedByName: 'Super Administrator', note: 'Requested pink slip and pay stub' },
        ],
      });

      // Approved application
      await LoanApplication.create({
        customer: customerMap['david.k@example.com'],
        firstName: 'David',
        lastName: 'Kim',
        email: 'david.k@example.com',
        phone: '(702) 555-0199',
        vehicle: {
          year: 2018,
          make: 'Toyota',
          model: 'RAV4 LE',
          estimatedValue: 17500,
          condition: 'Good',
        },
        amountRequested: 5000,
        reasonForFunds: 'Medical expenses',
        employmentStatus: 'Employed Full-Time',
        zipCode: '89101',
        status: LOAN_STATUS.APPROVED,
        approvedTerms: {
          loanAmount: 4800,
          interestRate: 18.0,
          repaymentMonths: 24,
          monthlyPayment: 239.60,
        },
        statusHistory: [
          { toStatus: LOAN_STATUS.NEW, changedByName: 'David Kim' },
          { toStatus: LOAN_STATUS.UNDER_REVIEW, changedByName: 'Title Bros Staff Admin' },
          { toStatus: LOAN_STATUS.APPROVED, changedByName: 'Title Bros Staff Admin', note: 'Approved for $4,800' },
        ],
      });

      // Rejected application
      await LoanApplication.create({
        customer: customerMap['james.w@example.com'],
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james.w@example.com',
        phone: '(702) 555-0122',
        vehicle: {
          year: 2011,
          make: 'Nissan',
          model: 'Altima',
          estimatedValue: 4000,
          condition: 'Fair',
        },
        amountRequested: 3000,
        reasonForFunds: 'Debt consolidation',
        employmentStatus: 'Part-Time',
        zipCode: '89115',
        status: LOAN_STATUS.REJECTED,
        rejectionReason: 'Vehicle value below minimum collateral threshold and existing lien noted on title.',
        statusHistory: [
          { toStatus: LOAN_STATUS.NEW, changedByName: 'James Wilson' },
          { toStatus: LOAN_STATUS.REJECTED, changedByName: 'Super Administrator', note: 'Vehicle value below collateral threshold' },
        ],
      });

      // Log sample communications
      await CommunicationLog.create([
        {
          recipient: 'marcus.r@example.com',
          channel: 'SMS',
          subject: 'Title Bros Application Received',
          message: 'Hi Marcus, your Title Bros loan application #TB-2019-SILV has been received and is under review.',
          status: 'SENT',
          sentByName: 'System Bot',
        },
        {
          recipient: 'emily.w@example.com',
          channel: 'EMAIL',
          subject: 'Action Required: Documents needed for your Title Bros loan',
          message: 'Please upload a photo of your Vehicle Title (Pink Slip) and latest pay stub.',
          status: 'SENT',
          sentByName: 'Super Administrator',
        },
        {
          recipient: 'david.k@example.com',
          channel: 'EMAIL',
          subject: 'Congratulations! Your Title Bros Loan is Approved',
          message: 'Your loan for $4,800 has been approved. Review your terms in the customer portal.',
          status: 'SENT',
          sentByName: 'Title Bros Staff Admin',
        },
      ]);

      console.log('[Seeder] Seeded sample applications across all statuses and communication logs.');
    }

    console.log('\n===============================================================');
    console.log('  SEEDING COMPLETE! READY FOR TESTING:');
    console.log('  1. Super Admin Portal:');
    console.log('     Email:    superadmin@titlebros.com');
    console.log('     Password: SuperAdmin@2026!');
    console.log('     Role:     SUPER_ADMIN (Full Root Access + Team Management)');
    console.log('  2. Staff Admin Portal:');
    console.log('     Email:    admin@titlebros.com');
    console.log('     Password: AdminPass@2026!');
    console.log('     Role:     ADMIN (Operational Loan Management)');
    console.log('===============================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error] ${error.message}`);
    process.exit(1);
  }
};

seedData();
