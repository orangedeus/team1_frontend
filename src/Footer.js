import React from 'react';
import logo from './assets/footer-logo2.png';
import arangkadata_logo from './assets/arangkadata-logo.png';
import './App.css';

export default function Footer() {
    return (
        <div className="Footer">
            <div>
                <img className="FooterLogo" src={logo} alt="Footer logo" />
                <p>&copy;2021 <a href="https://www.arangkadata.com" target="_blank" rel="noreferrer" className="wrap-text2"><span className="custom-underline" style={{color: 'black'}}>ArangkaData</span></a></p>
            </div>
        </div>
    )
}