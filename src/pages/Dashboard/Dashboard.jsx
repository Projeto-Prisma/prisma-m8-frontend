import { mockDenuncias } from '../../data/mockDenuncias';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <section>
      <header className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Visão geral inicial do módulo frontend com dados mockados.</p>
      </header>

      <div className="cards">
        <div className="card">
          <span>Total de denúncias</span>
          <strong>{mockDenuncias.length}</strong>
        </div>

        <div className="card">
          <span>Alta prioridade</span>
          <strong>
            {mockDenuncias.filter((denuncia) => denuncia.prioridade === 'Alta').length}
          </strong>
        </div>

        <div className="card">
          <span>Em análise</span>
          <strong>
            {mockDenuncias.filter((denuncia) => denuncia.status === 'Em análise').length}
          </strong>
        </div>
      </div>

      <div className="table-card">
        <h3>Denúncias recentes</h3>

        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Bairro</th>
              <th>Prioridade</th>
              <th>Status</th>
              <th>Órgão</th>
            </tr>
          </thead>

          <tbody>
            {mockDenuncias.map((denuncia) => (
              <tr key={denuncia.id}>
                <td>{denuncia.titulo}</td>
                <td>{denuncia.bairro}</td>
                <td>{denuncia.prioridade}</td>
                <td>{denuncia.status}</td>
                <td>{denuncia.orgaoResponsavel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}