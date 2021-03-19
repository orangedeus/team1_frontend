import React, { useRef } from 'react';
import { Map, Marker, Circle, CircleMarker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import L from 'leaflet';
import haversine from 'haversine';


var clean = (stops, parameter) => {
    let new_stops = []
    for (var i = 0; i < stops.length; i++) {
        let curr_num_x = (stops[i][parameter] * stops[i].location.x)
        let curr_num_y = (stops[i][parameter] * stops[i].location.y)
        let curr_den = stops[i][parameter]
        let gathered_n = 1
        for (var j = 0; j < stops.length; j++) {
            if (i == j) {
                continue;
            }
            let coord1 = {
                latitude: stops[i].location.x,
                longitude: stops[i].location.y
            }
            let coord2 = {
                latitude: stops[j].location.x,
                longitude: stops[j].location.y
            }
            let dist = haversine(coord1, coord2)
            if (dist < 0.1) {
                curr_num_x += (stops[j][parameter] * stops[j].location.x)
                curr_num_y += (stops[j][parameter] * stops[j].location.y)
                curr_den += stops[j][parameter]
                gathered_n += 1
                stops.splice(j, 1)
                j = j - 1
            }
        }
        if (curr_den == 0) {
            continue
        }
        let new_x = curr_num_x / curr_den
        let new_y = curr_num_y / curr_den
        let new_people = curr_den / gathered_n
        let new_stop = 
        {
            location: {
                x: new_x,
                y: new_y
            },
        }
        new_stop[parameter] = new_people
        new_stops.push(new_stop)
    }
    return (new_stops)
  }

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
        console.log(this.props.filter)
        let markerRender = []
        let position = []
        
        for (const key of Object.keys(this.props.filter)) {
            if (key == 'cleaned') {
                continue
            }
            if (this.props.filter[key]) {
                let stops = JSON.parse(JSON.stringify(this.props.stops))
                if (this.props.filter.cleaned) {
                    stops = clean(stops, key)
                    console.log("cleaning " + key)
                }
                console.log(stops)
                let color
                switch (key) {
                    case 'boarding':
                        color = '#F7F603'
                        break
                    case 'alighting':
                        color = '#E20000'
                        break
                    default:
                        color = '#1A05F3'
                        break
                }
                for (let i = 0; i < stops.length; i++) {
                    let coord = [stops[i].location.x, stops[i].location.y]
                    let display = stops[i][key]
                    markerRender.push(
                        <Circle key={key + i} center={coord} color={color} radius={Math.ceil(display) * 15} />
                    )
                }
                console.log(markerRender)
            }
        }

        return(
            <div className='MapContainer'>
                <Map ref={this.mapRef} center={this.props.stops.length ? [this.props.stops[0].location.x, this.props.stops[0].location.y] : [11.803, 122.563]} zoom={this.props.stops.length ? 20 : 5} className='MapContainer'>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {markerRender}
                </Map>
            </div>
        )
    }
}

export default MapIndex;