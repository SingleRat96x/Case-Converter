import type { Metadata } from 'next';
import { AdminLogin } from './admin-login';

export const metadata: Metadata = {
  title: 'Admin Login - Text Case Converter',
  description: 'Admin login page',
  robots: 'noindex, nofollow' // Prevent search engines from indexing the admin page
};

export default function AdminPage() {
  return <AdminLogin />;
} 