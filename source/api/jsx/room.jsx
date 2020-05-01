import React from 'react';
import ReactDOM from 'react-dom';
import firebase from '../static/js/firebase.js'

class Room extends React.Component {
    constructor(props) {
        super(props);
    }

    // componentDidMount() {
    //     fetch("https://worker.shengji.workers.dev/api/v1/")
    //     .then(response => response.json())
    //     .then(data => { this.setState({name: data.display}); })
    // }

  render() {
    return <div>Hello, daniel 👋</div>;
  }
}


ReactDOM.render(

    <Room db={firebase.database().ref()}
    />,
    document.getElementById('reactEntry'),

);
