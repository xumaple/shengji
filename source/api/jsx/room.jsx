import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import firebase from '../static/js/firebase.js'

var user = document.getElementById('user').textContent

class Room extends React.Component {
    constructor(props) {
        super(props);

        this.state = {game: 'loading'};

        this.props.db.child('state').on('value', (snapshot) => {
            const val = snapshot.val();
            console.log(val)
            if (val !== null) {
                this.setState({game: val, connected: true});
            }
        })

        this.heartbeat = this.heartbeat.bind(this);
    }

    heartbeat() {
        // console.log("heartbeat call received")
        fetch(this.props.url.concat('heartbeat/'))
            .then(response => response.json())
            .then(data => {
                console.log('disconnected:', data.disconnected); 
                if (data.disconnected === true) {
                    this.setState({connected: false});
                }
            })
            .catch(error => { console.log('cannot connect to server', error); });
        setTimeout(this.heartbeat, 2000);
    }

    componentDidMount() {
        // console.log("heartbeat called")
        setTimeout(this.heartbeat, 0);
        window.addEventListener('beforeunload', (e) => {
            e.preventDefault();
            fetch(this.props.url.concat('leave/'));
            return false;
        });
    }

    componentWillUnmount() {
        fetch(this.props.url.concat('leave/'));
    }

    render() {
        if (this.state.game === 'loading') {
            return <div>Hello 👋, The game is loading</div>;
        }
        if (this.state.game === 'waiting') {
            return <div>
                <Header url={this.props.url} connected={this.state.connected} />
                <WaitingRoom url={this.props.url} db={this.props.db.child('players')} />
            </div>
        }
        return <div>game</div>
  }
}



function Header(props) {
    return <div>
        <Modal isOpen={!props.connected}>
            <ModalHeader>Error</ModalHeader>
            <ModalBody>
                <div>You have disconnected. Please refresh the page.</div>

            </ModalBody>
            {/*<ModalFooter>
                <Button onClick={() => {this.setState({ copied: false }); this.props.cancel()}}>
                    Cancel
                </Button>
                <Button color="primary" onClick={this.props.submit}>
                    Confirm
                </Button>
            </ModalFooter>*/}
        </Modal>
    </div>
}

function getPlayer(snapshot) {
    console.log('entry', snapshot.val().entry)
    const {entry, ready} = snapshot.val();
    return {player: snapshot.key, ready, entry};
}

Array.prototype.pushPlayer = function(player) {
    // Sorts by entry
    // Returns index of user, or null
    // Always just searches for user and position linearly, this is fine since we are working with max 4 elements
    let userIndex = null;
    let added = false;
    const { entry } = player;
    let count = 0;
    for (let i = 0; i < this.length; ++i) {
        if (this[i].player === user) {
            userIndex = i;
        }
        if (added === false && entry < this[i].entry) {
            this.splice(i, 0, player);
            --i;
            added = true;
        }
        ++count;
        if (count > 10) break;
    }
    if (added === false) {
        this.push(player);
        if (userIndex === null && player.player === user) {
            userIndex = this.length - 1;
        }
    }

    // if (this.length > 4) {
    //     this.pop()
    //     if (userIndex > 3) {
    //         userIndex = null;
    //     }
    // }
    return userIndex;
};

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

Array.prototype.popPlayer = function(player) {
    console.log('95', this)
    let userIndex = null;
    for (let i = 0; i < this.length; ++i) {
        console.log(i, this[i].player, player.player)
        if (this[i].player === player.player) {
            this.remove(i);
            // console.log(this.remove(i), this);
            --i;
        }
        else if (this[i].player === user) {
            userIndex = i;
        }
    }
    return userIndex;
}

Array.prototype.changePlayer = function(player) {
    console.log(player, this)
    for (let i = 0; i < this.length; ++i) {
        if (this[i].player === player.player) {
            this[i] = player;
            break;
        }
    }
}

class WaitingRoom extends React.Component {
    constructor(props) {
        super(props);

        this.state = {players: [], userPos: null};

        // this.props.db.orderByChild('entry').once('value', (snapshot) => {
        //     console.log('53', snapshot);
        //     // const val = snapshot.val();
        //     // if (val !== null) {
        //     //     console.log(val)
        //     //     this.setState({players: val});
        //     // }
        //     const players = []
        //     snapshot.forEach((player) => {
        //         players.push(getPlayer(snapshot));
        //     });
        //     this.setState({players});
        // })

        this.props.db.on('child_added', (snapshot) => {
            console.log('118')
            let userPos = this.state.players.pushPlayer(getPlayer(snapshot));
            this.setState({players: this.state.players, userPos});
        })

        this.props.db.on('child_removed', (snapshot) => {
            let userPos = this.state.players.popPlayer(getPlayer(snapshot));
            this.setState({players: this.state.players, userPos});
        })

        this.props.db.on('child_changed', (snapshot) => {
            console.log('113')
            this.state.players.changePlayer(getPlayer(snapshot));
            this.setState({players: this.state.players});
        })

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        e.preventDefault(); 
        const { players, userPos } = this.state;
        const ready = players[userPos].ready;
        const url = ready === false ? '' : 'not';
        console.log('148')
        fetch(this.props.url.concat(url + 'ready/')).then((response) => {console.log('back from fetch');});
        players[userPos].ready = !ready;
        this.setState({players});
    }

    render() {
        console.log('rendering', this.state.players, this.state.userPos);
        let { players } = this.state;
        if (players.length > 4) {
            players = players.slice(0, 4);
        }
        return <div>
            <div>{players.length} Players joined {((this.state.userPos >= 4) || (this.state.userPos < 0)) === true ? <div style={{fontStyle: 'italic'}}>Spectating</div> : ''}</div>
            <div></div>
            {players.map((info, i) => {
                const {player, ready} = info;
                console.log("80", info.entry);
                return <div style={{color: this.state.userPos === i ? '#ff2222' : '#000000'}}>{player} {ready === false ? 'Not Ready' : 'Ready    '} {this.state.userPos === i ? <span>
                    <button onClick={this.handleClick}>{ready === false ? 'Ready' : 'Cancel'}</button>
                    </span> : ''}</div>
            })}
        </div>;
    }
}


ReactDOM.render(

    <Room 
        url={'/api/v1/room/'.concat('da71e1ee', '/')}
        db={firebase.database().ref('games/da71e1ee')}
    />,
    document.getElementById('reactEntry'),

);
