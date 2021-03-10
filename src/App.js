import React from 'react';
import logo from './logo.svg';
import MapIndex from './MapIndex';
import Header from './Header';
import Annotation from './Annotation';
import Upload from './Upload';
import './App.css';
import Fade from 'react-reveal/Fade';
import axios from 'axios';
import { 
  BrowserRouter as Router, 
  Route, 
  Link, 
  Switch 
} from 'react-router-dom'; 

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      stops1: [],
      stops2: [],
      stops3: [],
      stops4: [],
      loaded1: 0,
      loaded2: 0,
      loaded3: 0,
      loaded4: 0
    }
  }
  componentDidMount() {
    axios.get(`http://localhost:3001/stops/all`).then(res => {
      this.setState({stops1: res.data.data, loaded1: 1})
    })
    .catch(e => {
      console.log(e)
    })
    axios.get(`http://localhost:3001/stops/all/cleaned`).then(res => {
      this.setState({stops2: res.data.data, loaded2: 1})
    })
    .catch(e => {
      console.log(e)
    })
    axios.get(`http://localhost:3001/stops/all/annotated`).then(res => {
      this.setState({stops3: res.data.data, loaded3: 1})
    })
    .catch(e => {
      console.log(e)
    })
    axios.get(`http://localhost:3001/stops/all/clean_annotated`).then(res => {
      this.setState({stops4: res.data.data, loaded4: 1})
    })
    .catch(e => {
      console.log(e)
    })
  }
  handleUpdate = (stops) => {
    this.setState({stops: stops})
  }
  render() {
    console.log(this.state.stops1)
    console.log(this.state.stops2)
    console.log(this.state.stops3)
    console.log(this.state.stops4)
    return(
      <Router>
        <div className="App">
          <Header />
          <Switch>
            <Route path='/upload' render>
              <Upload />
            </Route>
            <Route path='/annotation' render>
              <Annotation stops={this.state.stops3} onUpdate={this.handleUpdate}/>
            </Route>
            <Route path='/' render>
              <div className='hundred header-padding'>
                <MapIndex stops={this.state.stops1} load={this.state.loaded1}/>
                <MapIndex stops={this.state.stops2} load={this.state.loaded2}/>
                <MapIndex stops={this.state.stops3} load={this.state.loaded3}/>
                <MapIndex stops={this.state.stops4} load={this.state.loaded4}/>
              </div>
            </Route>   
          </Switch>
        </div>
      </Router>
    )
  }
}

export default App;
