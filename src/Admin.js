import React from 'react';
import Upload from './Upload';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Axios from 'axios';
import copy from './copy.png';

class Admin extends React.Component {

    constructor(props) {
        super(props)
        this.url = "http://18.136.217.164:3001"
        this.updateInterval = ''
        this.state = {
            generatedCodes: [],
            added: {check: 0, route: ''},
            tracking: []
        }
    }

    handleGenerate = () => {
        let genBox = document.getElementById('generate')
        let number = genBox.value;
        let req = {
            code: this.props.code,
            number: parseInt(number)
        }
        Axios.post(this.url + '/generate', req)
        .then(res => {
            this.setState({generatedCodes: res.data.inserted_codes})
        })
        .catch(e => {
            console.log(e)
        })
    }

    handleAddRoute = () => {
        let routeBox = document.getElementById('route');
        let route = routeBox.value
        let req = {
            route: route
        }
        Axios.post(this.url + '/routes/insert', req)
        .then(res => {
            this.setState({
                added: {
                    check: 1,
                    route: route
                }
            })
        })
        .catch(e => {console.log(e)})
    }

    handleNuke = () => {
        Axios.get(this.url + '/nuke')
        .then(res => {
            window.location.reload()
        })
        .catch(e => {console.log(e)})
    }

    copyTable = () => {
        const elTable = document.querySelector('#table');
        
        let range = ''
        let selection = ''
        
        if (document.createRange && window.getSelection) {
        
          range = document.createRange();
          selection = window.getSelection();
          selection.removeAllRanges();
        
          try {
            range.selectNodeContents(elTable);
            selection.addRange(range);
          } catch (e) {
            range.selectNode(elTable);
            selection.addRange(range);
          }
        
          document.execCommand('copy');
        }
        selection.removeAllRanges();
    }

    handleTab = (index) => {
        if (index == 2) {
            console.log('reached upload tracking')
            Axios.get(this.url + '/process/tracking').then(res => {
                this.setState({
                    tracking: res.data
                })
            })
            this.updateInterval = setInterval(() => {
                Axios.get(this.url + '/process/tracking').then(res => {
                    this.setState({
                        tracking: res.data
                    })
                    console.log('tracking update')
                })
            }, 3000)
        } else {
            clearInterval(this.updateInterval)
        }
        
    }

    render() {
        let trackingContent = []
        let codeHtml = []
        let tr = []
        for (let i = 0; i < this.state.generatedCodes.length; i++) {
            if ((i != 0) && (i % 5 == 0)) {
                codeHtml.push(<div className='tr'>{tr}</div>)
                tr = []
            }
            tr.push(
                <div key={"code-" + i} className="wrap-text td code"><span className='custom-underline'>{this.state.generatedCodes[i]}</span></div>
            )
        }
        codeHtml.push(<div className='tr'>{tr}</div>)

        for (let i = 0; i < this.state.tracking.length; i++) {
            let currTrack = this.state.tracking[i]
            trackingContent.push(
                <tr>
                    <td>{currTrack.id}</td>
                    <td>{currTrack.filename}</td>
                    <td>{currTrack.route}</td>
                    <td>{currTrack.status}</td>
                </tr>
            )
        }

        return (
            <div className='hundred'>
                <div className='admin-panels'>
                    <Tabs onSelect={this.handleTab} >
                        <TabList>
                            <Tab>Generate Codes</Tab>
                            <Tab>Upload</Tab>
                            <Tab>Upload Tracking</Tab>
                            <Tab>Insert Routes</Tab>
                            <Tab>Nuke</Tab>
                        </TabList>
                        <TabPanel>
                            <div className='generate-code'>
                                <input className='generate-box' type='number' id='generate'/>
                                <button className='btn2' onClick={this.handleGenerate}>Generate</button>
                                <div id='table'>
                                    {codeHtml}
                                </div>
                                {this.state.generatedCodes.length ?
                                    <button type="submit" className="copy-button" onClick={this.copyTable}>
                                        <img src={copy} alt="Submit" className="copy-img" />
                                    </button>
                                    :
                                    ''
                                }
                            </div>
                        </TabPanel>
                        <TabPanel>
                            <Upload />
                        </TabPanel>
                        <TabPanel>
                            <table width='100%'>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Filename</th>
                                        <th>Route</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trackingContent}
                                </tbody>
                            </table>
                        </TabPanel>
                        <TabPanel>
                            <input className='route-box' type='text' id='route' />
                            <button className='btn2' onClick={this.handleAddRoute}>Add</button>
                            {this.state.added.check ? <div>Route '{this.state.added.route}' added!</div> : ''}
                        </TabPanel>
                        <TabPanel>
                            <button className='btn2' onClick={this.handleNuke}>Nuke</button>
                        </TabPanel>
                    </Tabs>
                </div>
            </div>
        )
    }
}


export default Admin