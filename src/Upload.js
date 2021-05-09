import React, { forwardRef, useEffect, useRef, useState, useCallback, useImperativeHandle } from 'react';
import Select from 'react-select';
import {useDropzone} from 'react-dropzone';
import axios from 'axios';

import noRoute from './assets/no-route.png';
import ready from './assets/ready.png';
import uploaded from './assets/uploaded.png';
import processed from './assets/processed.png';
import failed from './assets/process-failed.png';

function Dropzone(props) {
    /* const [files, setFiles] = useState(props.files)
    useEffect(() => {
        console.log(files)
        props.passFiles(files)
    }, [files]) */
    const instance_url = props.instanceUrl
    const instance = props.instance

    const onDrop = useCallback(acceptedFiles => {
        let tempPropFiles = props.files
        if (!instance) {
            axios.get(instance_url + '/instance/start').then(() => {
                props.passInstance(true)
            }).catch(e => {console.log(e)})
        }
        props.passFiles(tempPropFiles.concat(acceptedFiles))

        /* setFiles((curr) => {
            return [...curr].concat(acceptedFiles)
        }) */
    })
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    return (
        <div className="Dropzone" {...getRootProps()}>
            <input {...getInputProps()} />
            {isDragActive ?
                <p>Drop the files here ...</p> :
                <p>Drag and drop files here, or click to select files.</p>
            }
        </div>
    )

}

