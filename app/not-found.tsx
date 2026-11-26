import Link from 'next/link';
import { routes } from '../lib/routes';
export default function NotFound() {
  return <main className="shell"><p className="eyebrow">404</p><h1>Halaman tidak ditemukan.</h1><Link className="primary" href={routes.home}>Kembali</Link></main>;
}
