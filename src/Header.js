import React from 'react';
import App from './App';
import './App.css';
import logo from './temp-logo.png';
import { 
    BrowserRouter as Router, 
    Link,
  } from 'react-router-dom'; 


class Header extends React.Component {
    render() {
        return(
            <div className='Header'>
                <a href='/'><img src={logo} alt="WayStop" style={{paddingLeft: '4rem', width: '30%'}}/></a>
                <div className="third">
                    <ul className='links'>
                        <li>
                            <Link to='/'><button className='btn1'>Home</button></Link>
                        </li>
                        <li>
                            <Link to='/annotation'><button className='btn1'>Annotation</button></Link>
                        </li>
                        <li>
                            <Link to='/upload'><button className='btn1'>Upload</button></Link>
                        </li>
                    </ul>
                </div>
            </div>
        )
    }
}

export default Header;