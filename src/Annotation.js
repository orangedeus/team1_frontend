import React from 'react';
import ReactPlayer from 'react-player';
import './App.css';
import axios from 'axios';
import Modal from 'react-modal';
import Select from 'react-select';

var start, end;

class Annotation extends React.Component {
    constructor(props) {
        super(props)
        this.url = "http://18.136.217.164:3001"
        this.start = ''
        this.end = ''
        this.selEl1 = React.createRef();
        this.selEl2 = React.createRef();
        this.selEl3 = React.createRef();
        this.state = {
            followingSelection: '',
            stops: [],
            currIndex: 0,
            playing: false,
            surveyed: this.props.auth.surveyed,
            code: this.props.auth.code
        }
    }
    componentDidMount() {
        this.setState({stops: this.props.stops})
    }
    componentDidUpdate() {
        if (this.state.stops !== this.props.stops) {
            this.setState({stops: this.props.stops})
        }
    }
    handleUpdate = () => {
        this.props.onUpdate(this.state.stops)
    }
    handleSubmit = () => {
        let thisStop = this.state.stops[this.state.currIndex]
        this.end = new Date()
        let total = document.getElementById('people')
        let boarding = document.getElementById('boarding')
        let alighting = document.getElementById('alighting')
        let cov = document.getElementById('cov')
        let newTotal = total.value
        let newBoarding = boarding.value
        let newAlighting = alighting.value
        let following = this.state.followingSelection
        let time = 0
        if (this.start !== '') {
            time = (this.end - this.start) / 1000
        }
        let instrumentation = {time: time, code: this.state.code, file: thisStop.url}
        console.log(instrumentation)
        let currStop = this.state.stops[this.state.currIndex]
        console.log(following)
        axios.post(this.url + '/stops/annotate',
            {
                annotated: newTotal,
                boarding: newBoarding,
                alighting: newAlighting,
                following: following,
                url: currStop.url,
                code: this.props.auth.code
            }
        ).then(res => {
            total.value = ''
            console.log(res)
        })
        axios.post(this.url + '/instrumentation',
            instrumentation
        )
        let newStops = this.state.stops
        newStops[this.state.currIndex].annotated = newTotal
        this.setState({stops: newStops})
        this.handleUpdate()
    }
    handleStart = () => {
        this.start = new Date()
    }
    handleNext = () => {
        this.start = ''
        this.end = ''
        this.setState({currIndex: this.state.currIndex + 1});
    }
    handlePrev = () => {
        this.start = ''
        this.end = ''
        this.setState({currIndex: this.state.currIndex - 1});
    }
    submitForm = () => {
        let age = document.getElementById('Age').value
        let sex = document.getElementById('Sex').innerText
        let educ = document.getElementById('Educ').innerText
        if (age == '' || sex == 'Sex' || educ == 'Education') {
            console.log(this.props.auth.code)
        } else {
            let req = {code: this.props.auth.code, age: age, sex: sex, educ: educ}
            axios.post(this.url + '/survey/submit', req).then(res => {
                console.log(res)
                window.location.reload()
            }).catch(e => {
                console.log(e)
            })
        }
        
    }

    handleSelectChange = (e) => {
        this.setState({
            followingSelection: e.value
        })
    }

    render() {
        let currStop = this.state.stops[this.state.currIndex]
        return(
            
            <div key={"annotate" + this.state.currIndex} className="annotate header-padding">
                <Modal 
                isOpen={!this.state.surveyed}
                closeTimeoutMS={1000}
                onRequestClose={() => {this.setState({surveyed: 0})}}
                shouldCloseOnOverlayClick={false}
                style={{
                    overlay: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.75)',
                    zIndex: 1000
                    },
                    content: {
                    top: '25%',
                    left: '35%',
                    position: 'absolute',
                    border: '1px solid #ccc',
                    background: '#fff',
                    overflow: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    borderRadius: '4px',
                    outline: 'none',
                    padding: '20px',
                    width: '30%',
                    height: '50%',
                    zIndex: 1001
                    },
                }}
                >
                    <div className='welcome-text'>
                        Hi!
                    </div>
                    <div className='welcome-inst'>
                        Please fill up the survey form below.
                    </div>
                    <div className='survey-form'>
                        <input type='number' min='0' placeholder='Age' className='form-input-box' id='Age' required/><br />
                        <Select id='Sex' ref={this.selEl1} options={[{value: 'Male', label: 'M'}, {value: 'Female', label: 'F'}]} placeholder='Sex' isSearchable={false} className="select-single2" id='Sex' required/>
                        <Select id='Educ' ref={this.selEl2} options={[{value: 'Elementary', label: 'Elementary'}, {value: 'High School', label: 'High School'}, {value: 'Undergraduate', label: 'Undergraduate'}, {value: 'Graduate', label: 'Graduate'}]} placeholder='Education' isSearchable={false} className="select-single2" id='Educ' required/>
                        <button className="btn2" onClick={this.submitForm}>
                            Submit
                        </button>
                    </div>
                </Modal>
                <div>
                    {this.state.currIndex} / {this.state.stops.length}
                </div>
                {currStop && <ReactPlayer playing={this.state.playing} url={this.url + '/videos/' + currStop.url} stopOnUnmount={true} onStart={this.handleStart} width={640} height={360} controls={true}/>}
                {currStop && 
                <div className="submit-cont">
                    <div className='annotation-div'>
                        <span>Bilang ng pasahero sa dulo ng bidyo: </span>
                        <input className='annotate-box' placeholder={currStop.people} type='number' id='people' min='0' required/>
                    </div>
                    <div className='annotation-div'>
                        <span>Sumakay: </span>
                        <input className='annotate-box'  type='number' id='boarding' min='0' required/>
                    </div>
                    <div className='annotation-div'>
                        <span>Bumaba: </span>
                        <input className='annotate-box'  type='number' id='alighting' min='0' required/>
                    </div>
                    <div className='annotation-div'>
                        <Select id='cov' placeholder='Sumusunod?' ref={this.selEl3} options={[{value: false, label: 'Hindi'}, {value: true, label: 'Oo'}]} isSearchable={false} className="select-single3" onChange={this.handleSelectChange} required/>
                    </div>
                    <button className='btn2' onClick={this.handleSubmit}>I-annotate</button>
                </div>}
                <div className='navBar'>
                    {this.state.currIndex != 0 ? <button className='btn1-2' onClick={this.handlePrev}>Previous</button> : <button style={{visibility: 'hidden'}}></button>}
                    {this.state.currIndex + 1 < this.state.stops.length ? <button className='btn1-2' onClick={this.handleNext}>Next</button> : <button style={{visibility: 'hidden'}}></button>}
                </div>
            </div>
        )
    }
}

export default Annotation;