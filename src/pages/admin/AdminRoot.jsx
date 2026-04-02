/**
 * SR MVP — Admin Root
 * Tim 6 Fase 2 | src/pages/admin/AdminRoot.jsx
 */

import { AdminProvider } from '../../context/AdminContext';
import AdminView from '../../components/admin/AdminView';
import { ADMIN_GURU_INIT, ADMIN_KELAS_INIT, ADMIN_SISWA_INIT, ADMIN_MAPEL_LIST } from '../../data/masterData';

export default function AdminRoot() {
  return (
    <AdminProvider initialData={{ guru: ADMIN_GURU_INIT, kelas: ADMIN_KELAS_INIT, siswa: ADMIN_SISWA_INIT, mapel: ADMIN_MAPEL_LIST }}>
      <AdminView />
    </AdminProvider>
  );
}
