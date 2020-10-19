import React from 'react';
import logo from './logo.svg';
import MapIndex from './MapIndex';
import './App.css';
import Fade from 'react-reveal/Fade';

const data = [
    {
      'date': '2020-10-19',
      'stops': [
          {
              'coordinate': [14.64961111111111, 121.06869722222221],
              'people': '34'
          },
          {
              'coordinate': [14.648991666666666, 121.06889166666666],
              'people': '56'
          },
          {
              'coordinate': [14.650947222222223, 121.06841944444444],
              'people': '78'
          }
      ]
    },
    {
      'date': '2020-10-20',
      'stops': [
          {
              'coordinate': [14.652377777777778, 121.06812222222221],
              'people': '3'
          },
          {
              'coordinate': [14.651905555555556, 121.06681388888889],
              'people': '102'
          },
          {
              'coordinate': [14.652891666666667, 121.0630861111111],
              'people': '12'
          }
      ]
    },
    {
      'date': '2020-10-21',
      'stops': [
          {
              'coordinate': [14.647616666666666, 121.06337777777777],
              'people': '7'
          },
          {
              'coordinate': [14.647691666666667, 121.06394722222223],
              'people': '12'
          },
          {
              'coordinate': [14.647683333333333, 121.06437222222222],
              'people': '80'
          },
          {
              'coordinate': [14.647958333333333, 121.06580277777778],
              'people': '10'
          }
      ]
    }
  ]

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      data: data,
      curr_stops: []
    }
  }
  loadMarker = (et) => {
    this.setState({curr_stops: this.state.data[parseInt(et.target.innerHTML) - 1].stops})
  } 
  render() {
    let items = []
    for (var i = 0; i < this.state.data.length; i++) {
      items.push(
        <button className='entry' onClick={this.loadMarker}>
          {i + 1}
        </button>
      )
    }
    return(
      <div className="App">
        <div className='fifty'>
          <div className='entries'>
            {items}
          </div>
        </div>
        <div className='fifty'>
          <MapIndex stops={this.state.curr_stops}/>
        </div>
      </div>
    )
  }
}

export default App;
