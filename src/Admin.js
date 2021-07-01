import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Fade, { Slide } from 'react-reveal';
import axios from 'axios';
import { useFilters, useTable } from 'react-table';
import { Line } from 'react-chartjs-2';

import Upload from './Upload';
import Checkpoint from './Checkpoint';
import FormField from './FormField';
import ErrorModal from './ErrorModal';
import CSV from './CSV';

import dashboard from './assets/dashboard.svg';
import up from './assets/uploadprocess.svg';
import generate from './assets/create.svg';
import volunteer from './assets/volunteer.svg';
import control from './assets/settings.svg';
import stops from './assets/stops.svg';
import anno from './assets/annotations.svg';
import vid from './assets/uploaded.svg';
import codes from './assets/code.svg';
import refresh from './assets/reload.svg';
import nuke from './assets/nuke.svg';
import download from './assets/download.svg';

import { forwardRef, useImperativeHandle } from 'react';

const Table = forwardRef((props, ref) => {

    const columns = props.columns
    const data = props.data

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow
    } = useTable({ columns, data })

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
                                    <td {...cell.getCellProps()}
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
    const [confirm, setConfirm] = useState(false)
    const [tracking, setTracking] = useState([])
    const [CSVSource, setCSVSource] = useState('')
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

    const defaultTD = {
        labels: [],
        datasets: []
    }

    const inputRef = React.createRef()
    const backupRef = React.createRef()

    const handleBackup = () => {
        if (!backupRef) {
            return
        }
        if (!backupRef.current.valid) {
            return
        }
        let backupName = backupRef.current.input
        if (backupName == '' || backupName == null) {
            return
        }
        axios.post(url + '/backups/backup', {backup: backupName}).then(res => {
            console.log(res)
            window.location.reload()
        }).catch(e => {
            console.log(e)
        })
    }

    const chartRef = useRef()

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
            },
            {
                Header: 'Average Duration Taken',
                accessor: 'duration'
            }
        ],
        []
    )

    const columns3 = React.useMemo(
        () => [
            {
                Header: 'ID',
                accessor: 'id'
            },
            {
                Header: 'Filename',
                accessor: 'filename'
            },
            {
                Header: 'Route',
                accessor: 'route'
            },
            {
                Header: 'Status',
                accessor: 'status'
            }
        ],
        []
    )

    const handleClick = (e) => {
        if (e.target.className != "clickableCell") {
            if (inputRef.current != null) {
                if (inputRef.current.value == '') {
                    setCF("")
                }
            } else {
                setCF("")
            }
        }
    }

    useEffect(() => {
        console.log(active)
        if (active != 'Upload & Process') {
            setConfirm(false)
        }
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
        if (active == 'Upload & Process') {
            getTracking()
        }
    }, [active])

    useEffect(() => {
        axios.get(url + '/instrumentation/codes').then(res => {
            setCI(res.data)
        }).catch((e) => {
            console.log(e)
        })
    }, [generatedCodes])

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

    const getTracking = () => {
        axios.get(url + '/process/tracking').then(res => {
            setTracking(res.data)
        }).then(e => {
            console.log(e)
        })
    }

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

    const insertRef = React.createRef()

    const handleInsertRoute = () => {
        console.log('inserting')
        if (!insertRef) {
            return
        }
        if (!insertRef.current.valid) {
            return
        }
        console.log(insertRef.current.input)
        let req = {
            route: insertRef.current.input
        }
        axios.post(url + '/routes/insert', req).then(res => {
            console.log(res.data)
            if (res.data == 'Success!') {
                console.log('setting confirm')
                setConfirm(true)
            }
        }).catch(e => {console.log(e)})
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
                        <p className="SectionLabel">Video processing stats</p>
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
                            <FormField ref={generateRef} validateField={validateGenerateField} className="GenerateField" fieldName="generated" labelName="Number of codes to be generated" type="text" />
                            <button className="btn3" type="button" onClick={handleGenerate}>Generate</button>
                        </form>
                    </div>,
                    <div key="generate-codes1" className="ContentSection" style={{'width': '20%', 'maxHeight': '50%'}}>
                        <p className="SectionLabel" >Codes generated</p>
                        <div className="SectionContent">
                            <Table name="c" columns={columns} data={generatedCodes.length ? generatedCodes.map((code) => {return {code: code}}) : [{code: <span style={{color: 'gray'}}>Nothing to display.</span>}]} />
                        </div>
                    </div>,
                    <div key="generate-codes2" className="ContentSection" style={{'width': '70%', 'minHeight': '30%', 'maxHeight': '90%'}}>
                        <p className="SectionLabel" >Volunteer code monitoring</p>
                        <div className="SectionContent">
                            <Table name="vc" columns={columns1} data={codesInst.map((record) => {
                                return (
                                    {
                                        code: record.code,
                                        accessed: record.accessed ? record.accessed : '-',
                                        surveyed: record.surveyed ? 'Yes' : 'No'
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
                    <div key="insert-route" className="ContentSection" style={{'width': '30%'}}>
                        <p className="SectionLabel" >Insert routes</p>
                        <form autoComplete="off" className="GenerateForm">
                            <FormField ref={insertRef} validateField={validateRouteField} className="GenerateField" fieldName="route" labelName="Insert route name" type="text" />
                            <div className="flex-row">
                                <button className="btn3" type="button" onClick={handleInsertRoute}>Add</button>
                                {confirm && <span>&#10004;</span>}
                            </div>
                        </form>
                    </div>,
                    <div key="upload-process" className="ContentSection" style={{'width': '100%', 'zIndex': 10}}>
                        <p className="SectionLabel" >Upload and process files</p>
                        <Upload />
                    </div>,
                    <div key="upload-tracking" className="ContentSection" style={{'width': '100%'}}>
                        <p className="SectionLabel flex-row" >Upload tracking<img src={refresh} alt="refresh" className="SidebarButtonIcon" style={{cursor: 'pointer'}} onClick={getTracking} /></p>
                        <Table name="t" columns={columns3} data={tracking} />
                    </div>
                ]
            )
        }
        if (active == "System Control") {
            return (
                [
                    <div key="backup" className="ContentSection" style={{'width': '25%'}}>
                        <p className="SectionLabel" >Backup</p>
                        <form autoComplete="off" className="GenerateForm">
                            <FormField ref={backupRef} validateField={validateRouteField} className="GenerateField" fieldName="backup" labelName="Backup name" type="text" />
                            <button className="btn3" type="button" onClick={handleBackup}>Backup</button>
                        </form>
                    </div>,
                    <div key="backup-control" className="ContentSection" style={{'width': '65%', 'zIndex': 10}}>
                        <p className="SectionLabel">Backup Control</p>
                        <Checkpoint />
                    </div>,
                    <div key="nukes" className="ContentSection" style={{'width': '100%', justifyContent: 'center'}}>
                        <p className="SectionLabel">Nukes</p>
                        <div className="flex-row spadding" style={{width: '30%', justifyContent: 'space-around'}}>
                            <div className="NukeButton" style={{cursor: 'pointer', width: '2rem', height: '2rem'}} onClick={() => {ReactDOM.render(<ErrorModal msg="This will empty annotations." confirmCallback={handleLesserNuke} />, document.getElementById('modal'))}}>
                                <img src={nuke} className="NukeImg" alt="nuke" />
                            </div>
                            <div className="NukeButton" style={{cursor: 'pointer', width: '3rem', height: '3rem'}} onClick={() => {ReactDOM.render(<ErrorModal msg="This will empty stops, annotations and routes." confirmCallback={handleRegularNuke} />, document.getElementById('modal'))}}>
                                <img src={nuke} className="NukeImg" alt="nuke" />
                            </div>
                            <div className="NukeButton" style={{cursor: 'pointer', width: '4rem', height: '4rem'}}>
                                <img src={nuke} className="NukeImg" alt="nuke" />
                            </div>
                        </div>
                    </div>
                ]
            )
        }
        if (active == "View & Download Data") {
            return (
                [
                    <div key="csv" className="ContentSection2" style={{width: '100%', 'maxWidth': '1200px', height: '100%', 'overflowX': 'scroll'}}>
                        <p className="SectionLabel" >CSV Data</p>
                        <div className="CSVControl">
                            <button className="btn3" onClick={handleCSV}>Survey</button>
                            <button className="btn3" onClick={handleCSV}>Annotations</button>
                            <button className="btn3" onClick={handleCSV}>Videos</button>
                            <button className="btn3" onClick={handleCSV}>Stops</button>
                            <button className="btn3" onClick={handleCSV}>Deviation</button>
                            <button className="btn3" onClick={handleCSV}>Distribution</button>
                            <button className="btn3" onClick={handleCSV}>Total</button>
                            <button className="btn3" onClick={handleCSV}>FalsePositives</button>
                        </div>
                        {CSVSource == '' ? null : <CSV source={`http://18.136.217.164:3001/data/${CSVSource}`} />}
                    </div>
                ]
            )
        }
    }

    const handleLesserNuke = () => {
        axios.get(url + '/nuke/annotations').then(() => {
            window.location.reload()
        }).catch(e => {
            console.log(e)
        })
    }

    const handleRegularNuke = () => {
        axios.get(url + '/nuke').then(() => {
            window.location.reload()
        }).catch(e => {
            console.log(e)
        })
    }

    const handleCSV = (e) => {
        let clicked = e.target.innerHTML.toLowerCase()
        if (clicked == CSVSource) {
            setCSVSource('')
        } else {
            setCSVSource(clicked)
        }
    }

    const isPositiveInteger = (str) => {
        return /^(0|[1-9]\d*)$/.test(str)
    }

    const validateGenerateField = (input) => {
        let tempValid = true
        let tempEM = ''
        console.log(input)
        if (!isPositiveInteger(input)) {
            tempValid = false
            tempEM = ERRORMSGS[0]
        }
        if (parseInt(input) < 0) {
            tempValid = false
            tempEM = ERRORMSGS[1]
        }
        if (input == '') {
            tempValid = false
            tempEM = ERRORMSGS[0]
        }
        return [tempValid, tempEM]
    }

    const validateRouteField = () => {
        return [true, '']
    }

    const ERRORMSGS = [
        'Please input a number',
        'Negative numbers are not accepted'
    ]

    return (
        <div id="admin" className="Admin">
            <div id="modal"/>
            <Slide left duration={500}>
                <div className="AdminSidebar">
                    {SidebarButton("Dashboard", dashboard)}
                    {SidebarButton("Volunteer Management", volunteer)}
                    {SidebarButton("Upload & Process", up)}
                    {SidebarButton("View & Download Data", download)}
                    {SidebarButton("System Control", control)}
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