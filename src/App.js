import React, { useEffect, useState } from 'react';
import { 
  BrowserRouter as Router, 
  Route, 
  Link, 
  Switch,
} from 'react-router-dom';
import Modal from 'react-modal';
import axios from 'axios';

import Header from './Header';
import Home from './Home';
import Annotation from './Annotation';
import Admin from './Admin';
import './App.css';

import submit from './assets/submit.png';

Modal.setAppElement(document.getElementById('root'));

function App() {

  const url = "http://18.136.217.164:3001"

  const [auth, setAuth] = useState(
    {
      user: 0,
      admin: 0,
      code: ''
    }
  )
  const [loggingIn, setLoggingIn] = useState(false)

  const codeRef = React.createRef()

  useEffect(() => {
    console.log('componentDidMount')
    let prevLogin = localStorage.getItem('code')
    if (prevLogin != '') {
      axios.post(url + '/login',
        {
          code: prevLogin
        }
      ).then(res => {
        setAuth(res.data)
        localStorage.setItem('valid', res.data.user)
        localStorage.setItem('admin', res.data.admin)
        localStorage.setItem('code', prevLogin)
      }).catch(e => {
        console.log(e)
      })
    }
  }, [])

  useEffect(() => {
    if (loggingIn && auth.user) {
      setLoggingIn(false)
    }
  }, [auth])

  const handleLoginPress = () => {
    setLoggingIn(true)
  }

  const handleLogoutPress = () => {
    localStorage.setItem('valid', 0)
    localStorage.setItem('admin', 0)
    localStorage.setItem('code', '')
    setAuth(
      {
        user: 0,
        admin: 0,
        code: ''
      }
    )
  }

  const handleLogin = () => {
    let loginCode = codeRef.current.value
    axios.post(url + '/login',
      {
        code: loginCode
      }
    ).then((res) => {
      setAuth(res.data)
      localStorage.setItem('valid', res.data.user)
      localStorage.setItem('admin', res.data.admin)
      localStorage.setItem('code', loginCode)
    })
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  return (
    <Router>
      <Modal 
          isOpen={loggingIn}
          closeTimeoutMS={1000}
          onRequestClose={() => {setLoggingIn(false)}}
          shouldCloseOnOverlayClick={true}
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
              zIndex: 1001,
              transition: '1s ease-in'
            },
          }}
        >
          <div className='WelcomeText'>
            Welcome!
          </div>
          <div className='WelcomeInst'>
            Enter the code given to you below.
          </div>
          <div className="animated-input-field">
            <input ref={codeRef} className="animated-input" type="password" id="code" onKeyUp={handleKeyPress} required />
            <label className="animated-label" htmlFor="code">CODE</label>
            <button type="submit" className="input-button" onClick={handleLogin}>
              <img src={submit} alt="Submit" className="input-img" />
            </button>
          </div>
        </Modal>
      <div className="App">
        <Header auth={auth} login={handleLoginPress} logout={handleLogoutPress} />
        <div className="Content">
          <Switch>
            {auth.admin ? <Route path="/admin">
              <Admin />
            </Route> : null}
            {auth.user ? <Route path="/annotation">
              <Annotation code={auth.code} />
            </Route> : null}
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
      
  );
}

export default App;
