# Instruksi Eksekusi Frontend PUSTIPADA WorkHub (React + TypeScript)

Halo AI Agent! Tugasmu adalah membangun dan mengisi struktur file di dalam folder `frontend/src/` untuk proyek **PUSTIPADA WorkHub**, sebuah aplikasi manajemen penugasan internal PUSTIPADA yang terhubung ke Backend Laravel REST API di `http://localhost:8000/api`.

Ikuti seluruh spesifikasi kontrak data, struktur folder modular, dan aturan bisnis (*RBAC* & *State Machine*) di bawah ini.

---

## 1. Struktur Folder Tujuan (`frontend/src/`)
Pastikan file-file berikut dibuat dengan struktur dan isi kode yang presisi:

```text
frontend/src/
├── types/
│   └── api.ts
├── api/
│   └── client.ts
├── context/
│   └── AuthContext.tsx
├── components/
│   └── ui/
│       ├── StatusBadge.tsx
│       └── PriorityBadge.tsx
└── features/
    └── tasks/
        └── TaskActionBox.tsx
```

---

## 2. Spesifikasi Isi File

### A. Kontrak Tipe Data (`frontend/src/types/api.ts`)
```typescript
export type UserRole = 'admin' | 'pimpinan' | 'anggota';

export type TaskStatus =
  | 'draft'
  | 'open'
  | 'in_progress'
  | 'in_review'
  | 'revision_needed'
  | 'completed'
  | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Division {
  id: number;
  name: string;
  code?: string;
  is_active: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  division_id: number | null;
  division?: Division | null;
}

export interface TaskActivity {
  id: number;
  task_id: number;
  user_id?: number;
  actor?: User;
  action?: string;
  from_status?: TaskStatus | null;
  to_status?: TaskStatus | null;
  note?: string | null;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  expected_output?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  division_id: number | null;
  division?: Division | null;
  creator_id: number;
  creator?: User;
  pic_id: number | null;
  pic?: User | null;
  assignees?: User[];
  submission_note?: string | null;
  review_note?: string | null;
  activities?: TaskActivity[];
  created_at: string;
  updated_at: string;
}
```

### B. API HTTP Client (`frontend/src/api/client.ts`)
```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor untuk menyisipkan Bearer Token secara otomatis dari localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('workhub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
```

### C. Komponen Status Badge (`frontend/src/components/ui/StatusBadge.tsx`)
```tsx
import type { TaskStatus } from '../../types/api';

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700 border-slate-300' },
  open: { label: 'Open / Ditugaskan', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_progress: { label: 'In Progress', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  in_review: { label: 'In Review', className: 'bg-amber-50 text-amber-800 border-amber-300' },
  revision_needed: { label: 'Revision Needed', className: 'bg-rose-50 text-rose-700 border-rose-300' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  cancelled: { label: 'Cancelled', className: 'bg-zinc-200 text-zinc-600 border-zinc-300' },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}
```

### D. Komponen Aksi Status / State Machine (`frontend/src/features/tasks/TaskActionBox.tsx`)
```tsx
import { useState } from 'react';
import type { Task, TaskStatus, User } from '../../types/api';

interface TaskActionBoxProps {
  task: Task;
  currentUser: User;
  onUpdateStatus: (taskId: number, status: TaskStatus, note: string) => Promise<void>;
}

export function TaskActionBox({ task, currentUser, onUpdateStatus }: TaskActionBoxProps) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPimpinan = currentUser.role === 'pimpinan';
  const isPicOrAssignee =
    task.pic_id === currentUser.id ||
    task.assignees?.some((member) => member.id === currentUser.id);

  const handleTransition = async (targetStatus: TaskStatus, requireNote = false) => {
    if (requireNote && !note.trim()) {
      setError('Catatan wajib diisi untuk tindakan ini.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onUpdateStatus(task.id, targetStatus, note);
      setNote('');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal memperbarui status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
      <h4 className="text-sm font-semibold text-slate-800">Tindakan & Pembaruan Status</h4>

      {error && (
        <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
          {error}
        </div>
      )}

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Tambahkan catatan progres, tautan hasil kerja, atau alasan revisi..."
        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm bg-white"
        rows={2}
      />

      <div className="flex flex-wrap gap-2">
        {isPimpinan && task.status === 'draft' && (
          <button
            disabled={loading}
            onClick={() => handleTransition('open')}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
          >
            Umumkan Tugas (Open)
          </button>
        )}

        {isPicOrAssignee && (task.status === 'open' || task.status === 'revision_needed') && (
          <button
            disabled={loading}
            onClick={() => handleTransition('in_progress')}
            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700"
          >
            Mulai Kerjakan (In Progress)
          </button>
        )}

        {isPicOrAssignee && (task.status === 'in_progress' || task.status === 'revision_needed') && (
          <button
            disabled={loading}
            onClick={() => handleTransition('in_review', true)}
            className="px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700"
          >
            Serahkan Hasil (In Review)
          </button>
        )}

        {isPimpinan && task.status === 'in_review' && (
          <>
            <button
              disabled={loading}
              onClick={() => handleTransition('completed')}
              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700"
            >
              Setujui Penyelesaian (Completed)
            </button>
            <button
              disabled={loading}
              onClick={() => handleTransition('revision_needed', true)}
              className="px-3 py-1.5 bg-rose-600 text-white text-xs font-medium rounded-lg hover:bg-rose-700"
            >
              Minta Revisi (Wajib Catatan)
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

---

## 3. Instruksi Final untuk AI Agent
Silakan buat file-file di atas sesuai path yang ditentukan, lalu buat halaman-halaman pendukung (`LoginPage.tsx` dan `DashboardPage.tsx`) yang menggunakan komponen-komponen ini. Pastikan jalankan `npm run build` atau `npx tsc --noEmit` untuk memvalidasi tidak ada error tipe data.