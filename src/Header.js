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
                            <Link to='/'><div className='btn1'>Home</div></Link>
                        </li>
                        {this.props.auth.user ?
                            <li>
                                <Link to='/annotation'><div className='btn1'>Annotation</div></Link>
                            </li>
                            :
                            ''
                        }
                        {this.props.auth.admin ?
                            <li>
                                <Link to='/admin'><div className='btn1'>Admin</div></Link>
                            </li>
                            :
                            ''
                        }
                        {!this.props.auth.user ?
                            <li>
                                <div className='btn1' onClick={this.props.logIn} >Log In</div>
                            </li>
                            :
                            <li>
                                <div className='btn1' onClick={this.props.logOut} >Log Out</div>
                            </li>
                        }
                    </ul>
                </div>
            </div>
        )
    }
}

export default Header;