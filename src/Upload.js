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
        const url = "http://localhost:3001/process"
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
        <div className="hundred">
            <div className="upload">
                <input
                    type="file"
                    ref={el}
                    multiple
                    onChange={handleChange}
                    className="upload-margin"
                />
                <div className="upload-margin">
                    {progress ? '' : <button className="btn2" onClick={uploadFile}>
                        Upload
                    </button>}
                </div>
                <div className='progressBar upload-margin' style={progress ? {width: progress} : {display: 'none'}}>
                    {progress}
                </div>
                {progress == '100%' ? <div className="upload-margin">File(s) received for processing.</div> : ''}
            </div>
        </div>
    )
}

export default Upload;