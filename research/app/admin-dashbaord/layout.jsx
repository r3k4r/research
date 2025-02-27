import { Inter } from "next/font/google"
import Sidebar from "@/components/admin/Sidebar"
import Header from "@/components/admin/Header"

const inter = Inter({ subsets: ["latin"] })

export default function AdminDashboardLayout({ children }) {
  return (
    <div className={`flex h-screen bg-background text-foreground ${inter.className}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

