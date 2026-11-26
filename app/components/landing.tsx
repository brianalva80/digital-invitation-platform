import { showcase } from '../../lib/showcase';
import { routes } from '../../lib/routes';

type Props = { base?: string; studioHref?: string };
export function Landing({ base = '', studioHref = routes.studio }: Props) {
  const asset = (file: string) => `${base}/showcase/${file}`;
  return <div className="landing" id="top">
    <a className="skip-link" href="#main-content">Lewati ke konten</a>
    <header className="site-header"><div className="site-width header-inner">
      <a className="wordmark" href="#top" aria-label="AMPLOP beranda">amplop<span>.</span></a>
      <nav aria-label="Navigasi utama"><a href="#koleksi">Koleksi</a><a href="#cara-kerja">Cara kerja</a></nav>
      <a className="header-cta" href={studioHref}>Coba studio <span aria-hidden="true">↗</span></a>
    </div></header>
    <main id="main-content">
      <section className="hero site-width" aria-labelledby="hero-title">
        <div className="hero-copy"><p className="overline"><span></span> DIGITAL WEDDING EXPERIENCES</p>
          <h1 id="hero-title">Bukan sekadar<br/>undangan.<br/><em>Sebuah pengalaman.</em></h1>
          <p className="hero-description">Sambut orang-orang terkasih dengan undangan yang terasa seperti kisah cinta kalian sendiri. Lima pengalaman interaktif, satu ruang untuk mempersonalisasinya.</p>
          <div className="hero-actions"><a className="landing-button" href={studioHref}>Create your invitation <span aria-hidden="true">↗</span></a><a className="text-link" href="#koleksi">Jelajahi koleksi <span aria-hidden="true">↓</span></a></div>
          <p className="hero-note">Coba editor demo tanpa biaya. {base==='.'?'Belum tersedia publikasi online.':'Publikasi hanya untuk uji sandbox yang dikonfigurasi.'}</p>
        </div>
        <div className="hero-art"><div className="hero-image"><img src={asset('hero.webp')} alt="Pasangan fiktif dalam fotografi pernikahan bernuansa hangat" width="504" height="1024" fetchPriority="high"/><span className="photo-caption">THE ART OF INVITING <span>01 / 05</span></span></div>
          <details className="hero-letter"><summary><span className="letter-flap" aria-hidden="true"></span><span className="letter-seal" aria-hidden="true">a.</span><span className="letter-label">Sebuah surat untukmu <span aria-hidden="true">↗</span></span></summary><div className="letter-message"><p>Every love has a story.</p><a href="#koleksi">Temukan cara menceritakannya ↓</a></div></details>
          <p className="hero-art-index">01 — THE SIGNATURE COLLECTION</p>
        </div>
      </section>
      <div className="collection-banner"><div className="site-width"><span>Immersive by design.</span><span>Personal by nature.</span><span>Made for your story.</span></div></div>
      <section id="koleksi" className="site-width collection" aria-labelledby="collection-title">
        <div className="section-heading"><div><p className="overline"><span></span> THE SIGNATURE COLLECTION / 01</p><h2 id="collection-title">Lima cara merayakan <em>cinta.</em></h2></div><p>Setiap desain memiliki pembukaan, alur cerita, dan interaksi yang khas. Buka demo untuk merasakan perbedaannya.</p></div>
        <div className="template-grid">{showcase.map(item => <article key={item.key} className={`template-card ${item.key}`}>
          <a className="template-image-link" href={`${base}/demo/templates/${item.key}.html`} aria-label={`Coba demo ${item.title}`}><div className="template-image"><img src={asset(`${item.key}.webp`)} alt={`Tampilan aktual undangan ${item.title}`} width="390" height="844" loading="lazy" decoding="async"/></div><span className="template-number">NO. {item.number}</span><span className="preview-icon" aria-hidden="true">↗</span></a>
          <div className="template-copy"><p className="template-interaction">{item.interaction}</p><h3>{item.title}</h3><p className="tagline">{item.tagline}</p><p>{item.description}</p><a className="text-link" href={`${base}/demo/templates/${item.key}.html`}>Coba undangan <span aria-hidden="true">↗</span></a></div>
        </article>)}</div>
      </section>
      <section id="cara-kerja" className="process" aria-labelledby="process-title"><div className="site-width process-inner"><div><p className="overline"><span></span> YOUR INVITATION, YOUR WAY</p><h2 id="process-title">Buat undangan yang <em>benar-benar kalian.</em></h2><p>Eksplorasi Invitation Studio sebelum memutuskan desain.</p></div><ol className="steps"><li><strong>01</strong><div><h3>Pilih pengalaman</h3><p>Coba lima desain dengan signature opening berbeda.</p></div></li><li><strong>02</strong><div><h3>Personalisasi ceritanya</h3><p>Ubah nama, jadwal, foto, warna, font, dan unggah musik sendiri.</p></div></li><li><strong>03</strong><div><h3>Lihat hasilnya langsung</h3><p>Ganti desain tanpa mengisi ulang data; bandingkan preview mobile dan desktop.</p></div></li></ol></div></section>
      <section className="site-width final-cta"><p className="overline">YOUR STORY STARTS HERE</p><h2>Ready to tell <em>your story?</em></h2><p>Mulai dengan data contoh di Invitation Studio.</p><a className="landing-button" href={studioHref}>Create your invitation <span aria-hidden="true">↗</span></a></section>
    </main>
    <footer className="site-footer"><div className="site-width"><a className="wordmark" href="#top">amplop<span>.</span></a><p>Not just an invitation. An experience.</p><small>{base==='.'?'Prototype V18 · Data dan foto fiktif · Akun, pembayaran, dan publikasi belum aktif.':'AMPLOP V21 · Data fiktif · Checkout dan publikasi sandbox saja.'}</small></div></footer>
  </div>;
}
