import Link from 'next/link'
import Header from '../components/Header'

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
          <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-in-200 lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
            Welcome to Online Course Platform
          </p>
          <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
            <a
              className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Powered by Next.js
            </a>
          </div>
        </div>

        <div className="relative flex place-items-center">
          <h1 className="text-4xl font-bold">Online Course Platform</h1>
        </div>

        <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
            <h2 className="mb-3 text-2xl font-semibold">
              Courses
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Browse and enroll in PDF-based courses.
            </p>
          </div>

          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
            <h2 className="mb-3 text-2xl font-semibold">
              Dashboard
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Track your progress and certificates.
            </p>
          </div>

          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
            <h2 className="mb-3 text-2xl font-semibold">
              Admin
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Manage courses and users.
            </p>
          </div>

          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
            <h2 className="mb-3 text-2xl font-semibold">
              Affiliate
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Earn commissions by referring others.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}