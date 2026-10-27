import fs from 'fs/promises';
import path from 'path';
import { Subject, Deadline, Progress, User } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const SUBJECTS_FILE = path.join(DATA_DIR, 'subjects.json');
const DEADLINES_FILE = path.join(DATA_DIR, 'deadlines.json');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Write mutex / sequential queue to prevent concurrent race condition writes
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueueWrite<T>(task: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(task);
  writeQueue = result.catch(() => {});
  return result;
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error: unknown) {
    console.error(`[DataRepository] Error reading file ${filePath}:`, error);
    return fallback;
  }
}

async function writeJsonFileAtomic<T>(filePath: string, data: T): Promise<void> {
  return enqueueWrite(async () => {
    const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
    const payload = JSON.stringify(data, null, 2);
    await fs.writeFile(tempPath, payload, 'utf-8');
    await fs.rename(tempPath, filePath);
  });
}

// ------------------- SUBJECTS -------------------
export async function getSubjects(): Promise<Subject[]> {
  return readJsonFile<Subject[]>(SUBJECTS_FILE, []);
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const subjects = await getSubjects();
  return subjects.find((s) => s.slug === slug) || null;
}

export async function getSubjectById(id: string): Promise<Subject | null> {
  const subjects = await getSubjects();
  return subjects.find((s) => s.id === id) || null;
}

// ------------------- DEADLINES -------------------
export async function getDeadlines(): Promise<Deadline[]> {
  return readJsonFile<Deadline[]>(DEADLINES_FILE, []);
}

export async function getDeadlineById(id: string): Promise<Deadline | null> {
  const deadlines = await getDeadlines();
  return deadlines.find((d) => d.id === id) || null;
}

export async function getDeadlinesBySubjectId(subjectId: string): Promise<Deadline[]> {
  const deadlines = await getDeadlines();
  return deadlines.filter((d) => d.subjectId === subjectId);
}

export async function createDeadline(
  payload: Omit<Deadline, 'id' | 'createdAt'>
): Promise<Deadline> {
  const deadlines = await getDeadlines();
  
  // Safe server-generated ID
  const timestamp = Date.now().toString(36);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const newId = `dl_${timestamp}_${randomSuffix}`;

  const newDeadline: Deadline = {
    ...payload,
    id: newId,
    createdAt: new Date().toISOString()
  };

  deadlines.unshift(newDeadline);
  await writeJsonFileAtomic(DEADLINES_FILE, deadlines);
  return newDeadline;
}

export async function deleteDeadline(id: string): Promise<boolean> {
  const deadlines = await getDeadlines();
  const index = deadlines.findIndex((d) => d.id === id);
  if (index === -1) {
    return false;
  }

  deadlines.splice(index, 1);
  await writeJsonFileAtomic(DEADLINES_FILE, deadlines);

  // Clean associated progress
  const progressList = await readJsonFile<Progress[]>(PROGRESS_FILE, []);
  const filteredProgress = progressList.filter((p) => p.deadlineId !== id);
  if (filteredProgress.length !== progressList.length) {
    await writeJsonFileAtomic(PROGRESS_FILE, filteredProgress);
  }

  return true;
}

// ------------------- PROGRESS -------------------
export async function getProgress(userId: string): Promise<Progress[]> {
  const allProgress = await readJsonFile<Progress[]>(PROGRESS_FILE, []);
  return allProgress.filter((p) => p.userId === userId);
}

export async function getDeadlineProgress(
  userId: string,
  deadlineId: string
): Promise<Progress | null> {
  const allProgress = await readJsonFile<Progress[]>(PROGRESS_FILE, []);
  return allProgress.find((p) => p.userId === userId && p.deadlineId === deadlineId) || null;
}

export async function toggleDeadlineProgress(
  userId: string,
  deadlineId: string
): Promise<boolean> {
  const allProgress = await readJsonFile<Progress[]>(PROGRESS_FILE, []);
  const existingIndex = allProgress.findIndex(
    (p) => p.userId === userId && p.deadlineId === deadlineId
  );

  let isNowCompleted = false;

  if (existingIndex >= 0) {
    const current = allProgress[existingIndex];
    if (current.isCompleted) {
      allProgress.splice(existingIndex, 1);
      isNowCompleted = false;
    } else {
      current.isCompleted = true;
      current.completedAt = new Date().toISOString();
      isNowCompleted = true;
    }
  } else {
    allProgress.push({
      userId,
      deadlineId,
      completedAt: new Date().toISOString(),
      isCompleted: true
    });
    isNowCompleted = true;
  }

  await writeJsonFileAtomic(PROGRESS_FILE, allProgress);
  return isNowCompleted;
}

// ------------------- USERS -------------------
export async function getUsers(): Promise<User[]> {
  return readJsonFile<User[]>(USERS_FILE, []);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) || null;
}

