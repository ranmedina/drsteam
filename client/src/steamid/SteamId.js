import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import PageWrapper from '../layout/PageWrapper';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import UserApi from '../api/user';
import LoadingIcon from '../layout/LoadingIcon';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './SteamId.scss';
import { Helmet } from 'react-helmet';

const mapStateToProps = (state) => state.user;

const SteamId = (props) => {
  const [steamid, setSteamid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSearch, setLastSearch] = useState(null);
  const [playerData, setPlayerData] = useState({});
  const [show, setShow] = useState({
    customURL: false,
    id3: false,
    id32: false,
    id64: false,
  });
  const showRef = useRef(show);
  showRef.current = show;
  const tooltipTargets = {
    customURL: useRef(null),
    id3: useRef(null),
    id32: useRef(null),
    id64: useRef(null),
  };
  const inputRef = useRef();

  const handleChange = (e) => {
    setSteamid(e.target.value);
    localStorage.setItem('steamid', e.target.value);
  };

  const fetchSteamId = async () => {
    if (lastSearch === steamid) {
      return;
    }

    setLoading(true);
    setLastSearch(steamid);
    setError(null);
    setPlayerData({});
    try {
      const { data } = await UserApi.getSteamId(steamid);
      const dateObj = new Date(data.data.createdAt * 1000);
      data.data.createdAt = `${('0' + dateObj.getDate()).slice(-2)}/${('0' + dateObj.getMonth() + 1).slice(
        -2
      )}/${dateObj.getFullYear()}, ${('0' + dateObj.getHours()).slice(-2)}:${('0' + dateObj.getMinutes()).slice(-2)}`;
      setPlayerData(data.data);
      setError(null);
    } catch ({ response: { data } }) {
      setError(data.description);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (property) => {
    if (show[property]) {
      return;
    }

    setShow({ ...show, [property]: true });
  };

  useEffect(() => {
    if (props.steamid) {
      setSteamid(props.steamid);
    } else if (localStorage.getItem('steamid')) {
      setSteamid(localStorage.getItem('steamid'));
    }
    inputRef.current.focus();
  }, [props.steamid]);

  const PlayerDataContainer = () => {
    const { customURL, nickname, createdAt, visibility, commentPermission } = playerData;

    return (
      <React.Fragment>
        <div className='steamid_container'>
          {customURL !== null && (
            <div className='steamid_property'>
              <div className='title'>Custom URL</div>{' '}
              <CopyToClipboard text={customURL}>
                <div ref={tooltipTargets.customURL} onClick={() => copyToClipboard('customURL')}>
                  {customURL}
                </div>
              </CopyToClipboard>
            </div>
          )}
          {['id3', 'id32', 'id64'].map((e) => (
            <div className='steamid_property' key={e}>
              <div className='title'>{`Steam ${e.toUpperCase()}`}</div>{' '}
              <CopyToClipboard text={playerData[e]}>
                <div ref={tooltipTargets[e]} onClick={() => copyToClipboard(e)}>
                  {playerData[e]}
                </div>
              </CopyToClipboard>
            </div>
          ))}

          <div className='steamid_property'>
            <div className='title'>Nickname</div> <div className='no-copy'>{nickname}</div>
          </div>
          <div className='steamid_property'>
            <div className='title'>Created at</div> <div className='no-copy'>{createdAt}</div>
          </div>

          <ul>
            <li>
              <span>{visibility === 3 ? 'Everyone (or only friends)' : 'No one'}</span> can watch your profile
            </li>
            <li>
              <span>{!commentPermission ? 'Friends only' : commentPermission === 1 ? 'Everyone' : 'No one'}</span> can comment on your
              profile
            </li>
          </ul>
        </div>

        {Object.keys(tooltipTargets).map((e) => (
          <React.Fragment key={e}>
            <Overlay
              target={tooltipTargets[e]}
              show={show[e]}
              placement='right'
              onHide={() => {}}
              onEnter={() => {
                setTimeout(() => {
                  setShow({ ...showRef.current, [e]: false });
                }, 750);
              }}
            >
              {(props) => <Tooltip {...props}>Copied to clipboard!</Tooltip>}
            </Overlay>
          </React.Fragment>
        ))}
      </React.Fragment>
    );
  };

  return (
    <PageWrapper>
      <Helmet>
        <title>Dr.Steam | Steam ID Converter</title>
        <meta
          name='description'
          content='Steam ID converter lets you translate your steam id (by any form) to all other steam id types.'
        ></meta>
      </Helmet>

      <p>Type your Steam ID in any form (ID3, ID32, ID64, Custom URL) to reveal full information regarding your steam id.</p>
      <InputGroup>
        <InputGroup.Prepend>
          <InputGroup.Text>Steam ID</InputGroup.Text>
        </InputGroup.Prepend>
        <FormControl
          placeholder='Steam URL or ID64'
          value={steamid}
          onChange={handleChange}
          aria-label='Steam URL or ID64'
          onKeyPress={(ev) => (ev.key === 'Enter' ? fetchSteamId() : {})}
          ref={inputRef}
        />
        <InputGroup.Append>
          <button className='app-button' onClick={fetchSteamId}>
            Fetch
          </button>
        </InputGroup.Append>
      </InputGroup>
      {loading && <LoadingIcon />}

      {Object.keys(playerData).length > 0 && <PlayerDataContainer />}

      {error && <p>{error}</p>}
    </PageWrapper>
  );
};

export default connect(mapStateToProps)(SteamId);
