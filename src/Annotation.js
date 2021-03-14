import React from 'react';
import ReactPlayer from 'react-player';
import './App.css';
import axios from 'axios';

var start, end;

class Annotation extends React.Component {
    constructor(props) {
        super(props)
        this.url = "http://13.251.37.189:3001"
        this.start = ''
        this.end = ''
        this.state = {
            stops: [],
            currIndex: 0,
            playing: false
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
        let input = document.getElementById('people')
        let newPeople = input.value
        let time = 0
        if (this.start !== '') {
            time = (this.end - this.start) / 1000
        }
        let instrumentation = {time: time, code: this.props.userCode, file: thisStop.url}
        console.log(instrumentation)
        let currStop = this.state.stops[this.state.currIndex]
        axios.post(this.url + '/stops/update',
            {
                location: {
                    x: currStop.location.x,
                    y: currStop.location.y
                },
                people: newPeople
            }
        ).then(res => {
            input.value = ''
            console.log(res)
        })
        axios.post(this.url + '/instrumentation',
            instrumentation
        )
        let newStops = this.state.stops
        newStops[this.state.currIndex].people = newPeople
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
    render() {
        let currStop = this.state.stops[this.state.currIndex]
        return(
            <div key={"annotate" + this.state.currIndex} className="annotate header-padding">
                {currStop && <ReactPlayer playing={this.state.playing} url={this.url + '/videos/' + currStop.url} stopOnUnmount={true} onStart={this.handleStart} width={640} height={360} controls={true}/>}
                {currStop && 
                <div className="submit-cont">
                    <input className='annotate-box' placeholder={currStop.people} type='number' id='people'/>
                    <button className='btn2' onClick={this.handleSubmit}>Annotate</button>
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