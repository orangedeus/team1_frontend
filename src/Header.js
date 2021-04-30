import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from './assets/logo.png';
import logo2 from './assets/logo2.png';
import logo3 from './assets/logo3.png';
import './App.css';

export default function Header(props) {

    const activePath = useLocation().pathname;

    console.log(activePath)

    return (
        <div className="Header">
            <a href='/'><img src={logo3} className="logo" alt="WayStop" /></a>
            <div className="Control">
                <div className="Navigation">
                    <Link className="link" to="/"><button className={`btn1${activePath == '/' ? ' btn1-active' : ''}`}>HOME</button></Link>
                    {props.auth.user ? <Link className="link" to="/annotation"><button className={`btn1${activePath == '/annotation' ? ' btn1-active' : ''}`}>ANNOTATION</button></Link> : null}
                    {props.auth.admin ? <Link className="link" to="/admin"><button className={`btn1${activePath == '/admin' ? ' btn1-active' : ''}`}>ADMIN</button></Link> : null}
                </div>
                {props.auth.user ? <button className="btn1" onClick={props.logout} >LOGOUT</button> : <button className="btn1" onClick={props.login} >LOGIN</button>}
            </div>
        </div>
    )
}