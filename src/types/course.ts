export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  priceInPaise: number;
  thumbnailUrl: string;
  published: boolean;
  createdAt: string;
}

export interface Chapter {
  /** Seconds from the start of the lesson video. */
  start: number;
  title: string;
  /** Section heading this chapter is listed under (e.g. a course module). */
  group?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  order: number;
  muxAssetId?: string;
  muxPlaybackId?: string;
  status: "pending" | "processing" | "ready" | "errored";
  durationSeconds?: number;
  chapters?: Chapter[];
}

/** courses/{courseId}/resources/{resourceId} — a downloadable file; bytes are server-only. */
export interface Resource {
  id: string;
  title: string;
  description?: string;
  filename: string;
  contentType: string;
  size: number;
  order: number;
}

/** users/{uid}/progress/{courseId} — written server-side by /api/mux/heartbeat. */
export interface CourseProgress {
  lastLessonId?: string;
  lessons?: Record<string, { position: number; duration: number; completed?: boolean }>;
}

export interface Enrollment {
  courseId: string;
  userId: string;
  paymentId: string;
  purchasedAt: string;
}
