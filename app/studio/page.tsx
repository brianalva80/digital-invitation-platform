import type { Metadata } from 'next';
import Link from 'next/link';
import { routes } from '../../lib/routes';

export const metadata: Metadata = { title: 'Invitation Studio Preview' };
export default function Studio() {
  return <main className="shell">
    <Link href={routes.home}>← Kembali</Link>
    <p><Link href={routes.dashboard}>Wedding workspace ↗</Link></p>
    <p className="eyebrow">V14 / Original prototype</p>
    <h1>Invitation Studio.</h1>
    <p>Demo asli dengan lima desain, editor, foto, tipografi, dan musik. Source prototype dipertahankan tanpa perubahan.</p>
    <p className="note">Gunakan data fiktif. Draft dan RSVP bersifat lokal/demo; ekspor HTML bukan publikasi online. Jangan unggah data pribadi atau musik tanpa hak penggunaan.</p>
    <a className="primary" href={routes.demo}>Buka demo interaktif V14</a>
  </main>;
}
