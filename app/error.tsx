"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md rounded-lg border border-red-500/20 bg-gray-900 p-6 text-center">
        <div className="mb-4 text-6xl">💥</div>
        <h2 className="mb-2 text-2xl font-bold text-red-400">Произошла ошибка</h2>
        <p className="mb-4 text-gray-400">
          Что-то пошло не так при загрузке этой страницы.
        </p>
        {error.digest && (
          <p className="mb-4 text-xs text-gray-500">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Попробовать снова
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="flex-1 rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
          >
            На главную
          </button>
        </div>
      </div>
    </div>
  )
}
