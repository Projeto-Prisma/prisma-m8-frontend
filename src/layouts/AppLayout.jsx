import './AppLayout.css';

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h1>Conecta Recife</h1>

        <nav>
          <a href="/">Dashboard</a>
          <a href="/">Mapa</a>
          <a href="/">Denúncias</a>
          <a href="/">Órgãos Públicos</a>
          <a href="/">Notificações</a>
        </nav>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}