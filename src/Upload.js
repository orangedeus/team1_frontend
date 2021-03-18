import React, { useRef, useState } from 'react';
import App from './App';
import './App.css';
import axios from 'axios';
import { isCompositeComponent } from 'react-dom/test-utils';


function Upload() {
    const [files, setFiles] = useState('')
    const [progress, setProgress] = useState(0)
    const el = useRef()

    const handleChange = (e) => {
        setProgress(0)
        console.log(e.target.files)
        const files = e.target.files
        setFiles(files)
    }

    const uploadFile = () => {
        const formData = new FormData()
        const url = "http://13.251.37.189:3001/process"
        console.log(files)
        for (const key of Object.keys(files)) {
            formData.append('upload', files[key])
        }
        console.log(formData)
        axios.post(url, formData, {
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

    return(
        <div className="upload">
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