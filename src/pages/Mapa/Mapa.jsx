import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import PageHeader from '../../components/PageHeader';
import Icon from '../../components/Icon';
import { CritBadge } from '../../components/Badges';
import { critMeta, NIVEIS_CRITICIDADE } from '../../data/criticidade';
import { fetchRecorrencias, fetchMapaCalor, derivarCriticidade } from '../../services/m7Service';
import './Mapa.css';

const RECIFE_BOUNDARY = [
  [-7.9412, -34.9884], [-7.942, -34.9806], [-7.9395, -34.977], [-7.9418, -34.9686],
  [-7.9299, -34.9449], [-7.936, -34.9301], [-7.9339, -34.9243], [-7.9361, -34.9149],
  [-7.9442, -34.9092], [-7.9777, -34.9135], [-7.988, -34.9174], [-7.9903, -34.915],
  [-8.0014, -34.9013], [-8.0058, -34.8857], [-8.0119, -34.8796], [-8.0184, -34.8789],
  [-8.0183, -34.8727], [-8.0328, -34.8755], [-8.0418, -34.8633], [-8.0442, -34.8603],
  [-8.0482, -34.8593], [-8.09, -34.8796], [-8.1622, -34.9118], [-8.1441, -34.9159],
  [-8.1401, -34.923], [-8.1372, -34.9449], [-8.134, -34.9477], [-8.1191, -34.9607],
  [-8.1152, -34.9641], [-8.0893, -34.9697], [-8.0857, -34.9744], [-8.079, -34.9721],
  [-8.0796, -34.9774], [-8.0748, -34.9857], [-8.0611, -34.9959], [-8.0639, -35.0026],
  [-8.0561, -35.0148], [-8.0521, -35.0029], [-8.049, -34.9939], [-8.0416, -34.9935],
  [-8.0372, -34.9969], [-8.0314, -34.9922], [-8.036, -34.9843], [-8.025, -34.9733],
  [-8.0181, -34.9663], [-8.0182, -34.9625], [-8.0084, -34.9655], [-7.9925, -34.9619],
  [-7.989, -34.9644], [-7.9736, -34.9626], [-7.97, -34.9803], [-7.9625, -34.9926],
  [-7.9633, -35.0019], [-7.9487, -34.9999], [-7.9454, -35.0085], [-7.9297, -35.0],
];

const RECIFE_CENTER = [-8.0476, -34.877];
const RECIFE_ZOOM = 13;
const RECIFE_BOUNDS = [[-8.17, -35.06], [-7.95, -34.83]];