const SingleFileUpload = forwardRef((props, ref) => {

    const url = "http://13.251.37.189:3001"
    const instance_url = "http://18.136.217.164:3001"

    const [progress, setProgress] = useState(0)
    const [file, setFile] = useState(props.file)
    const [route, setRoute] = useState('')
    const [routes, setRoutes] = useState([])
    const [checked, setChecked] = useState(props.checked)
    const [status, setStatus] = useState(props.status)

    const selectRef = React.createRef()

    useEffect(() => {
        if (status == 'uploading') {
            upload()
        }
    }, [status])

    useEffect(() => {
        if (status == 'noRoute') {
            if (route != '') {
                setStatus('ready')
            }
        }
        if (route == '') {
            setStatus('noRoute')
        }
    }, [route])

    useImperativeHandle(ref, () => ({
        check: (bool) => {
            setChecked(bool)
        },
        upload: () => {
            setStatus("uploading")
        },
        process: () => {
            setStatus("processing")
        },
        processed: () => {
            setStatus("processed")
        },
        failed: () => {
            setStatus("failed")
        },
        changeRoute: (e) => {
            console.log(selectRef.current.state.value)
            if (e.value == 'nothing') {
                console.log('should remove selection')
                selectRef.current.state.value = null
                setRoute('')
                return
            }
            handleSelectChange(e)
            selectRef.current.state.value = e
        },
        name: file.name,
        route: route,
        status: status,
        checked: checked
    }))

    const upload = async () => {
        
        let bytes
        axios.get(url + `/v2/process/check/${file.name}`).then(res => {
            bytes = res.data.bytes
            console.log(file.name, bytes, file.size)
            if (bytes == 0 || bytes == file.size) {
                console.log('initialized tracking')
                let req = {
                    stage: 'initial',
                    status: 'Uploading',
                    route: route,
                    fileName: file.name
                }
                axios.post(instance_url + '/process/tracking', req).then(res => {
                    console.log(res.data)
                }).catch(e => {
                    console.log(e)
                })
            }
            let formData = new FormData()
            let slice = file.slice(bytes, file.size);
            let uploadFile = new File([slice], file.name, {lastModified: file.lastModified})
            formData.append('file', uploadFile)
            let headers = {
                "Content-Type": "multipart/form-data",
                "x-file-name": file.name,
                "x-file-size": file.size,
                "x-start-byte": bytes
            }

            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "x-file-name": file.name,
                    "x-file-size": file.size,
                    "x-start-byte": bytes
                },
                timeout: 200000,
                onUploadProgress: (ProgressEvent) => {
                    let tempProgress = Math.round((bytes + ProgressEvent.loaded) / (bytes + ProgressEvent.total) * 100)
                    setProgress(tempProgress)
                }
            }
            axios.post(url + '/v2/process', formData, config).then(res => {
                if (res.data == "ok" || res.data == "File already uploaded") {
                    setStatus("uploaded")
                }
            }).catch(async (e) => {
                console.log(e)
                await upload()
                return
            })
        }).catch(async (e) => {
            console.log(e)
            return
        })
    }

    const getStatusDisplay = () => {
        if (status == 'noRoute') {
            return (
                <div className="ReadyStatusDisplay">
                    <img src={noRoute} className="StatusImages" />
                    <p className="ReadyLabel">No route selected!</p>
                </div>
            )
        }
        if (status == 'ready') {
            return (
                <div className="ReadyStatusDisplay">
                    <img src={ready} className="StatusImages" />
                    <p className="ReadyLabel">Ready</p>
                </div>
            )
        }
        if (status =='uploading') {
            return (
                <div className="UploadingStatusDisplay">
                    <div className="Loader" />
                    <p className="UploadLabel">Uploading... {`${progress}%`}</p>
                </div>
            )
        }
        if (status =='uploaded') {
            return (
                <div className="ReadyStatusDisplay">
                    <a href={`${url}/watch/${file.name}`} target="_blank" type="video/mp4"><img src={uploaded} className="StatusImages" /></a>
                    <p className="ReadyLabel">Uploaded</p>
                </div>
            )
        }
        if (status == 'processing') {
            return (
                <div className="UploadingStatusDisplay">
                    <div className="Loader" />
                    <p className="UploadLabel">Processing</p>
                </div>
            )
        }
        if (status == 'processed') {
            return (
                <div className="ReadyStatusDisplay">
                    <img src={processed} className="StatusImages" />
                    <p className="ReadyLabel">Processed!</p>
                </div>
            )
        }
        if (status == 'failed') {
            return (
                <div className="ReadyStatusDisplay">
                    <img src={failed} className="StatusImages" />
                    <p className="ReadyLabel">Failed! :(</p>
                </div>
            )
        }
    }

    const handleSelect = (e) => {
        axios.get(instance_url + '/routes').then((res) => {
            setRoutes(res.data)
        })
    }

    const handleSelectChange = (e) => {
        setRoute(e.label)
        console.log(e.label)
    }

    return(
        <div ref={props.ref} className="SingleFileUpload">
            <div className="SingleUploadLabel">
                <input type="checkbox" id={`checkbox-${file.name}`} checked={checked} onChange={() => {setChecked((curr) => {return !curr})}} />
                <label htmlFor={`checkbox-${file.name}`}>
                    {file.name}
                </label>
                <Select key={`select-route-${file.name}`} placeholder="Select route" ref={selectRef} options={routes} className="select-single3" isSearchable={false} onMenuOpen={handleSelect} onChange={handleSelectChange} />
            </div>
            <div className="StatusDisplay">
                {getStatusDisplay()}
            </div>
        </div>
    )
})

