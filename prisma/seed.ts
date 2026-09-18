import { PrismaClient } from '@prisma/client'
import { hash } from '@node-rs/argon2'

const prisma = new PrismaClient()

const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
}

// All permissions to seed
const ALL_PERMISSIONS = [
  { key: 'patients.view', description: 'View patients', descriptionAr: 'عرض المرضى', category: 'patients' },
  { key: 'patients.create', description: 'Create patients', descriptionAr: 'إضافة مرضى', category: 'patients' },
  { key: 'patients.update', description: 'Update patients', descriptionAr: 'تعديل المرضى', category: 'patients' },
  { key: 'patients.delete', description: 'Delete patients', descriptionAr: 'حذف المرضى', category: 'patients' },
  { key: 'appointments.view', description: 'View appointments', descriptionAr: 'عرض المواعيد', category: 'appointments' },
  { key: 'appointments.create', description: 'Create appointments', descriptionAr: 'إنشاء مواعيد', category: 'appointments' },
  { key: 'appointments.update', description: 'Update appointments', descriptionAr: 'تعديل المواعيد', category: 'appointments' },
  { key: 'appointments.delete', description: 'Delete appointments', descriptionAr: 'حذف المواعيد', category: 'appointments' },
  { key: 'doctors.view', description: 'View doctors', descriptionAr: 'عرض الأطباء', category: 'doctors' },
  { key: 'doctors.manage', description: 'Manage doctors', descriptionAr: 'إدارة الأطباء', category: 'doctors' },
  { key: 'services.view', description: 'View services', descriptionAr: 'عرض الخدمات', category: 'services' },
  { key: 'services.manage', description: 'Manage services', descriptionAr: 'إدارة الخدمات', category: 'services' },
  { key: 'website.view', description: 'View website', descriptionAr: 'عرض إعدادات الموقع', category: 'website' },
  { key: 'website.manage', description: 'Manage website', descriptionAr: 'إدارة الموقع', category: 'website' },
  { key: 'users.view', description: 'View team', descriptionAr: 'عرض أعضاء الفريق', category: 'users' },
  { key: 'users.manage', description: 'Manage team', descriptionAr: 'إدارة أعضاء الفريق', category: 'users' },
  { key: 'settings.view', description: 'View settings', descriptionAr: 'عرض إعدادات العيادة', category: 'settings' },
  { key: 'settings.manage', description: 'Manage settings', descriptionAr: 'إدارة إعدادات العيادة', category: 'settings' },
  { key: 'reports.view', description: 'View reports', descriptionAr: 'عرض التقارير', category: 'reports' },
]

// Default roles with their permission keys
const DEFAULT_ROLES = [
  {
    name: 'Owner',
    nameAr: 'مالك',
    permissions: ALL_PERMISSIONS.map((p) => p.key),
  },
  {
    name: 'Manager',
    nameAr: 'مدير',
    permissions: [
      'patients.view', 'patients.create', 'patients.update', 'patients.delete',
      'appointments.view', 'appointments.create', 'appointments.update', 'appointments.delete',
      'doctors.view', 'doctors.manage',
      'services.view', 'services.manage',
      'website.view', 'website.manage',
      'users.view',
      'settings.view',
      'reports.view',
    ],
  },
  {
    name: 'Doctor',
    nameAr: 'طبيب',
    permissions: [
      'patients.view', 'patients.update',
      'appointments.view', 'appointments.create', 'appointments.update',
      'doctors.view',
      'services.view',
      'website.view',
      'reports.view',
    ],
  },
  {
    name: 'Receptionist',
    nameAr: 'موظف استقبال',
    permissions: [
      'patients.view', 'patients.create', 'patients.update',
      'appointments.view', 'appointments.create', 'appointments.update',
      'services.view',
    ],
  },
  {
    name: 'Staff',
    nameAr: 'موظف',
    permissions: [
      'patients.view',
      'appointments.view',
      'services.view',
    ],
  },
]

// Default plans
const DEFAULT_PLANS = [
  { name: 'Free', nameAr: 'مجاني', slug: 'free', sortOrder: 0 },
  { name: 'Basic', nameAr: 'أساسي', slug: 'basic', sortOrder: 1 },
  { name: 'Professional', nameAr: 'احترافي', slug: 'professional', sortOrder: 2 },
  { name: 'Enterprise', nameAr: 'مؤسسي', slug: 'enterprise', sortOrder: 3 },
]

