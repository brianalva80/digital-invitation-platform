import type { Metadata } from 'next';
import { Landing } from './components/landing';
import './landing.css';
import { routes } from '../lib/routes';
export const metadata: Metadata = {
  title: 'Undangan Digital Interaktif',
  description: 'Jelajahi lima desain undangan digital interaktif AMPLOP dan coba editor untuk personalisasi nama, foto, warna, tipografi, serta musik.',
  robots: { index: false, follow: false },
};
export default function Home() { return <Landing studioHref={routes.dashboard} />; }
