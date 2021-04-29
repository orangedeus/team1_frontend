import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, MapConsumer, Marker, Circle, ImageOverlay, CircleMarker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import L from 'leaflet';
import haversine from 'haversine';
import ReactPlayer from 'react-player';
import x from './assets/x.png';

const clean = (stops, parameter) => {

    let new_stops = []
    for (var i = 0; i < stops.length; i++) {
        let curr_num_x = (stops[i][parameter] * stops[i].location.x)
        let curr_num_y = (stops[i][parameter] * stops[i].location.y)
        let curr_den = Number(stops[i][parameter])
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
                curr_den += Number(stops[j][parameter])
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

export default function MapIndex(props) {

    const url = "http://18.136.217.164:3001"

    const mapRef = React.createRef()

    const prevPropsRef = useRef()

    useEffect(() => {
        prevPropsRef.current = props
    })

    const prevProps = prevPropsRef.current

    const displayMapMarkers = () => {
        let markerRender = []
        for (const key of Object.keys(props.filter)) {
            let stops = props.stops
            if (stops.length == 0) {
                break
            }
            if (props.filter[key]) {
                if (key != 'following') {
                    stops = clean(stops, key)
                    let color
                    switch (key) {
                        case 'annotated':
                            color = '#4DC274'
                            break
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
                        if (stops[i][key] == null) {
                            continue
                        }
                        let coord = [stops[i].location.x, stops[i].location.y]
                        let display = stops[i][key]
                        markerRender.push(
                            <Circle key={key + i} center={coord} color={color} radius={Math.ceil(display) * 15} />
                        )
                    }
                } else {
                    for (let i = 0; i < stops.length; i++) {
                        let coord = [stops[i].location.x, stops[i].location.y]
                        let display = stops[i][key]
                        if (stops[i][key] == true || stops[i][key] == null) {
                            continue
                        }
                        markerRender.push(
                            //<Marker key={key + i} position={coord} icon={xIcon} />
                            <ImageOverlay url={x} bounds={[[coord[0] - .0004, coord[1] - .0004], [coord[0] + .0004, coord[1] + .0004]]} interactive={true}>
                                <Popup className='popup'>
                                    <ReactPlayer className='video' playing={true} url={url + '/videos/' + stops[i].url} stopOnUnmount={true} width={640} height={360} controls={true}/>
                                </Popup>
                            </ImageOverlay>
                        )
                    }
                }
            }
        }
        return markerRender
    }

    return(
        <MapContainer className="MapContainer" ref={mapRef} center={props.stops.length == 0 ? [11.803, 122.563] : [props.stops[0].location.x, props.stops[0].location.y]} zoom={5}>
            {<MapConsumer>
                {(map) => {
                    let center = map.getCenter()
                    let zoom = map.getZoom()
                    console.log(center, zoom)
                    if (prevProps) {
                        if (prevProps.stops != props.stops) {
                            if (props.stops.length) {
                                map.flyTo([props.stops[0].location.x, props.stops[0].location.y], 17, {duration: 0.25})
                            } else {
                                map.setView([11.803, 122.563], 5)
                            }
                        }
                    }
                    return null
                }}
            </MapConsumer>}
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {displayMapMarkers()}
        </MapContainer>
    )
}