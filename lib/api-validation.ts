/**
 * API Input Validation Schemas using Zod
 *
 * Provides type-safe validation for all API endpoints
 * Sanitizes inputs and prevents injection attacks
 *
 * Usage:
 * ```typescript
 * import { validateRequest, schemas } from '@/lib/api-validation'
 *
 * export async function POST(request: NextRequest) {
 *   const { data, error } = await validateRequest(request, schemas.generateBeatName)
 *   if (error) return error
 *
 *   // data is now type-safe and validated
 *   const { originalTrackName, artistName } = data
 * }
 * ```
 */

import { z } from "zod"
import { NextRequest, NextResponse } from "next/server"

// ============================================================================
// COMMON VALIDATION RULES
// ============================================================================

const commonRules = {
  /** String with max length, trimmed, no special chars except allowed */
  safeString: (maxLength: number = 200) =>
    z
      .string()
      .trim()
      .min(1, "Cannot be empty")
      .max(maxLength, `Must be ${maxLength} characters or less`)
      .regex(/^[a-zA-Z0-9\s\-_.,!?'"()]+$/, "Contains invalid characters"),

  /** Optional safe string */
  optionalSafeString: (maxLength: number = 200) =>
    z
      .string()
      .trim()
      .max(maxLength, `Must be ${maxLength} characters or less`)
      .regex(/^[a-zA-Z0-9\s\-_.,!?'"()]*$/, "Contains invalid characters")
      .optional(),

  /** Filename with extension */
  filename: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9\-_]+\.[a-z0-9]+$/i, "Invalid filename format"),

  /** URL from trusted sources */
  trustedUrl: z
    .string()
    .url("Invalid URL")
    .refine((url) => {
      try {
        const parsed = new URL(url)
        // Allow fal.ai, Vercel Blob, and localhost for development
        const allowedHosts = [
          "fal.media",
          "fal.ai",
          "blob.vercel-storage.com",
          "localhost",
          "127.0.0.1",
        ]
        return allowedHosts.some((host) => parsed.hostname.includes(host))
      } catch {
        return false
      }
    }, "URL from untrusted source"),

  /** Music style enum */
  musicStyle: z.enum(["Hip-Hop", "Trap", "R&B", "Pop", "Electronic"], {
    errorMap: () => ({ message: "Invalid music style" }),
  }),

  /** Gender enum */
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Invalid gender" }),
  }),

  /** Image size format (e.g., "512x512") */
  imageSize: z
    .string()
    .regex(/^\d{3,4}x\d{3,4}$/, "Invalid size format (use WIDTHxHEIGHT)")
    .refine((size) => {
      const [width, height] = size.split("x").map(Number)
      return width >= 256 && width <= 2048 && height >= 256 && height <= 2048
    }, "Size must be between 256x256 and 2048x2048"),

  /** Positive integer */
  positiveInt: z.number().int().positive("Must be a positive number"),

  /** File size in bytes (max 100MB) */
  fileSize: z
    .number()
    .int()
    .positive()
    .max(100 * 1024 * 1024, "File too large (max 100MB)"),
}

// ============================================================================
// API ENDPOINT SCHEMAS
// ============================================================================

