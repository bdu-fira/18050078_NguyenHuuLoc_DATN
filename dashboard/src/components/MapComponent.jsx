import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet'

import 'leaflet/dist/leaflet.css';

const MapComponent = ({ center, zoom, listDevices = [] }) => {
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
        {listMarkers}
      </MapContainer>
    </div>
  )
}

export default MapComponent
