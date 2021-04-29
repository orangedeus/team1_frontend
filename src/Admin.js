import React, { useState } from 'react';

import Upload from './Upload';
import FormField from './FormField';

import dashboard from './assets/dashboard.svg';
import up from './assets/uploadprocess.svg';
import generate from './assets/create.svg';

export default function Admin() {

    const [active, setActive] = useState("Dashboard")

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
    }

    const renderActive = () => {
        if (active == "Dashboard") {
            return(
                <div className="Dashboard">
                    Dashboard
                </div>
            )
        }
        if (active == "Generate Codes") {
            return(
                <form className="Form">
                    <FormField ref={generateRef} className="FormField" fieldName="generated" labelName="Number of codes to be generated" type="text" />
                    <button className="btn2" onClick={handleGenerate}>GENERATE</button>
                </form>
            )
        }
        if (active == "Upload & Process") {
            return <Upload />
        }
    }

    return (
        <div className="Admin">
            <div className="AdminSidebar">
                {SidebarButton("Dashboard", dashboard)}
                {SidebarButton("Generate Codes", generate)}
                {SidebarButton("Upload & Process", up)}
            </div>
            <div className="AdminContent">
                {renderActive()}
            </div>
        </div>
    )
}