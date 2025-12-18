import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  DocumentData,
  QueryConstraint,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  Experience,
  ExperienceData,
  ExperienceStatus,
  ExperienceType,
  Comment,
  Vote,
} from "@/types";

// Helper to convert Firestore timestamps
const convertTimestamps = <T extends DocumentData>(data: T): T => {
  const converted = { ...data } as Record<string, unknown>;
  Object.keys(converted).forEach((key) => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = (converted[key] as Timestamp).toDate();
    }
  });
  return converted as T;
};

// ============ EXPERIENCES ============

export async function createExperience(
  userId: string,
  username: string,
  type: ExperienceType,
  data: ExperienceData,
  summary: string,
  tags: string[]
): Promise<string> {
  const experienceRef = await addDoc(collection(db, "experiences"), {
    userId,
    username,
    type,
    data,
    summary,
    status: "PENDING" as ExperienceStatus,
    upvotes: 0,
    downvotes: 0,
    commentCount: 0,
    tags,
    companyName: "companyName" in data ? data.companyName : undefined,
    role: "role" in data ? data.role : undefined,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return experienceRef.id;
}

export async function getExperience(id: string): Promise<Experience | null> {
  const docRef = doc(db, "experiences", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return {
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  } as Experience;
}

export async function getExperiences(
  filters: {
    status?: ExperienceStatus;
    type?: ExperienceType;
    userId?: string;
    companyName?: string;
  } = {},
  sortBy: "createdAt" | "upvotes" | "commentCount" = "createdAt",
  pageSize: number = 20,
  lastDoc?: DocumentData
): Promise<{ experiences: Experience[]; lastDoc: DocumentData | null }> {
  const constraints: QueryConstraint[] = [];

  // Apply filters
  if (filters.status) {
    constraints.push(where("status", "==", filters.status));
  }
  if (filters.type) {
    constraints.push(where("type", "==", filters.type));
  }
  if (filters.userId) {
    constraints.push(where("userId", "==", filters.userId));
  }
  if (filters.companyName) {
    constraints.push(where("companyName", "==", filters.companyName));
  }

  // Sort
  constraints.push(orderBy(sortBy, "desc"));
  constraints.push(limit(pageSize));

  // Pagination
  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const q = query(collection(db, "experiences"), ...constraints);
  const snapshot = await getDocs(q);

  const experiences: Experience[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Experience[];

  const newLastDoc =
    snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

  return { experiences, lastDoc: newLastDoc };
}

export async function updateExperienceStatus(
  id: string,
  status: ExperienceStatus,
  adminFeedback?: string
): Promise<void> {
  const docRef = doc(db, "experiences", id);
  const updateData: DocumentData = {
    status,
    updatedAt: serverTimestamp(),
  };

  if (status === "PUBLISHED") {
    updateData.publishedAt = serverTimestamp();
  }

  if (adminFeedback) {
    updateData.adminFeedback = adminFeedback;
  }

  await updateDoc(docRef, updateData);
}

// ============ VOTES ============

export async function vote(
  experienceId: string,
  oderId: string,
  voteType: "UP" | "DOWN"
): Promise<void> {
  const voteId = `${experienceId}_${oderId}`;
  const voteRef = doc(db, "votes", voteId);
  const experienceRef = doc(db, "experiences", experienceId);

  const existingVote = await getDoc(voteRef);

  if (existingVote.exists()) {
    const existingType = existingVote.data().voteType;

    if (existingType === voteType) {
      // Remove vote
      await deleteDoc(voteRef);
      await updateDoc(experienceRef, {
        [voteType === "UP" ? "upvotes" : "downvotes"]: increment(-1),
      });
    } else {
      // Switch vote
      await updateDoc(voteRef, { voteType, updatedAt: serverTimestamp() });
      await updateDoc(experienceRef, {
        [existingType === "UP" ? "upvotes" : "downvotes"]: increment(-1),
        [voteType === "UP" ? "upvotes" : "downvotes"]: increment(1),
      });
    }
  } else {
    // New vote
    await addDoc(collection(db, "votes"), {
      id: voteId,
      experienceId,
      oderId,
      voteType,
      createdAt: serverTimestamp(),
    });
    await updateDoc(experienceRef, {
      [voteType === "UP" ? "upvotes" : "downvotes"]: increment(1),
    });
  }
}

export async function getUserVote(
  experienceId: string,
  userId: string
): Promise<Vote | null> {
  const q = query(
    collection(db, "votes"),
    where("experienceId", "==", experienceId),
    where("oderId", "==", userId)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  return {
    id: snapshot.docs[0].id,
    ...convertTimestamps(snapshot.docs[0].data()),
  } as Vote;
}

// ============ COMMENTS ============

export async function createComment(
  experienceId: string,
  userId: string,
  username: string,
  content: string,
  parentId?: string
): Promise<string> {
  const commentRef = await addDoc(collection(db, "comments"), {
    experienceId,
    userId,
    username,
    content,
    parentId: parentId || null,
    isEdited: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update comment count
  const experienceRef = doc(db, "experiences", experienceId);
  await updateDoc(experienceRef, {
    commentCount: increment(1),
  });

  return commentRef.id;
}

export async function getComments(experienceId: string): Promise<Comment[]> {
  const q = query(
    collection(db, "comments"),
    where("experienceId", "==", experienceId),
    orderBy("createdAt", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Comment[];
}

export async function updateComment(
  commentId: string,
  content: string
): Promise<void> {
  const commentRef = doc(db, "comments", commentId);
  await updateDoc(commentRef, {
    content,
    isEdited: true,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteComment(
  commentId: string,
  experienceId: string
): Promise<void> {
  const commentRef = doc(db, "comments", commentId);
  await deleteDoc(commentRef);

  // Update comment count
  const experienceRef = doc(db, "experiences", experienceId);
  await updateDoc(experienceRef, {
    commentCount: increment(-1),
  });
}

// ============ ADMIN ============

export async function getPendingExperiences(): Promise<Experience[]> {
  const q = query(
    collection(db, "experiences"),
    where("status", "==", "PENDING"),
    orderBy("createdAt", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Experience[];
}

export async function getExperienceStats(): Promise<{
  total: number;
  pending: number;
  published: number;
  rejected: number;
}> {
  const snapshot = await getDocs(collection(db, "experiences"));

  let pending = 0;
  let published = 0;
  let rejected = 0;

  snapshot.docs.forEach((doc) => {
    const status = doc.data().status;
    if (status === "PENDING") pending++;
    else if (status === "PUBLISHED") published++;
    else if (status === "REJECTED") rejected++;
  });

  return {
    total: snapshot.size,
    pending,
    published,
    rejected,
  };
}

