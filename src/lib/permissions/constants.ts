export const PERMISSIONS = {
  // Patients
  PATIENTS_VIEW: 'patients.view',
  PATIENTS_CREATE: 'patients.create',
  PATIENTS_UPDATE: 'patients.update',
  PATIENTS_DELETE: 'patients.delete',

  // Appointments
  APPOINTMENTS_VIEW: 'appointments.view',
  APPOINTMENTS_CREATE: 'appointments.create',
  APPOINTMENTS_UPDATE: 'appointments.update',
  APPOINTMENTS_DELETE: 'appointments.delete',

  // Doctors
  DOCTORS_VIEW: 'doctors.view',
  DOCTORS_MANAGE: 'doctors.manage',

  // Services
  SERVICES_VIEW: 'services.view',
  SERVICES_MANAGE: 'services.manage',

  // Website
  WEBSITE_VIEW: 'website.view',
  WEBSITE_MANAGE: 'website.manage',

  // Users & Team
  USERS_VIEW: 'users.view',
  USERS_MANAGE: 'users.manage',

  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_MANAGE: 'settings.manage',

  // Reports
  REPORTS_VIEW: 'reports.view',
} as const

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

// All permission keys as an array (for seeding)
export const ALL_PERMISSIONS: {
  key: string
  description: string
  descriptionAr: string
  category: string
}[] = [
  // Patients
  { key: PERMISSIONS.PATIENTS_VIEW, description: 'View patients', descriptionAr: 'عرض المرضى', category: 'patients' },
  { key: PERMISSIONS.PATIENTS_CREATE, description: 'Create patients', descriptionAr: 'إضافة مرضى', category: 'patients' },
  { key: PERMISSIONS.PATIENTS_UPDATE, description: 'Update patients', descriptionAr: 'تعديل المرضى', category: 'patients' },
  { key: PERMISSIONS.PATIENTS_DELETE, description: 'Delete patients', descriptionAr: 'حذف المرضى', category: 'patients' },

  // Appointments
  { key: PERMISSIONS.APPOINTMENTS_VIEW, description: 'View appointments', descriptionAr: 'عرض المواعيد', category: 'appointments' },
  { key: PERMISSIONS.APPOINTMENTS_CREATE, description: 'Create appointments', descriptionAr: 'إنشاء مواعيد', category: 'appointments' },
  { key: PERMISSIONS.APPOINTMENTS_UPDATE, description: 'Update appointments', descriptionAr: 'تعديل المواعيد', category: 'appointments' },
  { key: PERMISSIONS.APPOINTMENTS_DELETE, description: 'Delete appointments', descriptionAr: 'حذف المواعيد', category: 'appointments' },

  // Doctors
  { key: PERMISSIONS.DOCTORS_VIEW, description: 'View doctors', descriptionAr: 'عرض الأطباء', category: 'doctors' },
  { key: PERMISSIONS.DOCTORS_MANAGE, description: 'Manage doctors', descriptionAr: 'إدارة الأطباء', category: 'doctors' },

  // Services
  { key: PERMISSIONS.SERVICES_VIEW, description: 'View services', descriptionAr: 'عرض الخدمات', category: 'services' },
  { key: PERMISSIONS.SERVICES_MANAGE, description: 'Manage services', descriptionAr: 'إدارة الخدمات', category: 'services' },

  // Website
  { key: PERMISSIONS.WEBSITE_VIEW, description: 'View website settings', descriptionAr: 'عرض إعدادات الموقع', category: 'website' },
  { key: PERMISSIONS.WEBSITE_MANAGE, description: 'Manage website', descriptionAr: 'إدارة الموقع', category: 'website' },

  // Users
  { key: PERMISSIONS.USERS_VIEW, description: 'View team members', descriptionAr: 'عرض أعضاء الفريق', category: 'users' },
  { key: PERMISSIONS.USERS_MANAGE, description: 'Manage team members', descriptionAr: 'إدارة أعضاء الفريق', category: 'users' },

  // Settings
  { key: PERMISSIONS.SETTINGS_VIEW, description: 'View clinic settings', descriptionAr: 'عرض إعدادات العيادة', category: 'settings' },
  { key: PERMISSIONS.SETTINGS_MANAGE, description: 'Manage clinic settings', descriptionAr: 'إدارة إعدادات العيادة', category: 'settings' },

  // Reports
  { key: PERMISSIONS.REPORTS_VIEW, description: 'View reports', descriptionAr: 'عرض التقارير', category: 'reports' },
]
