import React, { useEffect, useState } from 'react';
import MapIndex from './MapIndex';
import Select from 'react-select';
import axios from 'axios';

export default function Home() {

    const url = "http://18.136.217.164:3001"

    const [route, setRoute] = useState('')
    const [routes, setRoutes] = useState([])
    const [stops, setStops] = useState([])
    const [filter, setFilter] = useState(
        {
            people: true,
            annotated: false,
            boarding: false,
            alighting: false,
            following: false
        }
    )

    useEffect(() => {
        console.log('filter', filter)
    }, [filter])

    const handleFilter = (e) => {
        let checkedBox = e.target
        setFilter(curr => {
            let tempFilter = JSON.parse(JSON.stringify(curr))
            tempFilter[checkedBox.value] = checkedBox.checked
            console.log(tempFilter)
            return (tempFilter)
        })
    }

    const handleSelect = () => {
        axios.get(url + '/routes').then((res) => {
            setRoutes([{value: 0, label: 'All'}].concat(res.data))
        })
    }

    const handleSelectChange = (e) => {
        console.log('change fired')
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
            <Select className="RouteSelect" options={routes} onMenuOpen={handleSelect} onChange={handleSelectChange} />
            <div className="filters">
                <input type="checkbox" id="people" name="people" value="people" on onChange={handleFilter} checked={filter.people}/>
                <label htmlFor="people"><span className="dot" style={{backgroundColor: '#1A05F3'}}/>Total Passengers (Automated)</label>
                <input type="checkbox" id="annotated" name="annotated" value="annotated" onChange={handleFilter} checked={filter.annotated}/>
                <label htmlFor="annotated"><span className="dot" style={{backgroundColor: '#4DC274'}}/>Total Passengers (Manual) </label>
                <input type="checkbox" id="boarding" name="boarding" value="boarding" onChange={handleFilter} checked={filter.boarding}/>
                <label htmlFor="boarding"><span className="dot" style={{backgroundColor: '#F7F603'}}/>Boarding (Manual)</label>
                <input type="checkbox" id="alighting" name="alighting" value="alighting" onChange={handleFilter} checked={filter.alighting}/>
                <label htmlFor="alighting"><span className="dot" style={{backgroundColor: '#E20000'}}/>Alighting (Manual)</label>
                <input type="checkbox" id="following" name="following" value="following" onChange={handleFilter} checked={filter.following}/>
                <label htmlFor="following">&#10060; COVID Regulations Violations (Manual)</label>
            </div>
            <MapIndex stops={stops} filter={filter} />
        </div>
    )
}