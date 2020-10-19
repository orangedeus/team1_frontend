import React, { useRef } from 'react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import Bounce from 'react-reveal/Bounce';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

class MapIndex extends React.Component {
    constructor(props) {
        super(props)
        this.mapRef = React.createRef();
        this.state = {
            position: [14.648991666666666, 121.06889166666666],
        }
    }
    componentDidUpdate() {
        console.log(this.mapRef)
        this.mapRef.current.leafletElement.closePopup();
        if (this.props.stops.length !== 0) {
            this.mapRef.current.leafletElement.setView(
                this.props.stops[0].coordinate,
                this.mapRef.current.leafletElement.getZoom(),
                {
                    "animate": true,
                    "pan": {
                        "duration": 1
                    }
                }
            );
        }
    }
    render() {
        let markerRender = []
        for (let i = 0; i < this.props.stops.length; i++) {
            let coord = this.props.stops[i].coordinate
            console.log(coord)
            markerRender.push(
                <Marker position={coord}>
                    <Popup>
                        People - {this.props.stops[i].people}
                    </Popup>
                </Marker>
            )
        }
        return(
            <Map ref={this.mapRef} center={this.state.position} zoom={20} className='MapContainer'>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markerRender}
            </Map>
        )
    }
}

export default MapIndex;