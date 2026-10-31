# UI/UX & Architecture Rules

1. **UI/UX Design System:** Sebelum membuat atau merombak halaman/komponen frontend, WAJIB baca dan ikuti instruksi di `.agents/skills/ui-ux-pro-max/SKILL.md`. Gunakan script pencarian di dalamnya untuk menentukan palet warna, tipografi, dan layout yang presisi.
2. **Clean Architecture & Modularity:** 
   - Jangan menulis seluruh halaman dalam satu file besar. Pecah elemen visual dari `ui-ux-pro-max` menjadi komponen-komponen kecil yang modular dan reusable di `src/components/`.
   - Pisahkan semua state dan logika bisnis ke `src/composables/`.