const BAIRROS_COORDS = {
  'Afogados':              [-8.0815, -34.9211],
  'Água Fria':             [-8.0076, -34.9189],
  'Alto José Bonifácio':   [-8.0167, -34.9272],
  'Alto José do Pinho':    [-8.0132, -34.9305],
  'Alto do Mandu':         [-8.0634, -34.9384],
  'Areias':                [-8.0889, -34.9305],
  'Arruda':                [-7.9934, -34.9047],
  'Beberibe':              [-7.9918, -34.8930],
  'Boa Viagem':            [-8.1192, -34.8978],
  'Boa Vista':             [-8.0606, -34.8818],
  'Bomba do Hemetério':    [-7.9932, -34.9001],
  'Brejo da Guabiraba':    [-8.0010, -34.9356],
  'Brejo de Beberibe':     [-7.9964, -34.8936],
  'Cajueiro':              [-8.0430, -34.9423],
  'Campina do Barreto':    [-7.9885, -34.9064],
  'Campo Grande':          [-8.0515, -34.9288],
  'Caxangá':               [-8.0497, -34.9600],
  'Cidade Universitária':  [-8.0498, -34.9476],
  'Coelhos':               [-8.0620, -34.8761],
  'Cohab':                 [-8.0816, -34.9460],
  'Cordeiro':              [-8.0618, -34.9299],
  'Córrego do Jenipapo':   [-8.1012, -34.9410],
  'Derby':                 [-8.0524, -34.8935],
  'Dois Irmãos':           [-7.9993, -34.9600],
  'Doze de Outubro':       [-8.0086, -34.9119],
  'Encruzilhada':          [-8.0059, -34.9009],
  'Engenho do Meio':       [-8.0571, -34.9438],
  'Espinheiro':            [-8.0416, -34.9036],
  'Fundão':                [-8.0748, -34.9437],
  'Graças':                [-8.0372, -34.9028],
  'Gracuí':                [-8.0736, -34.9542],
  'Guabiraba':             [-8.0035, -34.9409],
  'Hipódromo':             [-8.0428, -34.9144],
  'Ibura':                 [-8.1064, -34.9440],
  'Ilha do Leite':         [-8.0553, -34.8821],
  'Ilha do Retiro':        [-8.0655, -34.9136],
  'Ilha Joana Bezerra':    [-8.0726, -34.8876],
  'Imbiribeira':           [-8.1034, -34.9138],
  'Ipsep':                 [-8.1084, -34.9283],
  'Jaqueira':              [-8.0403, -34.9006],
  'Jardim São Paulo':      [-8.0149, -34.9227],
  'Joana Bezerra':         [-8.0722, -34.8839],
  'Jordão':                [-8.1014, -34.9351],
  'Linha do Tiro':         [-7.9996, -34.9107],
  'Macaxeira':             [-8.0076, -34.9406],
  'Mangabeira':            [-8.0534, -34.9551],
  'Mangueira':             [-8.0709, -34.9032],
  'Monteiro':              [-8.0381, -34.9268],
  'Morro da Conceição':    [-7.9904, -34.9211],
  'Mustardinha':           [-8.0808, -34.9340],
  'Nova Descoberta':       [-8.0168, -34.9175],
  'Novo Chester':          [-8.0067, -34.9267],
  'Paissandu':             [-8.0529, -34.8917],
  'Parnamirim':            [-8.0262, -34.9070],
  'Peixinhos':             [-7.9889, -34.9156],
  'Pina':                  [-8.0937, -34.8977],
  'Ponto de Parada':       [-7.9943, -34.9079],
  'Poço':                  [-8.0245, -34.9006],
  'Prado':                 [-8.0651, -34.9232],
  'Recife':                [-8.0631, -34.8711],
  'Rosarinho':             [-8.0291, -34.9090],
  'Sancho':                [-8.0795, -34.9480],
  'Santa Terezinha':       [-7.9899, -34.9237],
  'Santana':               [-8.0434, -34.8960],
  'Santo Amaro':           [-8.0695, -34.8788],
  'São José':              [-8.0672, -34.8737],
  'Setúbal':               [-8.1249, -34.9120],
  'Sítio dos Pintos':      [-8.0218, -34.9469],
  'Soledade':              [-8.0455, -34.8936],
  'Tejipió':               [-8.0894, -34.9338],
  'Torreão':               [-8.0032, -34.8981],
  'Torre':                 [-8.0510, -34.9210],
  'Torrões':               [-8.0782, -34.9149],
  'Totó':                  [-8.0924, -34.9461],
  'Três Carneiros':        [-8.1115, -34.9397],
  'Várzea':                [-8.0477, -34.9665],
  'Vasco da Gama':         [-7.9946, -34.9181],
  'Vista Alegre':          [-8.0169, -34.9152],
  'Zumbi':                 [-8.0106, -34.9062],
};

function CamadaCalor({ pontos }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!pontos.length) return;

    if (layerRef.current) map.removeLayer(layerRef.current);

    layerRef.current = L.heatLayer(pontos, {
      radius: 50,
      blur: 40,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.10: '#818cf8',
        0.30: '#38bdf8',
        0.50: '#4ade80',
        0.65: '#facc15',
        0.80: '#fb923c',
        1.00: '#ef4444',
      },
    });
    layerRef.current.addTo(map);

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, pontos]);

  return null;
}

