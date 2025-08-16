import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet'
import L from 'leaflet'

import 'leaflet/dist/leaflet.css';

const MapComponent = ({ center, zoom, listDevices = [] }) => {
  const gatewayIcon = L.icon({
    iconUrl: 'https://images.ctfassets.net/3prze68gbwl1/assetglossary-17su9wok1ui0z7w/c4c4bdcdf0d0f86447d3efc450d1d081/map-marker.png',
    iconSize: [40, 40],
    iconAnchor: [16, 32]
  })
  const listMarkers = listDevices.map((device) => {
    return (
      <Marker position={device.location} title={device.name} key={device.deviceId}>
        <Popup>
          {device.name}
        </Popup>
        <Tooltip direction="top" offset={[10, 0]}>
          {device.name}
        </Tooltip>
      </Marker>
    )
  })
  
  return (
    <div style={{ height: '100%', width: '100%', }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} zoomSnap={1} zoomDelta={1}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker icon={gatewayIcon} position={[10.966721075368081, 106.72300457954408]} title="gateway" key="gateway">
          <Popup>
            Gateway
          </Popup>
          <Tooltip direction="top" offset={[10, 0]}>
            Gateway
          </Tooltip>
        </Marker>
        {listMarkers}
      </MapContainer>
    </div>
  )
}

export default MapComponent
