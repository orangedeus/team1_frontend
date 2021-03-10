import React, { useRef } from 'react';
import { Map, Marker, Circle, CircleMarker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import Bounce from 'react-reveal/Bounce';
import L from 'leaflet';
import Annotation from './Annotation';
import axios from 'axios';


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
        this.defCenter = [0, 0]
    }
    render() {
        let markerRender = []
        let position = []
        for (let i = 0; i < this.props.stops.length; i++) {
            let coord = [this.props.stops[i].location.x, this.props.stops[i].location.y]
            let people = this.props.stops[i].people
            markerRender.push(
                <Circle key={i} center={coord} radius={Math.ceil(people) * 15} />
            )
        }
        return(
            <div className='MapContainer'>
                {this.props.load && <Map ref={this.mapRef} center={this.props.stops.length ? [this.props.stops[0].location.x, this.props.stops[0].location.y] : [0, 0]} zoom={20} className='MapContainer'>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {markerRender}
                </Map>}
            </div>
        )
    }
}

export default MapIndex;