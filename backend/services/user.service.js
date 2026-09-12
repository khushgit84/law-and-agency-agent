import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, '../data/users.json');

function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

/**
 * Register a new user or update their last login timestamp.
 * Called after the frontend authenticates via Firebase.
 */
export function registerOrUpdateUser({ uid, email, displayName, phoneNumber, photoURL, provider }) {
  const users = readUsers();
  const existingIndex = users.findIndex(u => u.uid === uid);
  const now = new Date().toISOString();

  if (existingIndex !== -1) {
    // User exists — update last login and any changed profile fields
    users[existingIndex].lastLoginAt = now;
    users[existingIndex].displayName = displayName || users[existingIndex].displayName;
    users[existingIndex].photoURL = photoURL || users[existingIndex].photoURL;
    users[existingIndex].phoneNumber = phoneNumber || users[existingIndex].phoneNumber;
    users[existingIndex].loginCount = (users[existingIndex].loginCount || 0) + 1;
  } else {
    // New user
    users.push({
      uid,
      email: email || null,
      displayName: displayName || null,
      phoneNumber: phoneNumber || null,
      photoURL: photoURL || null,
      provider: provider || 'unknown',
      createdAt: now,
      lastLoginAt: now,
      loginCount: 1
    });
  }

  writeUsers(users);
  return users[existingIndex !== -1 ? existingIndex : users.length - 1];
}

/**
 * Get all registered users.
 */
export function getAllUsers() {
  return readUsers();
}

/**
 * Get aggregated stats for the admin dashboard.
 */
export function getUserStats() {
  const users = readUsers();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const totalUsers = users.length;
  const activeToday = users.filter(u => u.lastLoginAt >= todayStart).length;
  const signupsThisWeek = users.filter(u => u.createdAt >= weekAgo).length;

  // Provider breakdown
  const providers = {};
  users.forEach(u => {
    const p = u.provider || 'unknown';
    providers[p] = (providers[p] || 0) + 1;
  });

  // Daily signups for the last 7 days
  const dailySignups = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    
    const count = users.filter(u => {
      const created = new Date(u.createdAt);
      return created >= dayStart && created <= dayEnd;
    }).length;

    dailySignups.push({
      date: dayStart.toISOString().split('T')[0],
      count
    });
  }

  return {
    totalUsers,
    activeToday,
    signupsThisWeek,
    providers,
    dailySignups
  };
}