export const schemas = {
  /**
   * /api/generate-beat-name
   * Validates beat name generation request
   */
  generateBeatName: z.object({
    originalTrackName: commonRules.safeString(100),
    artistName: commonRules.optionalSafeString(100),
  }),

  /**
   * /api/generate-beat-cover
   * Validates beat cover generation request
   */
  generateBeatCover: z.object({
    beatName: commonRules.safeString(100),
  }),

  /**
   * /api/generate-avatar
   * Validates avatar generation request
   */
  generateAvatar: z.object({
    prompt: commonRules.optionalSafeString(500),
    name: commonRules.safeString(50),
    gender: commonRules.gender,
    musicStyle: commonRules.musicStyle.optional().default("hip-hop" as any),
  }),

  /**
   * /api/generate-cover
   * Validates album cover generation request
   */
  generateCover: z.object({
    prompt: commonRules.safeString(200),
    style: commonRules.musicStyle,
  }),

  /**
   * /api/generate-art
   * Validates art generation request
   */
  generateArt: z.object({
    prompt: commonRules.safeString(500),
    size: commonRules.imageSize,
    filename: commonRules.filename,
  }),

  /**
   * /api/upload-art
   * Validates art upload request
   */
  uploadArt: z.object({
    url: commonRules.trustedUrl,
    filename: commonRules.filename,
  }),

  /**
   * /api/upload-music (FormData - validated separately)
   * File validation happens in the route handler
   */
  uploadMusic: z.object({
    // FormData validation is done in route handler
    // This is just for documentation
    files: z.array(z.any()).min(1, "At least one file required"),
  }),

  /**
   * /api/songs (GET - no body validation needed)
   */
  songs: z.object({}),

  /**
   * /api/leaderboards (GET - query params)
   */
  leaderboards: z.object({
    type: z.enum(["global", "weekly"]).optional().default("global"),
    playerId: z.string().uuid().optional(),
  }),
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export interface ValidationResult<T> {
  data: T | null
  error: NextResponse | null
}

/**
 * Validate request body against schema
 * Returns validated data or error response
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns { data, error } - validated data or error response
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    // Parse request body
    const body = await request.json()

    // Validate against schema
    const result = schema.safeParse(body)

    if (!result.success) {
      // Format Zod errors into user-friendly messages
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }))

      console.warn("[API Validation] Validation failed:", errors)

      return {
        data: null,
        error: NextResponse.json(
          {
            error: "Validation Error",
            message: "Invalid request data",
            code: "VALIDATION_ERROR",
            details: errors,
          },
          { status: 400 }
        ),
      }
    }

    // Return validated data
    return {
      data: result.data,
      error: null,
    }
  } catch (error) {
    console.error("[API Validation] Failed to parse request:", error)

    return {
      data: null,
      error: NextResponse.json(
        {
          error: "Bad Request",
          message: "Invalid JSON in request body",
          code: "INVALID_JSON",
        },
        { status: 400 }
      ),
    }
  }
}

/**
 * Validate query parameters against schema
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns { data, error } - validated data or error response
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())

    const result = schema.safeParse(params)

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }))

      console.warn("[API Validation] Query params validation failed:", errors)

      return {
        data: null,
        error: NextResponse.json(
          {
            error: "Validation Error",
            message: "Invalid query parameters",
            code: "VALIDATION_ERROR",
            details: errors,
          },
          { status: 400 }
        ),
      }
    }

    return {
      data: result.data,
      error: null,
    }
  } catch (error) {
    console.error("[API Validation] Failed to parse query params:", error)

    return {
      data: null,
      error: NextResponse.json(
        {
          error: "Bad Request",
          message: "Invalid query parameters",
          code: "INVALID_QUERY",
        },
        { status: 400 }
      ),
    }
  }
}

/**
 * Sanitize user input (remove potentially dangerous characters)
 * Use as additional safety layer on top of Zod validation
 *
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return (
    input
      .trim()
      // Remove null bytes
      .replace(/\0/g, "")
      // Remove control characters (except newlines and tabs)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      // Remove potential script tags
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      // Remove potential SQL injection attempts
      .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi, "")
  )
}

/**
 * Validate file upload (for multipart/form-data)
 *
 * @param file - File object
 * @param options - Validation options
 * @returns { valid, error } - validation result
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number
    allowedTypes?: string[]
    allowedExtensions?: string[]
  } = {}
): { valid: boolean; error: string | null } {
  const {
    maxSize = 100 * 1024 * 1024, // 100MB default
    allowedTypes = [],
    allowedExtensions = [],
  } = options

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
    }
  }

  // Check MIME type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    }
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split(".").pop()?.toLowerCase()
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `Invalid file extension. Allowed: ${allowedExtensions.join(", ")}`,
      }
    }
  }

  return { valid: true, error: null }
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type GenerateBeatNameInput = z.infer<typeof schemas.generateBeatName>
export type GenerateBeatCoverInput = z.infer<typeof schemas.generateBeatCover>
export type GenerateAvatarInput = z.infer<typeof schemas.generateAvatar>
export type GenerateCoverInput = z.infer<typeof schemas.generateCover>
export type GenerateArtInput = z.infer<typeof schemas.generateArt>
export type UploadArtInput = z.infer<typeof schemas.uploadArt>
export type LeaderboardsQuery = z.infer<typeof schemas.leaderboards>
