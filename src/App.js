import React from 'react';
import logo from './logo.svg';
import MapIndex from './MapIndex';
import Header from './Header';
import Annotation from './Annotation';
import submit from './submit.png';
import Upload from './Upload';
import './App.css';
import Fade from 'react-reveal/Fade';
import Modal from 'react-modal';
import axios from 'axios';
import { 
  BrowserRouter as Router, 
  Route, 
  Link, 
  Switch 
} from 'react-router-dom'; 

Modal.setAppElement(document.getElementById('root'));

class App extends React.Component {
  constructor(props) {
    super(props)
    this.url = "http://13.251.37.189:3001"
    this.state = {
      stops1: [],
      stops2: [],
      stops3: [],
      stops4: [],
      loaded1: 0,
      loaded2: 0,
      loaded3: 0,
      loaded4: 0,
      code: '',
      authorized: false,
    }
  }
  
  componentDidMount() {
    axios.get(this.url + `/stops/all`).then(res => {
      this.setState({stops1: res.data.data, loaded1: 1})
    })
    .catch(e => {
      console.log(e)
    })
    axios.get(this.url + `/stops/all/cleaned`).then(res => {
      this.setState({stops2: res.data.data, loaded2: 1})
    })
    .catch(e => {
      console.log(e)
    })
    axios.get(this.url + `/stops/all/annotated`).then(res => {
      this.setState({stops3: res.data.data, loaded3: 1})
    })
    .catch(e => {
      console.log(e)
    })
    axios.get(this.url + `/stops/all/clean_annotated`).then(res => {
      this.setState({stops4: res.data.data, loaded4: 1})
    })
    .catch(e => {
      console.log(e)
    })

  }
  handleUpdate = (stops) => {
    this.setState({stops: stops})
  }

  handleLogin = () => {
    let input = document.getElementById('code')
    let loginCode = input.value
    axios.post(this.url + '/login',
      {
        code: loginCode
      }
    ).then(res => {
      if (res.data.valid) {
        this.setState({
          authorized: true,
          code: loginCode
        })
      }
    })
  }

  handleKeyPress = (e) => {
    if (e.key === "Enter") {
      this.handleLogin()
    }
  }

  render() {
    console.log(this.state.stops1)
    console.log(this.state.stops2)
    console.log(this.state.stops3)
    console.log(this.state.stops4)
    return(
      <Router>
        <Modal 
          isOpen={!this.state.authorized}
          closeTimeoutMS={1000}
          ariaHideApp={true}
          shouldCloseOnOverlayClick={false}
          onRequestClose={() => {console.log('testing');}}
          onAfterClose={() => {console.log('closed');}}
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
              top: '35%',
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
              height: '30%',
              zIndex: 1001
            }
          }}
        >
          <div className='welcome-text'>
            Welcome!
          </div>
          <div className='welcome-inst'>
            Enter the code given to you below.
          </div>
          <div className="animated-input-field">
            <input className="animated-input" type="password" id="code" onKeyUp={this.handleKeyPress} required />
            <label className="animated-label" for="code">CODE</label>
            <button type="submit" className="input-button" onClick={this.handleLogin}>
              <img src={submit} alt="Submit" className="input-img" />
            </button>
          </div>
        </Modal>
        {this.state.authorized ?
          <div id="App" className="App">
            <Header />
            <Switch>
              <Route path='/upload' render>
                <Upload />
              </Route>
              <Route path='/annotation' render>
                <Annotation stops={this.state.stops3} userCode={this.state.code} onUpdate={this.handleUpdate}/>
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
          :
          <div />
        }
      </Router>
    )
  }
}

export default App;
