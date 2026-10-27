import { MetadataRoute } from 'next';
import { getDeadlines, getSubjects } from '@/lib/data-repository';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const [subjects, deadlines] = await Promise.all([
    getSubjects(),
    getDeadlines(),
  ]);

  const now = new Date();

  // 1. Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/deadlines`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ];

  // 2. Subject routes
  const subjectRoutes: MetadataRoute.Sitemap = subjects.map((sub) => ({
    url: `${baseUrl}/subjects/${sub.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. Deadline detail routes
  const deadlineRoutes: MetadataRoute.Sitemap = deadlines.map((dl) => ({
    url: `${baseUrl}/deadlines/${dl.id}`,
    lastModified: new Date(dl.createdAt),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [...staticRoutes, ...subjectRoutes, ...deadlineRoutes];
}

