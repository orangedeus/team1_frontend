import React from 'react';
import Upload from './Upload';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Axios from 'axios';
import copy from './copy.png';

class Admin extends React.Component {

    constructor(props) {
        super(props)
        this.url = "http://13.251.37.189:3001"
        this.state = {
            generatedCodes: []
        }
    }

    handleGenerate = () => {
        let genBox = document.getElementById('generate');
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

    copyTable = () => {
        const elTable = document.querySelector('#table');
        
        let range, sel;
        
        // Ensure that range and selection are supported by the browsers
        if (document.createRange && window.getSelection) {
        
          range = document.createRange();
          sel = window.getSelection();
          // unselect any element in the page
          sel.removeAllRanges();
        
          try {
            range.selectNodeContents(elTable);
            sel.addRange(range);
          } catch (e) {
            range.selectNode(elTable);
            sel.addRange(range);
          }
        
          document.execCommand('copy');
        }
        
        sel.removeAllRanges();
    }

    render() {
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
        return (
            <div className='hundred'>
                <div className='admin-panels'>
                    <Tabs>
                        <TabList>
                            <Tab>Generate Codes</Tab>
                            <Tab>Upload</Tab>
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
                    </Tabs>
                </div>
            </div>
        )
    }
}


export default Admin