function raioMarcador(count, maxCount) {
  return 6 + (count / Math.max(maxCount, 1)) * 12;
}

export default function Mapa() {
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ativo, setAtivo] = useState(null);

  const NIVEL_MAP = { CRITICO: 'Crítico', ALTO: 'Alto', MEDIO: 'Médio', BAIXO: 'Baixo' };

  useEffect(() => {
    Promise.all([
      fetchMapaCalor({ janelaDias: 30, limite: 500 }).catch(() => []),
      fetchRecorrencias({ minContagem: 2, limite: 200 }).catch(() => []),
    ]).then(([mapaCalor, recorrencias]) => {
      // Zonas PRINCIPAIS: agregação por bairro a partir de todas as denúncias (mapa-calor)
      const porBairro = new Map();
      for (const item of mapaCalor) {
        const bairro = item.localizacao?.endereco;
        if (!bairro) continue;
        if (!porBairro.has(bairro)) {
          porBairro.set(bairro, { bairro, categorias: {}, total: 0, niveis: {} });
        }
        const z = porBairro.get(bairro);
        z.total += 1;
        z.categorias[item.categoria] = (z.categorias[item.categoria] ?? 0) + 1;
        if (item.nivel) z.niveis[item.nivel] = (z.niveis[item.nivel] ?? 0) + 1;
      }

      // Bairros com recorrência real (2+ do mesmo tipo) — indicador visual complementar
      const recorrenciaBairros = new Set(recorrencias.map((r) => r.regiao));

      const zonasProcessadas = [...porBairro.values()].map((z) => {
        const catPrincipal =
          Object.entries(z.categorias).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
        const nivelPrincipal =
          Object.entries(z.niveis).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
        return {
          bairro: z.bairro,
          categoria: catPrincipal,
          count: z.total,
          criticidade: nivelPrincipal ? (NIVEL_MAP[nivelPrincipal] ?? derivarCriticidade(z.total)) : derivarCriticidade(z.total),
          coords: BAIRROS_COORDS[z.bairro] ?? null,
          recorrencia: recorrenciaBairros.has(z.bairro),
        };
      }).sort((a, b) => b.count - a.count);

      setZonas(zonasProcessadas);
      if (zonasProcessadas.length > 0) setAtivo(zonasProcessadas[0].bairro);
    }).finally(() => setLoading(false));
  }, []);

  const zonasComCoords = zonas.filter((z) => z.coords !== null);
  const zonaAtiva = zonas.find((z) => z.bairro === ativo);
  const maxCount = Math.max(...zonas.map((z) => z.count), 1);

  const pontosCalor = zonasComCoords.map((z) => [
    z.coords[0],
    z.coords[1],
    z.count / maxCount,
  ]);

  return (
    <section>
      <PageHeader
        title="Mapa de calor — Recife"
        subtitle="Densidade de denúncias por bairro em tempo real. Áreas mais quentes concentram maior volume de ocorrências."
      />

      <div className="mapa-grid">
        {/* Mapa */}
        <div className="card-surface mapa-canvas-card">
          <div className="mapa-canvas">
            <MapContainer
              center={RECIFE_CENTER}
              zoom={RECIFE_ZOOM}
              minZoom={12}
              maxZoom={17}
              maxBounds={RECIFE_BOUNDS}
              maxBoundsViscosity={0.8}
              className="mapa-leaflet"
              zoomControl
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              <Polygon
                positions={RECIFE_BOUNDARY}
                pathOptions={{ color: '#005aa7', weight: 2, dashArray: '6 6', fill: false }}
                interactive={false}
              />
              {!loading && <CamadaCalor pontos={pontosCalor} />}
              {!loading &&
                zonasComCoords.map((z) => {
                  const m = critMeta(z.criticidade);
                  const isAtivo = z.bairro === ativo;
                  return (
                    <CircleMarker
                      key={z.bairro}
                      center={z.coords}
                      radius={raioMarcador(z.count, maxCount)}
                      pathOptions={{
                        fillColor: '#ffffff',
                        fillOpacity: isAtivo ? 0.95 : 0.75,
                        color: m.color,
                        weight: isAtivo ? 3.5 : (z.recorrencia ? 2.5 : 1.5),
                        dashArray: z.recorrencia && !isAtivo ? '5 3' : null,
                      }}
                      eventHandlers={{
                        click: () => setAtivo(z.bairro),
                        mouseover: () => setAtivo(z.bairro),
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -4]}>
                        <strong>{z.bairro}</strong>
                        <br />
                        {z.count} denúncia{z.count !== 1 ? 's' : ''} · {z.criticidade}
                        {z.recorrencia && <><br />⚠ padrão recorrente</>}
                      </Tooltip>
                    </CircleMarker>
                  );
                })}
            </MapContainer>

            {loading && (
              <div className="mapa-loading-overlay">Carregando dados…</div>
            )}

            <span className="mapa-tag">Dados ao vivo · M7 Analytics</span>
          </div>

          <div className="mapa-legenda">
            <span className="legenda-calor">
              <span className="legenda-gradiente" />
              <span>Densidade: baixa → alta</span>
            </span>
            {NIVEIS_CRITICIDADE.map((n) => {
              const m = critMeta(n);
              return (
                <span key={n} className="legenda-item">
                  <span className="legenda-dot" style={{ background: m.color }} />
                  {n}
                </span>
              );
            })}
          </div>
        </div>

        {/* Painel lateral */}
        <div className="mapa-side">
          {zonaAtiva && (
            <div
              className="card-surface zona-destaque"
              style={{ '--c': critMeta(zonaAtiva.criticidade).color }}
            >
              <span className="zona-destaque-eyebrow">
                <Icon name="pin" size={14} /> Região selecionada
              </span>
              <h2>{zonaAtiva.bairro}</h2>
              <div className="zona-destaque-stat">
                <strong className="tnum">{zonaAtiva.count}</strong>
                <span>denúncias ativas</span>
              </div>
              <CritBadge nivel={zonaAtiva.criticidade} />
              {zonaAtiva.categoria && zonaAtiva.categoria !== '—' && (
                <p className="zona-destaque-categoria">Mais comum: {zonaAtiva.categoria}</p>
              )}
            </div>
          )}

          <div className="card-surface">
            <div className="card-head">
              <h2>Bairros por volume</h2>
            </div>
            {loading ? (
              <p style={{ padding: '16px', color: 'var(--muted)', fontSize: 13 }}>Carregando…</p>
            ) : zonas.length === 0 ? (
              <p style={{ padding: '16px', color: 'var(--muted)', fontSize: 13 }}>
                Sem denúncias no período selecionado.
              </p>
            ) : (
              <ul className="zona-list">
                {zonas.map((z) => {
                  const m = critMeta(z.criticidade);
                  const pct = Math.round((z.count / maxCount) * 100);
                  return (
                    <li
                      key={z.bairro}
                      className={`zona-row ${z.bairro === ativo ? 'is-ativo' : ''}`}
                      onMouseEnter={() => setAtivo(z.bairro)}
                      onClick={() => setAtivo(z.bairro)}
                    >
                      <div className="zona-row-top">
                        <span className="zona-nome">
                          {z.bairro}
                          {z.recorrencia && (
                            <span title="Padrão recorrente" style={{ marginLeft: 4, opacity: 0.7, fontSize: 11 }}>↩</span>
                          )}
                          {z.categoria && z.categoria !== '—' && (
                            <span className="zona-categoria">{z.categoria}</span>
                          )}
                        </span>
                        <span className="zona-count tnum" style={{ color: m.color }}>
                          {z.count}
                        </span>
                      </div>
                      <div className="zona-track">
                        <div
                          className="zona-fill"
                          style={{ width: `${pct}%`, background: m.color }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
