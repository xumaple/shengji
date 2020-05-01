import React from 'react';
import ReactDOM from 'react-dom';

class HelloMessage extends React.Component {
    constructor(props) {
        super(props);
        const { name } = props;
        this.state = {name}
    }

    // componentDidMount() {
    //     fetch("https://worker.shengji.workers.dev/api/v1/")
    //     .then(response => response.json())
    //     .then(data => { this.setState({name: data.display}); })
    // }

  render() {
    return <div>Hello, {this.state.name} 👋</div>;
  }
}


ReactDOM.render(

    <HelloMessage name="daniel lee"/>,
    document.getElementById('reactEntry'),

);
