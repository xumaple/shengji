import React from 'react';
// import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
// import 'bootstrap/dist/css/bootstrap.min.css';
import firebase from '../static/js/firebase.js';

class Game extends React.Component {
    constructor(props) {
        super(props);

        this.state = {players: null, spectating: false};
    }

    componentDidMount() {
        let players = [];
        let userPos = null;
        this.props.db.child('players').once('value', (snapshot) => {
            userPos = this.state.players.pushPlayer(getPlayer(snapshot));
        })
        players = players.slice(0, 4);
        let spectating = userPos === null || userPos >= 4 || userPos < 0;
        if (!spectating && userPos > 0) {
            players = [...players.slice(userPos), ...players.slice(0, userPos)];
        }

        this.setState({players, spectating});
    }

    componentWillUnmount() {
    }

    render() {
        if (this.state.players === null) {
            return <div>Hello 👋, The game is loading</div>;
        }
        
        return <div>
            <div><Person self={false} position={'up'}/></div>
            <div>
                <span><Person self={false} position={'left'}/></span>
                <span><Person self={false} position={'right'}/></span>
            </div>
            <div><Person self={true} position={'down'}/></div>
        </div>;
    }
}

class Person extends React.Component {
    constructor(props) {
        super(props);


    }

    render() {
        return <div>{this.props.position}</div>
    }
}



export default Game;