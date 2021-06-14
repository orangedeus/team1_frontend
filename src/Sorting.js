import FormField from './FormField';

import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import Select from 'react-select';
import axios from 'axios';

export default function Sorting() {

    const url = 'http://18.136.217.164:3001'
    const [data, setData] = useState({})
    const [curr, setCurr] = useState('')
    const [dup, setDup] = useState('')

    useEffect(() => {
        axios.get(url + '/stops/duplicates').then(res => {
            let tempData = res.data
            setData(() => {
                let currData = {}
                for (const i of tempData) {
                    currData[i.main] = JSON.parse(i.duplicates)
                }
                return currData
            })
        })
    }, [])

    useEffect(() => {
        console.log(data)
    }, [data])

    return (
        <div className="Sorting">
            <div className="MainVideoContainer">
                <Select className="RouteSelect" options={Object.keys(data).map(key => {
                    return {value: key, label: key}
                })} onChange={(e) => {setCurr(e.label)}} />
                <ReactPlayer id={`video-player-${curr}`} key={`video-player-${curr}`} playing={false} url={`${url}/videos/${curr}`} stopOnUnmount={true} width={640} height={360} controls={true}/>
            </div>
            <div className="DuplicatesContainer">
                <Select className="RouteSelect" options={curr == '' ? [] : data[curr].map(dup => {
                    return {value: dup, label: dup}
                })} onChange={(e) => {setDup(e.label)}} />
                <ReactPlayer id={`video-player-${dup}`} key={`video-player-${dup}`} playing={false} url={`${url}/videos/${dup}`} stopOnUnmount={true} width={640} height={360} controls={true}/>
            </div>
        </div>
    )
}
{/* <div className="MainVideoContainer">
                <Select className="RouteSelect" options={Object.keys(data).map(key => {
                    return {value: key, label: key}
                })} onChange={(e) => {setCurr(e.label)}} />
                <ReactPlayer id={`video-player-${curr}`} key={`video-player-${curr}`} playing={false} url={`${url}/videos/${curr}`} stopOnUnmount={true} width={640} height={360} controls={true}/>
            </div>
            <div className="DuplicatesContainer">
                <Select className="RouteSelect" options={data.curr.map(dup => {
                    return {value: dup, label: dup}
                })} onChange={(e) => {setDup(e.label)}} />
                <ReactPlayer id={`video-player-${dup}`} key={`video-player-${dup}`} playing={false} url={`${url}/videos/${dup}`} stopOnUnmount={true} width={640} height={360} controls={true}/>
            </div> */}