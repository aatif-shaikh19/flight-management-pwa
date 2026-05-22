import { AuthForm } from '@/components/auth/AuthForm'

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage your flights</p>
        </div>
        <AuthForm mode="login" />
      </div>
    </main>
  )
}
