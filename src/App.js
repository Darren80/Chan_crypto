import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      counter: 0
    };
    this.fetchResources = this.fetchResources.bind(this);
  }

  componentDidMount() {
    let timer1 = setInterval(this.fetchResources, 2000);
    this.setState({timer1: timer1});
  }

  fetchResources() {
    fetch('https://cors-proxy-0.herokuapp.com/https://a.4cdn.org/biz/1.json').then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Request Failed!');
    }, networkError => {
    console.log(networkError.message);
    }).then(jsonResponse => {
      this.setState({ chan: jsonResponse });
      console.log(jsonResponse);
    });
    this.setState({ counter: this.state.counter + 1});
    console.log(this.state.counter);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
