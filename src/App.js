import React from 'react';
import logo from './logo.svg';
import MapIndex from './MapIndex';
import Header from './Header';
import Annotation from './Annotation';
import submit from './submit.png';
import Admin from './Admin';
import './App.css';
import Fade from 'react-reveal/Fade';
import Modal from 'react-modal';
import axios from 'axios';
import Select from 'react-select';
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
    this.options = [
      {value: '1', label: 'All'},
      {value: '2', label: 'All Cleaned'},
      {value: '3', label: 'Annotated'},
      {value: '4', label: 'Annotated Cleaned'},
      {value: '5', label: 'Screened'}
    ]
    this.state = {
      stops: [],
      stops1: [],
      stops2: [],
      stops3: [],
      stops4: [],
      stops5: [],
      loaded: 0,
      loaded1: 0,
      loaded2: 0,
      loaded3: 0,
      loaded4: 0,
      loaded5: 0,
      auth: {
        user: 0,
        admin: 0,
        code: ''
      },
      loggingIn: 0
    }
  }
  
  componentDidMount() {
    let prevLogin = localStorage.getItem('code')
    if (prevLogin != '') {
      let prevAdmin = localStorage.getItem('admin')
      console.log('Admin? ' + prevAdmin)
      this.setState({
        auth: {
          user: parseInt(localStorage.getItem('valid')),
          admin: parseInt(prevAdmin),
          code: prevLogin
        }
      })
    }
    axios.get(this.url + `/stops/all`).then(res => {
      this.setState({stops: res.data.data, loaded: 1, stops1: res.data.data, loaded1: 1})
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
    axios.get(this.url + `/stops/all/screened`).then(res => {
      this.setState({stops5: res.data.data, loaded5: 1})
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
      this.setState({
        loggingIn: !res.data.user,
        auth: res.data
      })
      localStorage.setItem('valid', res.data.user)
      localStorage.setItem('admin', res.data.admin)
      localStorage.setItem('code', loginCode)
    })
  }

  handleLoginPress = () => {
    this.setState({loggingIn: 1})
  }

  handleLogoutPress = () => {
    localStorage.setItem('valid', 0)
    localStorage.setItem('admin', 0)
    localStorage.setItem('code', '')
    this.setState({
      auth: {
        user: 0,
        admin: 0,
        code: ''
      }
    })
  }

  handleChange = (e) => {
    let changeStop = ''
    let changeLoaded = ''
    if (e.value == 1) {
      changeStop = this.state.stops1
      changeLoaded = this.state.loaded1
    }
    if (e.value == 2) {
      changeStop = this.state.stops2
      changeLoaded = this.state.loaded2
    }
    if (e.value == 3) {
      changeStop = this.state.stops3
      changeLoaded = this.state.loaded3
    }
    if (e.value == 4) {
      changeStop = this.state.stops4
      changeLoaded = this.state.loaded4
    }
    if (e.value == 5) {
      changeStop = this.state.stops5
      changeLoaded = this.state.loaded5
    }
    this.setState({
      stops: changeStop,
      loaded: changeLoaded
    })
  }

  handleKeyPress = (e) => {
    if (e.key === "Enter") {
      this.handleLogin()
    }
  }

  render() {
    console.log(this.state.auth)
    return(
      <Router>
        <Modal 
          isOpen={this.state.loggingIn}
          closeTimeoutMS={1000}
          onRequestClose={() => {this.setState({loggingIn: 0})}}
          shouldCloseOnOverlayClick={true}
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
            },
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
            <label className="animated-label" htmlFor="code">CODE</label>
            <button type="submit" className="input-button" onClick={this.handleLogin}>
              <img src={submit} alt="Submit" className="input-img" />
            </button>
          </div>
        </Modal>
        <div id="App" className="App">
          <Header auth={this.state.auth} logIn={this.handleLoginPress} logOut={this.handleLogoutPress} />
          <Switch>
            {this.state.auth.admin ?
              <Route path='/admin' render>
                <Admin code={this.state.auth.code} />
              </Route>
              :
              ''
            }
            {this.state.auth.user ?
              <Route path='/annotation' render>
                <Annotation stops={this.state.stops3} userCode={this.state.auth.code} onUpdate={this.handleUpdate}/>
              </Route>
              :
              ''
            }
            <Route path='/' render>
              <div className='hundred header-padding' style={{flexDirection: 'column'}}>
                <Select options={this.options} className="select-single" onChange={this.handleChange} />
                <MapIndex stops={this.state.stops} load={this.state.loaded}/>
              </div>
            </Route>   
          </Switch>
        </div>
      </Router>
    )
  }
}

export default App;
