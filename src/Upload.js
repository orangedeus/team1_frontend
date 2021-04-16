import React, { useRef, useState } from 'react';
import App from './App';
import './App.css';
import axios from 'axios';
import Select from 'react-select';
import { isCompositeComponent } from 'react-dom/test-utils';


function Upload() {
    const instance_url = "http://18.136.217.164:3001"
    const upload_url = "http://13.251.37.189:3001"
    const [files, setFiles] = useState('')
    const [progress, setProgress] = useState(0)
    const [routes, setRoutes] = useState([])
    const el = useRef()
    const selEl = useRef()

    const handleChange = (e) => {
        setProgress(0)
        const files = e.target.files
        setFiles(files)
    }

    const uploadFile = () => {
        axios.get(instance_url + '/instance/start')
        .then(res => {
            console.log(res)
            console.log('Instance started! Uploading... ')
            setTimeout(() => {
                const route = selEl.current.state.value.label
                const formData = new FormData()
                const request_upload_url = upload_url + "/process"
                for (const key of Object.keys(files)) {
                    formData.append('upload', files[key])
                    let req = {
                        stage: 'initial',
                        status: 'Uploading',
                        route: route,
                        fileName: files[key].name
                    }
                    axios.post(instance_url + '/process/tracking', req).then(res => {
                        console.log(res.data)
                    }).catch(e => {
                        console.log(e)
                    })
                }

                console.log(formData)
                formData.append('route', route)
                axios.post(request_upload_url, formData, {
                    onUploadProgress(ProgressEvent) {
                        let progress = Math.round(ProgressEvent.loaded / ProgressEvent.total * 100) + '%'
                        setProgress(progress)
                    }
                }).then(res => {
                    console.log(res)
                }).catch(err => {
                    console.log(err)
                })
            }, 15000);
        })
        .catch(e => {
            console.log(e)
        })
    }

    const getDisplay = () => {
        if (progress == 0) {
            return 'none'
        } else {
            return 'block'
        }
    }

    const handleSelect = () => {
        axios.get(instance_url + '/routes').then((res) => {
            setRoutes(res.data)
        })
    }

    console.log(routes)
    return(
        <div className="upload">
            <Select ref={selEl} options={routes.length ? routes : []} className="select-single2" isSearchable={false} onMenuOpen={handleSelect} />
            <input
                type="file"
                ref={el}
                multiple
                onChange={handleChange}
            />
            <div>
                {progress ? '' : <button className="btn2" onClick={uploadFile}>
                    Upload
                </button>}
            </div>
            <div className='progressBar' style={progress ? {width: progress} : {display: 'none'}}>
                {progress}
            </div>
            {progress == '100%' ? <div>File(s) received for processing.</div> : ''}
        </div>
    )
}

export default Upload;