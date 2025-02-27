import { Inter } from "next/font/google"
import Sidebar from "@/components/admin/Sidebar"
import Header from "@/components/admin/Header"

const inter = Inter({ subsets: ["latin"] })

export default function AdminDashboardLayout({ children }) {
  return (
    <div className={`flex min-h-screen bg-background text-foreground ${inter.className}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-2 md:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

