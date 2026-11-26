import { redirect } from 'next/navigation';
// Account is the cloud entry; the existing public local demo is explicitly separate.
export default function Dashboard(){redirect('/account');}
