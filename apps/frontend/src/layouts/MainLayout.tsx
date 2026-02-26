import React from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Header from '../components/Header'
import Footer from '../components/Footer'
import FloatingChat from '../components/FloatingChat'

const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
      <Toaster position="top-right" />
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
      <FloatingChat />
    </div>
  )
}

export default MainLayout
