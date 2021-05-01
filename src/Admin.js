import React, { useRef, useEffect, useState } from 'react';
import Fade, { Slide } from 'react-reveal';
import axios from 'axios';
import { useFilters, useTable } from 'react-table';
import { Line } from 'react-chartjs-2';

import Upload from './Upload';
import FormField from './FormField';

import dashboard from './assets/dashboard.svg';
import up from './assets/uploadprocess.svg';
import generate from './assets/create.svg';
import volunteer from './assets/volunteer.svg';
import stops from './assets/stops.svg';
import anno from './assets/annotations.svg';
import vid from './assets/uploaded.svg';
import codes from './assets/code.svg';

import { forwardRef, useImperativeHandle } from 'react';

const Table = forwardRef((props, ref) => {

    const columns = props.columns
    const data = props.data

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        setFilter
    } = useTable({ columns, data }, useFilters)

    useEffect(() => {
        if (props.filter) {
            setFilter("code", props.filter)
        }
    }, [props.filter])

    return (
        <table {...getTableProps()} style={{
            width: '100%', 
            border: 'solid 0.5px black',
            borderRadius: '15px',
            padding: '0.25rem',
            fontFamily: 'IBM Plex Sans, sans-serif'
         }}>
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th
                                {...column.getHeaderProps()}
                                style={{
                                    fontFamily: 'Cabin, sans-serif',
                                    color: 'black',
                                    fontWeight: 'bold',
                                    padding: '0.1rem',
                                }}
                            >
                                {column.render('Header')}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map(row => {
                    prepareRow(row)
                    return (
                        <tr className="TRow" {...row.getRowProps()}>
                            {row.cells.map(cell => {
                                return (
                                    <td onClick={props.cellClick}
                                        {...cell.getCellProps()}
                                        className={props.name == "vc" && cell.column.id == "code" ? "clickableCell" : ""}
                                        style={{
                                            padding: '10px',
                                            border: 'none',
                                        }}
                                    >
                                        {cell.render('Cell')}
                                    </td>
                                )
                            })}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
})

export default function Admin(props) {

    const url = "http://18.136.217.164:3001"

    const [active, setActive] = useState("Dashboard")
    const [dashboardData, setDD] = useState({})
    const [generatedCodes, setGC] = useState([])
    const [inst, setI] = useState([])
    const [codesInst, setCI] = useState([])
    const [codeFilter, setCF] = useState("")
    const [chartData, setCD] = useState(
        {
            labels: [],
            backgroundColor: 'white',
            datasets: [
                {
                    label: '% reduced to',
                    data: [],
                    fill: false,
                    backgroundColor: 'rgb(255, 99, 132)',
                    borderColor: 'rgba(255, 99, 132, 0.2)'
                },
                {
                    label: '# of splices',
                    data: [],
                    fill: false,
                    backgroundColor: '#0F497D',
                    borderColor: '#E2ECF4'
                }
            ]
        }
    )

    const chartRef = useRef()

    const defaultData = {
        labels: [],
        datasets: [
            {
                label: '% reduced to',
                data: [],
                fill: false,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgba(255, 99, 132, 0.2)'
            },
            {
                label: '# of splices',
                data: [],
                fill: false,
                backgroundColor: '#0F497D',
                borderColor: '#E2ECF4'
            }
        ]
    }

    const columns = React.useMemo(
        () => [
            {
                Header: 'Code',
                accessor: 'code'
            }
        ],
        []
    )

    const options = {
        scales: {
            x: {
                ticks: {
                    display: false
                }
            }
        }
    }

    const columns1 = React.useMemo(
        () => [
            {
                Header: 'Code',
                accessor: 'code'
            },
            {
                Header: 'Accessed',
                accessor: 'accessed'
            },
            {
                Header: 'Surveyed',
                accessor: 'surveyed'
            }
        ],
        []
    )

    const columns2 = React.useMemo(
        () => [
            {
                Header: 'Code',
                accessor: 'code'
            },
            {
                Header: 'File',
                accessor: 'file'
            },
            {
                Header: 'Average Time Taken',
                accessor: 'time'
            }
        ],
        []
    )
    const handleClick = (e) => {
        if (e.target.className != "clickableCell") {
            setCF("")
        }
    }

    useEffect(() => {
        console.log(active)
        if (active == 'Dashboard') {
            axios.get(url + '/dashboard').then(res => {
                setDD(res.data)
            }).catch(e => {
                console.log(e)
            })
            axios.get(url + '/process/tracking/stats').then(res => {
                console.log('stats', res.data)
                setCD(() => {
                    let tempData = JSON.parse(JSON.stringify(defaultData))
                    for (const stat of res.data) {
                        tempData.labels.push(stat.filename)
                        tempData.datasets[0].data.push((stat.resulting / stat.duration) * 100)
                        tempData.datasets[1].data.push(stat.splices)
                    }
                    return tempData
                })
                console.log(chartRef)
            })
        }
        if (active == 'Volunteer Management') {
            axios.get(url + '/instrumentation/codes').then(res => {
                setCI(res.data)
            }).catch((e) => {
                console.log(e)
            })
            axios.get(url + '/instrumentation').then(res => {
                setI(res.data)
            }).catch((e) => {
                console.log(e)
            })
        }
    }, [active])

    const SidebarButton = (label, icon) => {
        return (
            <div className={active == label ? "SidebarButton sb-active" : "SidebarButton"} onClick={() => { setActive(label) }}>
                <img src={icon} className="SidebarButtonIcon" alt={`icon-${label}`} />
                <div className="SidebarButtonLabel">
                    {label}
                </div>
            </div>
        )
    }

    const generateRef = React.createRef()

    const handleGenerate = () => {
        console.log('generating')
        if (!generateRef) {
            return
        }
        if (!generateRef.current.valid) {
            return
        }
        let req = {
            code: props.code,
            number: generateRef.current.input
        }
        axios.post(url + '/generate', req)
        .then(res => {
            setGC(res.data.inserted_codes)
        })
        .catch(e => {
            console.log(e)
        })
    }

    const handleCellClick = (e) => {
        if (e.target.cellIndex == 0) {
            setCF(e.target.innerHTML)
        }
    }

    const filterInput = (e) => {
        setCF(e.target.value)
    }

    const renderActive = () => {
        if (active == "Dashboard") {
            return(
                [
                    <div key="dashboard-0" className="ContentSection" style={{
                        'width': '20%',
                        'flexDirection': 'row'
                    }}>
                        <img src={stops} alt="stops" className="DashboardImage" />
                        <div className="DashboardContent">
                            <div className="DashboardHeader">{dashboardData.stops}</div>
                            <p className="DashboardLabel">Stops</p>
                        </div>
                    </div>,
                    <div key="dashboard-1" className="ContentSection" style={{
                        'width': '20%',
                        'flexDirection': 'row'
                    }}>
                        <img src={anno} alt="annotations" className="DashboardImage" />
                        <div className="DashboardContent">
                            <div className="DashboardHeader">{dashboardData.annotations}</div>
                            <p className="DashboardLabel">Annotations</p>
                        </div>
                    </div>,
                    <div key="dashboard-2" className="ContentSection" style={{
                        'width': '20%',
                        'flexDirection': 'row'
                    }}>
                        <img src={vid} alt="vids" className="DashboardImage" />
                        <div className="DashboardContent">
                            <div className="DashboardHeader">{dashboardData.uploaded_videos}</div>
                            <p className="DashboardLabel">Videos</p>
                        </div>
                    </div>,
                    <div key="dashboard-3" className="ContentSection" style={{
                        'width': '20%',
                        'flexDirection': 'row'
                    }}>
                        <img src={codes} alt="codes" className="DashboardImage" />
                        <div className="DashboardContent">
                            <div className="DashboardHeader">{dashboardData.codes}</div>
                            <p className="DashboardLabel">Codes</p>
                        </div>
                    </div>
                    ,
                    <div key="dashboard-4" className="ContentSection" style={{
                        'width': '44%',
                        'flexDirection': 'column'
                    }}>
                        <p className="SectionLabel">Stats</p>
                        <Line ref={chartRef} data={chartData} options={options} />
                    </div>
                ]
            )
        }
        if (active == "Volunteer Management") {
            return(
                [
                    <div key="generate-codes" className="ContentSection" style={{'width': '20%'}}>
                        <p className="SectionLabel">Generate codes</p>
                        <form autoComplete="off" className="GenerateForm">
                            <FormField ref={generateRef} className="GenerateField" fieldName="generated" labelName="Number of codes to be generated" type="text" />
                            <button className="btn3" type="button" onClick={handleGenerate}>Generate</button>
                        </form>
                    </div>,
                    <div key="generate-codes1" className="ContentSection" style={{'width': '20%', 'maxHeight': '50%'}}>
                        <p className="SectionLabel" >Codes generated</p>
                        <div className="SectionContent">
                            <Table name="c" columns={columns} data={generatedCodes.length ? generatedCodes.map((code) => {return {code: code}}) : [{code: <span style={{color: 'gray'}}>Nothing to display.</span>}]} />
                        </div>
                    </div>,
                    <div key="generate-codes2" className="ContentSection" style={{'width': '70%', 'maxHeight': '40%'}}>
                        <p className="SectionLabel" >Volunteer code monitoring</p>
                        <div className="SectionContent">
                            <Table name="vc" cellClick={handleCellClick} columns={columns1} data={codesInst.map((record) => {
                                return (
                                    {
                                        code: record.code,
                                        accessed: record.accessed ? record.accessed : '-',
                                        surveyed: record.surveyed ? 'Yes' : 'No'
                                    }
                                )
                            })} />
                        </div>
                    </div>,
                    <div key="generate-codes3" className="ContentSection" style={{'width': '70%', 'maxHeight': '40%'}}>
                        <div className="SectionLabel" >
                            Volunteer progress monitoring
                            <input type="text" className="TableFilter" onChange={filterInput} />
                        </div>
                        <div className="SectionContent">
                            <Table filter={codeFilter} name="vp" columns={columns2} data={inst.map((record) => {
                                    return (
                                        {
                                            code: record.code,
                                            file: record.file,
                                            time: parseFloat(record.time).toFixed(3)
                                        }
                                    )
                                })} />
                        </div>
                    </div>
                ]
            )
        }
        if (active == "Upload & Process") {
            return (
                [
                    <div key="upload-process" className="ContentSection" style={{'width': '100%'}}>
                        <p className="SectionLabel" >Upload and process files</p>
                        <Upload />
                    </div>
                ]
            )
        }
    }

    return (
        <div className="Admin">
            <Slide left duration={500}>
                <div className="AdminSidebar">
                    {SidebarButton("Dashboard", dashboard)}
                    {SidebarButton("Volunteer Management", volunteer)}
                    {SidebarButton("Upload & Process", up)}
                </div>
            </Slide>
            <Fade duration={1000} cascade>
                <div onClick={handleClick} className="AdminContent" style={active == "Volunteer Management" ? {'flexDirection': 'column', 'height': 'calc(100vh - 150px)'} : {}}>
                    {renderActive()}
                </div>
            </Fade>
        </div>
    )
}