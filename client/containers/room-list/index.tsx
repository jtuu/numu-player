import * as React from "react";
import NavLink from "../../components/nav-link";
import {connect} from "react-redux";
import {subscribeRoomlist, unsubscribeRoomlist} from "../../actions";

interface RoomListProps{
  rooms?: any[];
  dispatch?: Function;
}

const mapStateToProps = ({roomlist}): RoomListProps => {
  return {rooms: roomlist};
}

const mapDispatchToProps = (dispatch: Function) : RoomListProps => {
  return {dispatch};
};

const decorate = connect<RoomListProps, RoomListProps, {}>(
  mapStateToProps,
  mapDispatchToProps
);

class RoomList extends React.Component<RoomListProps,{}>{

  componentDidMount(){
    subscribeRoomlist();
  }

  componentWillUnmount(){
    unsubscribeRoomlist();
  }

  render(){
    return (
      <ul>
        {
          this.props.rooms.map(r => (
            <li key={r.id}>
              <NavLink to={`/room/${encodeURIComponent(r.name)}`}>
                {r.name}
              </NavLink>
            </li>
          ))
        }
      </ul>
    )
  }
}

export default decorate(RoomList);
