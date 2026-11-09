import { User, UserRole } from '@/types';

const USERS_STORAGE_KEY = 'tb_canteen_users';
const CURRENT_USER_STORAGE_KEY = 'tb_canteen_current_user';

export const DEMO_USERS: Record<UserRole, User> = {
  STUDENT: {
    id: 'std-1',
    name: 'Riya Sharma',
    email: 'riya.sharma@campus.edu',
    role: 'STUDENT',
    studentId: 'CS-2024-88',
    phone: '+91 98765 43210',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAveiXhp6GBrQ9td0xJfD0cDCW6rB8lwWEaOpnJ02qC4nN_bA0OPf1mGfbUn5rCzEAiZlmEO3x-oNFeKCIpTuBPUdHDbHjIHbsAVtoIiwxDyHN1Xn_bV7o61FnKq7JIwnXuU_GpD5Rwx9Tom9IBja_SCr-ApwQzEGsjXn5fxu4OJm00R2P496fprVcFGbY_vKNKA3T2Bm-ZaAAwjiEcIZEUvuO3gu35q7TIBlxKlhBB',
    walletBalance: 340.00,
    block: 'Block 4 - Hostel B',
    room: 'Room 312',
    createdAt: '2024-08-01T00:00:00Z',
  },
  STAFF: {
    id: 'stf-1',
    name: 'Chef Mahesh Rawat',
    email: 'kitchen.block4@campus.edu',
    role: 'STAFF',
    phone: '+91 98765 11223',
    avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
    walletBalance: 0,
    block: 'Counter 2 Ops',
    createdAt: '2023-01-15T00:00:00Z',
  },
  ADMIN: {
    id: 'adm-1',
    name: 'Mr. Arvind Dave',
    email: 'admin.canteen@campus.edu',
    role: 'ADMIN',
    phone: '+91 98765 99887',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    walletBalance: 0,
    block: 'Canteen Administration',
    createdAt: '2022-06-01T00:00:00Z',
  },
};

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    const saved = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Default to student demo user for initial rich experience
    const defaultUser = DEMO_USERS.STUDENT;
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  },

  async login(email: string, _password?: string): Promise<User> {
    // Check if demo user role matches
    let user: User = DEMO_USERS.STUDENT;
    if (email.includes('admin')) {
      user = DEMO_USERS.ADMIN;
    } else if (email.includes('kitchen') || email.includes('staff')) {
      user = DEMO_USERS.STAFF;
    } else {
      user = {
        ...DEMO_USERS.STUDENT,
        email,
      };
    }
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  async switchRole(role: UserRole): Promise<User> {
    const user = DEMO_USERS[role];
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  async register(data: {
    name: string;
    studentId: string;
    email: string;
    phone: string;
    password?: string;
  }): Promise<User> {
    const newUser: User = {
      id: 'std-' + Date.now(),
      name: data.name,
      email: data.email,
      role: 'STUDENT',
      studentId: data.studentId,
      phone: data.phone,
      avatarUrl: DEMO_USERS.STUDENT.avatarUrl,
      walletBalance: 150.00, // Welcome credit
      block: 'Campus Block 4',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const current = await this.getCurrentUser();
    if (!current) throw new Error('No user logged in');
    const updated = { ...current, ...updates };
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  async topUpWallet(amount: number): Promise<number> {
    const current = await this.getCurrentUser();
    if (!current) throw new Error('No user logged in');
    const newBalance = current.walletBalance + amount;
    await this.updateProfile({ walletBalance: newBalance });
    return newBalance;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  },
};

