import React, { useEffect, useState } from 'react';
import MapIndex from './MapIndex';
import Select from 'react-select';
import axios from 'axios';

export default function Home() {

    const url = "http://18.136.217.164:3001"

    const [route, setRoute] = useState('')
    const [routes, setRoutes] = useState([])
    const [stops, setStops] = useState([])


    const handleSelect = () => {
        axios.get(url + '/routes').then((res) => {
            setRoutes([{value: 0, label: 'All'}].concat(res.data))
        })
    }

    const handleSelectChange = (e) => {
        console.log('change fired')
        setRoute(e.label)
        let route = e.label
        if (e.label == 'All') {
            route = ''
        }
        axios.get(url + '/stops/' + route).then(res => {
            console.log(res.data)
            setStops(res.data)
        })
    }

    return (
        <div className="Home">
            <Select className="RouteSelect" options={routes} onMenuOpen={handleSelect} onChange={handleSelectChange} placeholder="Select route..." />
            <MapIndex stops={stops} route={route} />
        </div>
    )
}