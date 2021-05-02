import React, { useRef, useState } from 'react';
import Select from 'react-select';
import Axios from 'axios';
import { saveAs } from 'file-saver';


function Checkpoint() {
    const url = "http://18.136.217.164:3001"

    const [backup, setBackup] = useState('')
    const [backups, setBackups] = useState([])

    const handleRestore = () => {
        Axios.post(url + '/backups/restore', {backup: backup}).then(res => {
            console.log(res)
            window.location.reload()
        }).catch(e => {
            console.log(e)
        })
    }

    const handleBackupSelect = () => {
        Axios.get(url + '/backups').then(res => {
            let data = res.data
            let tempBackups = []
            for (let i = 0; i < data.length; i++) {
                tempBackups.push({value: data[i].id, label: data[i].backup})
            }
            console.log(tempBackups)
            setBackups(tempBackups)
        })
    }

    const handleSelectChange = (e) => {
        setBackup(e.label)
    }

    const handleDownload = () => {
        Axios.post(url + '/backups/download', {backup: backup}, {headers: {'Accept': 'application/zip'}, responseType: 'arraybuffer'}).then(res => {
            console.log(res)
            let blob = new Blob([res.data], {type: 'application/zip'})
            saveAs(blob, 'download.zip')
        }).catch(e => {
            console.log(e)
        })
    }

    const handleDelete = () => {
        Axios.post(url + '/backups/delete', {backup: backup}).then(res => {
            console.log(res)
            window.location.reload()
        }).catch(e => {
            console.log(e)
        })
    }

    return (
        <div className="checkpoint spadding">
            <Select options={backups.length ? backups : []} className="select-single3" isSearchable={true} onMenuOpen={handleBackupSelect} onChange={handleSelectChange} />
            <div className="spadding flex-row">
                <button className='btn3' onClick={handleRestore}>Restore</button>
                <button className='btn3' onClick={handleDownload}>Download</button>
                <button className='btn3' onClick={handleDelete}>Delete</button>
            </div>
        </div>
    )

}

export default Checkpoint;