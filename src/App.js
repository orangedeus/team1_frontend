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
    this.state = {
      stops: [],
      mapStops: [],
      mapLoaded: 0,
      auth: {
        user: 0,
        admin: 0,
        code: ''
      },
      loggingIn: 0,
      selectRoutes: [{value: 0, label: 'All'}],
      filter: {
        cleaned: false,
        people: true,
        annotated: false,
        boarding: false,
        alighting: false
      }
    }
  }
  
  componentDidMount() {
    let prevLogin = localStorage.getItem('code')
    if (prevLogin != '') {
      let prevAdmin = localStorage.getItem('admin')
      this.setState({
        auth: {
          user: parseInt(localStorage.getItem('valid')),
          admin: parseInt(prevAdmin),
          code: prevLogin
        }
      })
    }
    axios.get(this.url + '/stops/').then(res => {
      this.setState({
        stops: res.data,
      })
    })
  }
  handleUpdate = (stops) => {
    this.setState({stops: stops})
  }

  handleSelect = () => {
    axios.get(this.url + '/routes').then((res) => {
      this.setState({selectRoutes: [{value: 0, label: 'All'}].concat(res.data)})
    })
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
    let route = e.label
    if (e.label == 'All') {
      route = ''
    }
    axios.get(this.url + '/stops/' + route).then(res => {
      this.setState({
        mapStops: res.data,
        mapLoaded: 1
      })
    })
  }

  handleKeyPress = (e) => {
    if (e.key === "Enter") {
      this.handleLogin()
    }
  }

  handleFilter = (e) => {
    let checkedBox = e.currentTarget
    let lastFilter = this.state.filter
    lastFilter[checkedBox.value] = checkedBox.checked
    this.setState({
      filter: lastFilter
    })
  }

  render() {
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
                <Annotation stops={this.state.stops} userCode={this.state.auth.code} onUpdate={this.handleUpdate}/>
              </Route>
              :
              ''
            }
            <Route path='/' render>
              <div className='hundred header-padding' style={{flexDirection: 'column'}}>
                <Select options={this.state.selectRoutes} className="select-single" onMenuOpen={this.handleSelect} onChange={this.handleChange} />
                <div className="filters">
                  <input type="checkbox" id="people" name="people" value="people" onChange={this.handleFilter} checked={this.state.filter.people}/>
                  <label htmlFor="people">CV</label>
                  <input type="checkbox" id="annotated" name="annotated" value="annotated" onChange={this.handleFilter} checked={this.state.filter.annotated}/>
                  <label htmlFor="annotated">Annotated</label>
                  <input type="checkbox" id="boarding" name="boarding" value="boarding" onChange={this.handleFilter} checked={this.state.filter.boarding}/>
                  <label htmlFor="boarding">Boarding</label>
                  <input type="checkbox" id="alighting" name="alighting" value="alighting" onChange={this.handleFilter} checked={this.state.filter.alighting}/>
                  <label htmlFor="alighting">Alighting</label>
                  <input type="checkbox" id="cleaned" name="cleaned" value="cleaned" onChange={this.handleFilter} checked={this.state.filter.cleaned}/>
                  <label htmlFor="cleaned">Clean</label>
                </div>
                <MapIndex stops={this.state.mapStops} load={this.state.mapLoaded} filter={this.state.filter} />
              </div>
            </Route>   
          </Switch>
        </div>
      </Router>
    )
  }
}

export default App;
