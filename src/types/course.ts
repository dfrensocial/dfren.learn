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

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  order: number;
  muxAssetId?: string;
  muxPlaybackId?: string;
  status: "pending" | "processing" | "ready" | "errored";
  durationSeconds?: number;
}

export interface Enrollment {
  courseId: string;
  userId: string;
  paymentId: string;
  purchasedAt: string;
}
