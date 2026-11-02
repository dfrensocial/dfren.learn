"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./client";
import { useAuth } from "./auth-context";

/**
 * Whether the signed-in user owns `courseId`. Reads the user's own enrollment
 * doc (rules allow owner reads). Purely a UI hint -- real access is enforced
 * server-side per request -- so any failure just means "not enrolled".
 */
export function useEnrollment(courseId: string): { enrolled: boolean; loading: boolean } {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<{ uid: string; enrolled: boolean } | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    getDoc(doc(db, "users", user.uid, "enrollments", courseId))
      .then((snap) => !cancelled && setState({ uid: user.uid, enrolled: snap.exists() }))
      .catch(() => !cancelled && setState({ uid: user.uid, enrolled: false }));
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, courseId]);

  const resolved = Boolean(user) && state?.uid === user?.uid;
  return {
    enrolled: resolved && Boolean(state?.enrolled),
    loading: authLoading || (Boolean(user) && !resolved),
  };
}
