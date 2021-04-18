import L from 'leaflet';

const xIcon = new L.Icon({
    iconUrl: require('./x.png'),
    iconRetinaUrl: require('./x.png'),
    iconAnchor: null,
    popupAnchor: null,
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null,
    iconSize: new L.point(40, 40),
    className: 'xicon'
});

export { xIcon };