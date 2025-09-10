import { Metadata } from 'next'
import { AdminHeader } from '@/components/admin/admin-header'

export const metadata: Metadata = {
  title: 'Administration - Annuaire Services d\'Urgence Madagascar',
  description: 'Interface d\'administration pour la gestion des services d\'urgence du Madagascar',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin workspace - completely separate from public */}
      <AdminHeader />
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  )
}