/**
 * Visualizador de Geomarketing (Expansão Regional):
 * Amplia radar da Baixada/Itaguaí, permite alternar Pins x Heatmap,
 * e aplica filtros por Polo Industrial para orientar decisões de prospecção.
 */
import { useEffect, useMemo, useState } from 'react';
import { CircleHelp, Flame, MapPin } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import HeatmapLayer from 'react-leaflet-heatmap-layer';
import L from 'leaflet';
import { useAppContext } from '../context/AppContext';
import { geocodeAddress } from '../services/geocodeService';

const TARGET_CITIES = ['Nova Iguaçu', 'Duque de Caxias', 'Queimados', 'Itaguaí', 'Paracambi'];

const POLOS = {
  todos: 'Todos',
  itaguai: 'Porto de Itaguaí',
  queimados: 'Polo de Queimados',
};

const CITY_FALLBACK_COORDS = {
  'Nova Iguaçu': { lat: -22.7592, lng: -43.4511, polo: 'Polo de Queimados' },
  'Duque de Caxias': { lat: -22.7858, lng: -43.3049, polo: 'Polo de Queimados' },
  Queimados: { lat: -22.7165, lng: -43.5554, polo: 'Polo de Queimados' },
  Itaguaí: { lat: -22.8522, lng: -43.7756, polo: 'Porto de Itaguaí' },
  Paracambi: { lat: -22.6078, lng: -43.7101, polo: 'Polo de Queimados' },
};

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function GeomarketingMap() {
  const { companies } = useAppContext();
  const [pins, setPins] = useState([]);
  const [mapMode, setMapMode] = useState('pins');
  const [poloFilter, setPoloFilter] = useState('todos');

  useEffect(() => {
    async function buildPins() {
      const base = [];

      for (const company of companies.slice(0, 80)) {
        const city = company.Cidade || company.Municipio || '';
        if (!TARGET_CITIES.includes(city)) continue;

        const address = `${company.Endereco || ''}, ${city}`.trim();
        const coords = address ? await geocodeAddress(address) : null;
        const fallback = CITY_FALLBACK_COORDS[city];

        if (!coords && !fallback) continue;

        base.push({
          lat: coords?.lat ?? fallback.lat,
          lng: coords?.lng ?? fallback.lng,
          nome: company.Empresa || company.RazaoSocial || 'Empresa',
          status: company.Status || 'Inativo',
          cidade: city,
          polo: company['Polo Industrial'] || fallback.polo,
          intensity: company.Status === 'Concorrência' ? 1 : 0.6,
        });
      }

      setPins(base);
    }

    if (companies.length) {
      buildPins();
    } else {
      setPins([]);
    }
  }, [companies]);

  const filteredPins = useMemo(() => {
    if (poloFilter === 'todos') return pins;
    return pins.filter((pin) => pin.polo === POLOS[poloFilter]);
  }, [pins, poloFilter]);

  return (
    <section className="card space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Geomarketing</h2>
          <CircleHelp size={16} className="text-slate-400" />
          <p className="text-xs text-slate-400">Radar expandido: Nova Iguaçu, Caxias, Queimados, Itaguaí e Paracambi.</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-sm"
            value={poloFilter}
            onChange={(event) => setPoloFilter(event.target.value)}
          >
            {Object.entries(POLOS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700"
            onClick={() => setMapMode((prev) => (prev === 'pins' ? 'heatmap' : 'pins'))}
          >
            {mapMode === 'pins' ? <Flame size={14} /> : <MapPin size={14} />}
            {mapMode === 'pins' ? 'Ver Heatmap' : 'Ver Pins'}
          </button>
        </div>
      </div>

      <div className="h-96 overflow-hidden rounded-lg border border-slate-800">
        <MapContainer center={[-22.85, -43.57]} zoom={10} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mapMode === 'heatmap' ? (
            <HeatmapLayer
              fitBoundsOnLoad
              fitBoundsOnUpdate
              points={filteredPins}
              longitudeExtractor={(point) => point.lng}
              latitudeExtractor={(point) => point.lat}
              intensityExtractor={(point) => point.intensity}
              max={1}
              radius={25}
              blur={18}
            />
          ) : (
            filteredPins.map((pin, idx) => (
              <Marker
                key={`${pin.nome}-${idx}`}
                position={[pin.lat, pin.lng]}
                icon={pin.status === 'Concorrência' ? blueIcon : redIcon}
              >
                <Popup>
                  <div>
                    <strong>{pin.nome}</strong>
                    <br />
                    Cidade: {pin.cidade}
                    <br />
                    Polo: {pin.polo}
                    <br />
                    Status: {pin.status}
                  </div>
                </Popup>
              </Marker>
            ))
          )}
        </MapContainer>
      </div>
    </section>
  );
}
