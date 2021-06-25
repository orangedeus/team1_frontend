import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Spreadsheet from 'react-spreadsheet';
import { CSVLink } from 'react-csv';


export default function CSV(props) {

    const [data, setData] = useState([])
    const [downloadData, setDownload] = useState([])
    const [displayData, setDisplay] = useState([])
    const [available, setA] = useState(false)
    
    useEffect(() => {
        axios.get(props.source).then(res => {
            setData(res.data)
        })
        console.log(props.source.split('/')[-1])
    }, [props.source])

    useEffect(() => {
        if (data.length == 0) {
            return
        }
        console.log(data)
        parseForDownload()
        parseForDisplay()
    }, [data])

    useEffect(() => {
        setA(true)
    }, [downloadData])

    const parseForDownload = () => {
        let tempData = []

        let header = Object.keys(data[0]).map(key => {
            return key
        })

        let body = data.map(entry => {
            let newEntry = []
            for (const key of Object.keys(entry)) {
                if (typeof entry[key] == "boolean") {
                    if (entry[key]) {
                        newEntry.push("true")
                    } else {
                        newEntry.push("false")
                    }
                } else {
                    newEntry.push(entry[key])
                }
            }
            return newEntry
        })

        tempData.push(header)
        for (const i of body) {
            tempData.push(i)
        }
        setDownload(tempData)
    }

    const parseForDisplay = () => {
        let tempData = []

        let header = Object.keys(data[0]).map(key => {
            return {value: key}
        })
        while (header.length < 10) {
            header.push('')
        }

        let body = data.map(entry => {
            let newEntry = []
            for (const key of Object.keys(entry)) {
                newEntry.push({value: entry[key]})
            }
            return newEntry
        })

        tempData.push(header)
        for (const i of body) {
            tempData.push(i)
        }
        setDisplay(tempData)
    }

    return (
        <div className="CSV">
            <CSVLink filename={`${props.source.split('/').pop()}.csv`} className="CSVDownload btn2" data={downloadData} disable={available}>Download</CSVLink>
        </div>
    )
}