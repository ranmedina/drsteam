import React from 'react';
import { connect } from 'react-redux';
import logo from '../assets/steamlogin.png';
import './SteamUser.scss';
import { SERVER_HOST } from '../api/index';
import Dropdown from 'react-bootstrap/Dropdown';

const mapStateToProps = (state) => state;

function SteamUser(props) {
  const steamLogin = () => (window.location.href = `${SERVER_HOST}/auth/steam`);

  return (
    <div>
      {props.user.username ? (
        <Dropdown alignRight={false}>
          <Dropdown.Toggle as={'div'}>
            <div className='steam_user'>
              <img alt='Steam Profile Avatar' className='image' src={props.user.avatar} />
              <p className='username'>{props.user.username}</p>
            </div>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item href={`${SERVER_HOST}/auth/logout`}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ) : (
        <img alt='Steam Login Button' src={logo} onClick={steamLogin} className='login-image' />
      )}
    </div>
  );
}

export default connect(mapStateToProps)(SteamUser);
