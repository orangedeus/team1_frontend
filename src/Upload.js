import React, { useRef, useState } from 'react';
import App from './App';
import './App.css';
import axios from 'axios';
import Select from 'react-select';
import { isCompositeComponent } from 'react-dom/test-utils';


function Upload() {
    const url = "http://13.251.37.189:3001"
    const [files, setFiles] = useState('')
    const [progress, setProgress] = useState(0)
    const [routes, setRoutes] = useState([])
    const el = useRef()
    const selEl = useRef()

    const handleChange = (e) => {
        setProgress(0)
        console.log(e.target.files)
        const files = e.target.files
        setFiles(files)
    }

    const uploadFile = () => {
        const route = selEl.current.state.value.label
        const formData = new FormData()
        const upload_url = url + "/process"
        console.log(files)
        for (const key of Object.keys(files)) {
            formData.append('upload', files[key])
        }
        console.log(formData)
        formData.append('route', route)
        axios.post(upload_url, formData, {
            onUploadProgress(ProgressEvent) {
                let progress = Math.round(ProgressEvent.loaded / ProgressEvent.total * 100) + '%'
                setProgress(progress)
            }
        }).then(res => {
            console.log(res)
        }).catch(err => {
            console.log(err)
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
        axios.get(url + '/routes').then((res) => {
            setRoutes(res.data)
        })
    }

    return(
        <div className="upload">
            <Select ref={selEl} options={routes} className="select-single2" onMenuOpen={handleSelect} />
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