export default function Upload() {
    const url = "http://13.251.37.189:3001"
    const instance_url = "http://18.136.217.164:3001"

    const [files, setFiles] = useState([])
    const [route, setRoute] = useState('')
    const [routes, setRoutes] = useState([])
    const [statusControl, setStatusControl] = useState('ready')
    const [Uploads, setUploads] = useState([])
    const [all, setAll] = useState(false)
    const [instance, setInstance] = useState(false)

    useEffect(() => {
        axios.get(instance_url + "/instance/check").then(res => {
            let instanceStatus = res.data.State.Name
            if (instanceStatus == "running") {
                setInstance(true)
            } else {
                setInstance(false)
            }
        })
    }, [])

    useEffect(() => {
        axios.get(instance_url + "/instance/check").then(res => {
            let instanceStatus = res.data.State.Name
            if (instanceStatus == "running") {
                setInstance(true)
            } else {
                setInstance(false)
            }
        })
    }, [instance])

    useEffect(() => {
        for (let i = 0; i < Uploads.length; i++) {
            Uploads[i].jsx.ref.current.check(all)
        }
    }, [all])

    useEffect(() => {
        setUploads((curr) => {
            console.log(files)
            return files.map((file) => {
                return {
                    jsx: <SingleFileUpload key={file.name} ref={React.createRef()} file={file} route={route} status='noRoute' checked={all} />
                }
            })
            /* let FileUploads = []
            for (let i = 0; i < files.length; i++) {
                FileUploads.push(
                    {
                        file: files[i],
                        jsx: <SingleFileUpload ref={React.createRef()} file={files[i]} route={route} status={statusControl} checked={all} />
                    }
                )
            }
            console.log(FileUploads)
            return FileUploads */
        })
    }, [files])

    useEffect(() => {
        console.log(Uploads)
    }, [Uploads])

    const handleSelectAll = (e) => {
        console.log('all selected')
        setAll((curr) => {
            return !curr
        })
    }

    const handleUpload = () => {
        for (let i = 0; i < Uploads.length; i++) {
            if (!Uploads[i].jsx.ref.current.checked) {
                continue
            }
            Uploads[i].jsx.ref.current.upload()
        }
    }

    const handleDelete = () => {
        let req = Uploads.filter((upload) => {
            let uploadState = upload.jsx.ref.current
            return (uploadState.checked)
        }).map((upload) => {
            return {filename: upload.jsx.ref.current.name}
        })
        axios.post(url + "/v2/process/delete", req).then(res => {
            console.log(res)
        }).catch(e => {
            console.log(e)
        })
        setFiles((curr) => {
            return curr.filter((element) => {
                let index = Uploads.findIndex((i) => {
                    return i.jsx.ref.current.name == element.name
                })
                return !Uploads[index].jsx.ref.current.checked
            })
        })
    }

    const handleProcess = () => {
        let req = Uploads.filter((upload) => {
            let uploadState = upload.jsx.ref.current
            return ((uploadState.checked) && (uploadState.status == 'uploaded') && (uploadState.process() || 1))
        }).map((upload) => {
            return {filename: upload.jsx.ref.current.name, route: upload.jsx.ref.current.route}
        })
        if (req.length) {
            axios.post(url + "/v2/process/process", req).then(res => {
                let result = res.data
                for (let upload of Uploads) {
                    let uploadState = upload.jsx.ref.current;
                    if ((uploadState.status == 'processing') && (uploadState.checked)) {
                        if (result[uploadState.name] != 'ok') {
                            uploadState.failed()
                        } else {
                            uploadState.processed()
                        }
                    }
                }
            }).catch(e => {
                console.log(e)
            })
        }
    }

    const handleFinish = () => {
        axios.get(instance_url +"/instance/stop").then(() => {
            setInstance(false)
            setFiles([])
        }).catch((e) => {
            console.log(e)
        })
    }

    const getFiles = (files) => {
        setFiles(files)
    }

    const handleSelect = (e) => {
        axios.get(instance_url + '/routes').then((res) => {
            setRoutes([{value: 'nothing', label: 'Select individually'}].concat(res.data))
        })
    }

    const handleSelectChange = (e) => {
        for (let upload of Uploads) {
            let uploadState = upload.jsx.ref.current
            if (uploadState.checked) {
                uploadState.changeRoute(e)
            }
        }
    }

    return(
        <div className="Upload2">
            <div className="FileInput">
                <Dropzone files={files} instanceUrl={instance_url} instance={instance} passFiles={getFiles} passInstance={(bool) => {setInstance(bool)}} />
            </div>
            <div className="UploadInterface">
                <div className="UploadControl">
                    <span className="btn3" onClick={(e) => handleSelectAll(e)} >
                        <input type="checkbox" id="all" checked={all} />
                        <label style={{cursor: 'pointer'}}>Select All</label>
                    </span>
                    <button className="btn3" onClick={handleUpload} disabled={!instance}>Upload</button>
                    <button className="btn3" onClick={handleProcess} disabled={!instance}>Process</button>
                    <button className="btn3" onClick={handleFinish} disabled={!instance}>Finish</button>
                    <button className="btn3" onClick={handleDelete} disabled={!instance}>Delete</button>
                    <Select placeholder="Select for checked" key={`select-all`} options={routes} className="RouteSelect2" isSearchable={false} onMenuOpen={handleSelect} onChange={handleSelectChange} />
                </div>
                <div className="UploadDisplay">
                    {Uploads.map((upload) => {return upload.jsx})}
                </div>
            </div>
        </div>
    )
}