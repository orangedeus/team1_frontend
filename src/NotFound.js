import notFound from './assets/404.svg';

import { useLocation } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="NotFound">
            <div className="NotFoundMessage">
                <div className="NotFoundLabel">Oops!</div>
                <div className="NotFoundText">We can't seem to find the page you were looking for. The requested url <b style={{color: 'black'}}>{useLocation().pathname}</b> was not found on this server.</div>
            </div>
            <img className="img404" src={notFound} alt="404" />
        </div>
    )
}