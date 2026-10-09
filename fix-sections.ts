import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const clinics = await prisma.clinic.findMany({
    include: { website: { include: { sections: true } } }
  });

  for (const clinic of clinics) {
    let website = clinic.website;
    if (!website) {
      website = await prisma.website.create({
        data: { clinicId: clinic.id, isPublished: false }
      });
      await prisma.websiteSettings.create({
        data: { websiteId: website.id }
      });
      console.log(`Created website for clinic ${clinic.name}`);
    }

    const sectionsCount = await prisma.websiteSection.count({ where: { websiteId: website.id } });
    
    if (sectionsCount === 0) {
      const defaultSections = [
        { type: "HERO" as const, title: "الرئيسية", titleEn: "Hero", sortOrder: 0 },
        { type: "ABOUT" as const, title: "من نحن", titleEn: "About", sortOrder: 1 },
        { type: "SERVICES" as const, title: "خدماتنا", titleEn: "Services", sortOrder: 2 },
        { type: "DOCTORS" as const, title: "أطبائنا", titleEn: "Doctors", sortOrder: 3 },
        { type: "CONTACT" as const, title: "اتصل بنا", titleEn: "Contact", sortOrder: 4 },
        { type: "BOOKING" as const, title: "احجز موعد", titleEn: "Booking", sortOrder: 5 },
      ];

      for (const section of defaultSections) {
        await prisma.websiteSection.create({
          data: {
            websiteId: website.id,
            type: section.type,
            title: section.title,
            titleEn: section.titleEn,
            sortOrder: section.sortOrder,
            isEnabled: true,
          }
        });
      }
      console.log(`Created sections for clinic ${clinic.name}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
