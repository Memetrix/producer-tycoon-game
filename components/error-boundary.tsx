"use client"

import * as Sentry from "@sentry/nextjs"
import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * React Error Boundary Component
 *
 * Catches errors in child components and displays fallback UI
 * Automatically reports errors to Sentry
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    console.error("Error Boundary caught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
          <div className="w-full max-w-md rounded-lg border border-red-500/20 bg-gray-900 p-6 text-center">
            <div className="mb-4 text-6xl">⚠️</div>
            <h2 className="mb-2 text-2xl font-bold text-red-400">Что-то пошло не так</h2>
            <p className="mb-4 text-gray-400">
              Произошла ошибка при загрузке этого компонента.
            </p>
            {this.state.error && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300">
                  Детали ошибки
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-gray-800 p-2 text-xs text-red-300">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Перезагрузить страницу
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Simple error fallback component
 */
export function ErrorFallback({ error, reset }: { error?: Error; reset?: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md rounded-lg border border-red-500/20 bg-gray-900 p-6 text-center">
        <div className="mb-4 text-6xl">💥</div>
        <h2 className="mb-2 text-2xl font-bold text-red-400">Ошибка</h2>
        <p className="mb-4 text-gray-400">
          Не удалось загрузить этот раздел.
        </p>
        {error && (
          <p className="mb-4 text-sm text-red-300">
            {error.message}
          </p>
        )}
        {reset && (
          <button
            onClick={reset}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Hook for functional components to handle errors
 * Usage in Next.js error.tsx files
 */
export function useErrorHandler() {
  return {
    captureError: (error: Error, context?: Record<string, any>) => {
      Sentry.captureException(error, {
        contexts: context,
      })
    },
  }
}
