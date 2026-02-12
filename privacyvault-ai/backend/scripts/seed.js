const mongoose = require('mongoose');
const { env } = require('../src/config/env');
const { User } = require('../src/models/User');
const { Vault } = require('../src/models/Vault');
const { VaultMember } = require('../src/models/VaultMember');
const { Task } = require('../src/models/Task');
const { UserProgress } = require('../src/models/UserProgress');

async function seed() {
  await mongoose.connect(env.mongoUri, { dbName: 'privacyvault_ai' });

  await Promise.all([
    User.deleteMany({}),
    Vault.deleteMany({}),
    VaultMember.deleteMany({}),
    Task.deleteMany({}),
    UserProgress.deleteMany({})
  ]);

  const founder = await User.create({
    email: env.founderEmail,
    displayName: 'Founder',
    role: 'admin',
    plan: 'premium',
    onboardingCompleted: true
  });

  const user = await User.create({
    email: 'demo@privacyvault.ai',
    displayName: 'Demo User',
    role: 'user',
    plan: 'premium',
    onboardingCompleted: true
  });

  const vault = await Vault.create({
    ownerId: user._id,
    name: 'Demo Productivity Vault',
    theme: 'aurora',
    avatar: 'owl'
  });

  await VaultMember.create({
    vaultId: vault._id,
    userId: user._id,
    role: 'owner',
    acceptedAt: new Date()
  });

  await Task.create([
    {
      vaultId: vault._id,
      userId: user._id,
      type: 'text',
      prompt: 'Summarize my day and draft tomorrow plan',
      output: { text: 'Draft schedule generated.' },
      status: 'completed',
      metadata: { estimatedTimeSavedMinutes: 25 }
    },
    {
      vaultId: vault._id,
      userId: user._id,
      type: 'image',
      prompt: 'Extract invoice fields',
      output: { text: 'Invoice extracted.' },
      status: 'completed',
      metadata: { ocrText: 'Invoice #42', estimatedTimeSavedMinutes: 18 }
    }
  ]);

  await UserProgress.create({
    userId: user._id,
    currentStreak: 5,
    longestStreak: 12,
    badges: ['first-task', 'weekly-winner'],
    weeklyGoalMinutes: 120,
    weeklyCompletedMinutes: 90,
    productivityScore: 74
  });

  console.log('Seed complete');
  console.log({ founder: founder.email, demoUser: user.email, vaultId: vault._id.toString() });
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
