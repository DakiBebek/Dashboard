import '../styles/globals.css';
import Link from 'next/link';
import { useRouter } from 'next/router';

function Navbar() {
  const router = useRouter();
  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/schedule', label: 'Jadwal Kuliah' },
    { href: '/tasks', label: 'Tugas' },
    { href: '/movies', label: 'Film & Series' },
    { href: '/books', label: 'Buku' },
  ];
  return (
    <div className="navbar">
      <strong>📊 My Dashboard</strong>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={router.pathname === l.href ? 'active' : ''}>
          {l.label}
        </Link>
      ))}
    </div>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <div className="container">
        <Component {...pageProps} />
      </div>
    </>
  );
}
