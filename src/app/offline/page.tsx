'use client'

export default function OfflinePage() {
  return (
    <main className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {/* Plane icon */}
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">
          You&apos;re offline
        </h1>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          No internet connection detected. Your previously viewed bookings
          are still available below.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href="/bookings"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            View My Bookings
          </a>
          <button
            onClick={() => window.location.reload()}
            className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Try Again
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Bookings are cached and readable offline.
        </p>
      </div>
    </main>
  )
}
