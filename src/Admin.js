import React from 'react';
import Upload from './Upload';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Axios from 'axios';
import Checkpoint from './Checkpoint';
import copy from './copy.png';

class Admin extends React.Component {

    constructor(props) {
        super(props)
        this.url = "http://18.136.217.164:3001"
        this.updateInterval = ''
        this.state = {
            generatedCodes: [],
            added: {check: 0, route: ''},
            tracking: [],
            codes: [],
            currInst: [],
            codeStates: {},
            codeContentStates: {}
        }
    }

    componentWillUnmount() {
        clearInterval(this.updateInterval)
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
        if (index == 3) {
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
            if (index == 1) {
                Axios.get(this.url + '/instrumentation/codes').then(res => {
                    this.setState({
                        codes: res.data
                    });
                });
            }
        }
        
    }

    handleRowClick = (e) => {
        let clickedCode = e.target.innerHTML
        this.setState((prevState) => {
            let tempCodeState = prevState.codeStates
            if (prevState.codeStates[clickedCode] == undefined || prevState.codeStates[clickedCode] == false) {
                tempCodeState[clickedCode] = true
            } else {
                tempCodeState[clickedCode] = false
            }
            return ({codeStates: tempCodeState})
        }, () => {
            if (this.state.codeStates[clickedCode]) {
                let codeTbody = document.getElementById(clickedCode + '-content')
                Axios.get(this.url + '/instrumentation/code/' + clickedCode).then(res => {
                    let stats = res.data
                    console.log(stats)
                    for (let i = 0; i < stats.length; i++) {
                        let row = document.createElement('tr')
                        let cell1 = document.createElement('td')
                        let cell2 = document.createElement('td')
                        cell1.innerHTML = stats[i].file
                        cell2.innerHTML = parseFloat(stats[i].time).toFixed(3)
                        row.appendChild(cell1)
                        row.appendChild(cell2)
                        codeTbody.appendChild(row)
                    }
                });
            }
        })
    }

    render() {
        let trackingContent = []
        let codesContent = []
        let codeContent = []
        let codeHtml = []
        let tr = []
        let lastI = 0
        for (let i = 0; i < this.state.generatedCodes.length; i++) {
            if ((i != 0) && (i % 5 == 0)) {
                codeHtml.push(<div key={"code-row-" + i} className='tr'>{tr}</div>)
                tr = []
            }
            tr.push(
                <div key={"code-" + i} style={{cursor: 'text'}} className="wrap-text td code"><span className='custom-underline'>{this.state.generatedCodes[i]}</span></div>
            )
            lastI = i
        }
        codeHtml.push(<div key={"code-row-" + lastI} className='tr'>{tr}</div>)

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

        for (let i = 0; i < this.state.codes.length; i++) {
            let currCode = this.state.codes[i]
            codesContent.push(
                <div className='v-row'>
                    <div className='v-cell wrap-text td code' style={{cursor: 'pointer'}} ><span className='custom-underline' onClick={this.handleRowClick}>{currCode.code}</span></div>
                    <div className='v-cell'>{currCode.accessed ? currCode.accessed : '-'}</div>
                    <div className='v-cell'>{currCode.surveyed ? 'Yes' : 'No'}</div>
                </div>
                
            )
            codesContent.push(
                <div>
                    {this.state.codeStates[currCode.code] ? <div className='code-div'>
                        <table width='100%'>
                            <thead>
                                <tr>
                                    <td><b>File</b></td>
                                    <td><b>Time Taken</b></td>
                                </tr>
                            </thead>
                            <tbody id={currCode.code + '-content'}>
                            </tbody>
                        </table>
                    </div> : ''}
                </div>
            )
        }

        return (
            <div className='hundred'>
                <div className='admin-panels'>
                    <Tabs onSelect={this.handleTab} >
                        <TabList>
                            <Tab>Generate Codes</Tab>
                            <Tab>Volunteer Progress Monitoring</Tab>
                            <Tab>Upload</Tab>
                            <Tab>Upload Tracking</Tab>
                            <Tab>Insert Routes</Tab>
                            <Tab>Checkpoint</Tab>
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
                            <div>
                                <div className='v-table' width='100%'>
                                    <div className='v-row'>
                                        <p className='v-cell'><b>Code</b></p>
                                        <p className='v-cell'><b>Date Accessed</b></p>
                                        <p className='v-cell'><b>Answered Survey</b></p>
                                    </div>
                                    {codesContent}
                                </div>
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
                            <Checkpoint />
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