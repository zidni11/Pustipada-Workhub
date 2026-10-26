# Pustipada Workhub - Frontend

SPA React 19 + TypeScript + Vite untuk Pustipada Workhub.

## Perintah

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # cek TypeScript (app + vite config)
npm run lint       # oxlint
npm run build      # typecheck + build produksi
npm run preview    # pratinjau hasil build
```

## Konfigurasi API

Frontend memakai `VITE_API_URL` (default `http://localhost:8000/api`).
Saat memakai Docker Compose, variabel ini sudah diatur ke
`http://localhost:8000/api`.

## Akun demo (seeder backend)

| Email | Role | Password |
| --- | --- | --- |
| `admin@pustipada.test` | admin | `password` |
| `pimpinan@pustipada.test` | pimpinan | `password` |
| `anggota@pustipada.test` | anggota | `password` |

## Struktur

- `src/types/api.ts` - tipe response JSON backend
- `src/api/` - client HTTP + modul endpoint (auth, tasks, users, divisions)
- `src/auth/` - context & provider autentikasi (token Sanctum)
- `src/pages/` - halaman utama
- `src/components/` - layout dan komponen UI
- `src/lib/` - helper format dan aturan transisi status
