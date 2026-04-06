/**
 * Visualizador de Geomarketing:
 * Geocodifica endereços da base e plota pins no mapa com código de cores
 * para leitura rápida da carteira (Vermelho = Inativo, Azul = Concorrência).
 */
import { useEffect, useState } from 'react';
import { CircleHelp } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { useAppContext } from '../context/AppContext';
import { geocodeAddress } from '../services/geocodeService';

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

  useEffect(() => {
    async function buildPins() {
      const base = [];
      for (const company of companies.slice(0, 40)) {
        const address = `${company.Endereco || ''}, ${company.Cidade || ''}`.trim();
        if (!address) continue;
        const coords = await geocodeAddress(address);
        if (!coords) continue;
        base.push({
          ...coords,
          nome: company.Empresa || company.RazaoSocial || 'Empresa',
          status: company.Status || 'Inativo',
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

  return (
    <section className="card space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Geomarketing</h2>
        <CircleHelp size={16} className="text-slate-400" />
        <p className="text-xs text-slate-400">Limite de 40 pinos para evitar bloqueio de geocoding.</p>
      </div>

      <div className="h-96 overflow-hidden rounded-lg border border-slate-800">
        <MapContainer center={[-14.235, -51.9253]} zoom={4} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pins.map((pin, idx) => (
            <Marker
              key={`${pin.nome}-${idx}`}
              position={[pin.lat, pin.lng]}
              icon={pin.status === 'Concorrência' ? blueIcon : redIcon}
            >
              <Popup>
                <div>
                  <strong>{pin.nome}</strong>
                  <br />
                  Status: {pin.status}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}