// Default website themes
const DEFAULT_THEMES = [
  { name: 'Modern Dental', nameAr: 'طب أسنان حديث', slug: 'modern-dental' },
  { name: 'Minimal Dental', nameAr: 'طب أسنان بسيط', slug: 'minimal-dental' },
  { name: 'Professional Medical', nameAr: 'طبي احترافي', slug: 'professional-medical' },
]

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Seed permissions
  console.log('  → Seeding permissions...')
  for (const perm of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { description: perm.description, descriptionAr: perm.descriptionAr, category: perm.category },
      create: perm,
    })
  }
  console.log(`  ✓ ${ALL_PERMISSIONS.length} permissions seeded`)

  // 2. Seed default roles (system roles with clinicId: null)
  console.log('  → Seeding default roles...')
  for (const role of DEFAULT_ROLES) {
    const existingRole = await prisma.role.findFirst({
      where: { name: role.name, clinicId: null },
    })

    let roleRecord
    if (existingRole) {
      roleRecord = await prisma.role.update({
        where: { id: existingRole.id },
        data: { nameAr: role.nameAr, isSystem: true },
      })
    } else {
      roleRecord = await prisma.role.create({
        data: {
          name: role.name,
          nameAr: role.nameAr,
          isSystem: true,
          clinicId: null,
        },
      })
    }

    // Clear existing role permissions and re-create
    await prisma.rolePermission.deleteMany({
      where: { roleId: roleRecord.id },
    })

    for (const permKey of role.permissions) {
      const permission = await prisma.permission.findUnique({
        where: { key: permKey },
      })
      if (permission) {
        await prisma.rolePermission.create({
          data: {
            roleId: roleRecord.id,
            permissionId: permission.id,
          },
        })
      }
    }
  }
  console.log(`  ✓ ${DEFAULT_ROLES.length} roles seeded`)

  // 3. Seed plans
  console.log('  → Seeding plans...')
  for (const plan of DEFAULT_PLANS) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: { name: plan.name, nameAr: plan.nameAr, sortOrder: plan.sortOrder },
      create: plan,
    })
  }
  console.log(`  ✓ ${DEFAULT_PLANS.length} plans seeded`)

  // 4. Seed website themes
  console.log('  → Seeding website themes...')
  for (const theme of DEFAULT_THEMES) {
    await prisma.websiteTheme.upsert({
      where: { slug: theme.slug },
      update: { name: theme.name, nameAr: theme.nameAr },
      create: theme,
    })
  }
  console.log(`  ✓ ${DEFAULT_THEMES.length} themes seeded`)

  // 5. Seed platform settings
  console.log('  → Seeding platform settings...')
  const existingSettings = await prisma.platformSettings.findFirst()
  if (!existingSettings) {
    await prisma.platformSettings.create({
      data: {
        platformName: 'DRS',
        primaryColor: '#2563EB',
        accentColor: '#3B82F6',
      },
    })
  }
  console.log('  ✓ Platform settings seeded')

  // 6. Seed default font
  console.log('  → Seeding fonts...')
  await prisma.font.upsert({
    where: { name: 'Rubik' },
    update: {},
    create: {
      name: 'Rubik',
      family: "'Rubik', system-ui, sans-serif",
      isActive: true,
      isDefault: true,
      weights: {
        create: [
          { weight: 400, fileUrl: '/fonts/rubik-400.woff2', format: 'woff2' },
          { weight: 500, fileUrl: '/fonts/rubik-500.woff2', format: 'woff2' },
          { weight: 600, fileUrl: '/fonts/rubik-600.woff2', format: 'woff2' },
          { weight: 700, fileUrl: '/fonts/rubik-700.woff2', format: 'woff2' },
        ],
      },
    },
  })
  console.log('  ✓ Fonts seeded')

  // 7. Seed admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@drs.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'
  console.log(`  → Seeding admin user (${adminEmail})...`)

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const passwordHash = await hash(adminPassword, ARGON2_OPTIONS)
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        fullName: 'Platform Admin',
        isAdmin: true,
        isSuperAdmin: true,
        emailVerified: true,
      },
    })
    console.log('  ✓ Admin user created')
  } else {
    console.log('  ✓ Admin user already exists')
  }

  console.log('\n✅ Database seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
