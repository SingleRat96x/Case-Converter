import type { Metadata } from 'next';
import { AdminDashboard } from './admin-dashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Text Case Converter',
  description: 'Admin dashboard for managing tool content',
  robots: 'noindex, nofollow'
};

export default function DashboardPage() {
  return <AdminDashboard />;
} 