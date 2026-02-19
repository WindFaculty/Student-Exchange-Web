import React from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Header from '../components/Header'

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Toaster position="top-right" />
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
