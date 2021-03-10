import React from 'react';
import ReactPlayer from 'react-player';
import './App.css';
import axios from 'axios';

var start, end;

class Annotation extends React.Component {
    constructor(props) {
        super(props)
        this.url = 'http://localhost:3001/videos/'
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
        this.end = new Date()
        let input = document.getElementById('people')
        let newPeople = input.value
        if (this.start !== '') {
            console.log((this.end - this.start) / 1000)
        }
        let currStop = this.state.stops[this.state.currIndex]
        axios.post('http://localhost:3001/stops/update',
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
        let newStops = this.state.stops
        newStops[this.state.currIndex].people = newPeople
        this.setState({stops: newStops})
        this.handleUpdate()
    }
    handleStart = () => {
        this.start = new Date()
    }
    handleNext = () => {
        this.setState({currIndex: this.state.currIndex + 1});
    }
    handlePrev = () => {
        this.setState({currIndex: this.state.currIndex - 1});
    }
    render() {
        let currStop = this.state.stops[this.state.currIndex]
        return(
            <div key={"annotate" + this.state.currIndex} className="annotate header-padding">
                {currStop && <ReactPlayer playing={this.state.playing} url={this.url + currStop.url} stopOnUnmount={true} onStart={this.handleStart} width={640} height={360} controls={true}/>}
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