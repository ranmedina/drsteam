import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import UserApi from '../api/user';
import SkinList from './SkinList';
import SkinGrid from './SkinGrid';
import GameList from './GameList';
import ListIcon from '../assets/list.png';
import GridIcon from '../assets/grid.png';
import './Inventory.scss';
import LoadingIcon from '../layout/LoadingIcon';
import PageWrapper from '../layout/PageWrapper';
import '../layout/globalStyles.scss';
import { Helmet } from 'react-helmet';

const mapStateToProps = (state) => ({
  app: state.app,
  user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
  setLoading: (payload) => dispatch({ type: 'SET_LOADING', payload }),
});

const Inventory = (props) => {
  const { socket } = props;
  const [steamid, setSteamid] = useState('');
  const [lastSearch, setLastSearch] = useState('');
  const [inventory, setInventory] = useState({
    items: [],
    items_count: 0,
    total: 0,
  });
  const [error, setError] = useState();
  const [sort, changeSort] = useState('list');
  const [loading, setLoading] = useState(false);
  const [chosenGame, setChosenGame] = useState({
    appid: 753,
    name: 'Steam',
  }); // Steam as default
  const inputRef = useRef();

  useEffect(() => {
    if (props.user.steamid) {
      setSteamid(props.user.steamid);
    } else if (localStorage.getItem('steamid')) {
      setSteamid(localStorage.getItem('steamid'));
    }
    inputRef.current.focus();
  }, [props.user.steamid]);

  const fetchInventory = async () => {
    if (loading || ((Object.keys(inventory.items).length || !steamid) && steamid === lastSearch)) {
      return;
    }

    if (steamid.length <= 1) {
      setError('Steam ID/URL must be over 1 character');
      return;
    }

    setInventory({
      items: [],
      items_count: 0,
      total: 0,
    });

    try {
      setLoading(true);
      const { data } = await UserApi.getInventory(steamid, chosenGame.appid);
      setInventory({ items: data.inventory, items_count: data.items_count, total: data.total });
      setError();
      setLastSearch(steamid);
      socket.emit('inventory calculation', {
        total: data.total,
      });
    } catch ({ response: { data } }) {
      console.error('Fetching inventory failed', data);
      setError(data.description);
      setInventory({ items: [], total: 0, items_count: -1 });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSteamid(e.target.value);
    localStorage.setItem('steamid', e.target.value);
  };

  const handleGameChange = (appid) => {
    if (loading || appid === chosenGame.appid) {
      return;
    }

    setInventory({
      items: [],
      total: 0,
    });
    setError(null);
    setChosenGame({
      appid,
      name: props.app.gameList[props.app.gameList.findIndex((e) => e.appid === appid)].name,
    });
  };

  const InventoryContainer = () => {
    return (
      <div className='inventory__container'>
        <div className='view__options'>
          <ButtonGroup aria-label='Sort Button Group'>
            <Button
              variant='secondary'
              active={sort === 'list'}
              onClick={() => (Object.keys(inventory.items).length > 0 ? changeSort('list') : {})}
            >
              <img src={ListIcon} alt='list' />
            </Button>
            <Button
              variant='secondary'
              active={sort === 'grid'}
              onClick={() => (Object.keys(inventory.items).length > 0 ? changeSort('grid') : {})}
            >
              <img src={GridIcon} alt='grid' />
            </Button>
          </ButtonGroup>
        </div>

        <p>
          <b>Total:</b> ${Number(inventory.total).toLocaleString('en')} ({inventory.items_count} items)
        </p>

        <div>
          {sort === 'grid' ? (
            <SkinGrid data={inventory.items} chosenGame={chosenGame} />
          ) : (
            <SkinList data={inventory.items} chosenGame={chosenGame} />
          )}
        </div>
      </div>
    );
  };

  return (
    <PageWrapper>
      <Helmet>
        <title>Dr.Steam | Inventory</title>
        <meta
          name='description'
          content="Check your games inventory value. Enter your steam id to reveal your CSGO, Dota 2 and Steam's inventory worth."
        ></meta>
      </Helmet>

      {props.app.gameList.length && <GameList chosenGame={chosenGame} onGameChange={handleGameChange} />}

      <InputGroup>
        <InputGroup.Prepend>
          <InputGroup.Text>Steam ID</InputGroup.Text>
        </InputGroup.Prepend>
        <FormControl
          placeholder='Steam URL or ID64'
          value={steamid}
          onChange={handleChange}
          aria-label='Steam URL or ID64'
          onKeyPress={(ev) => (ev.key === 'Enter' ? fetchInventory() : {})}
          ref={inputRef}
        />
        <InputGroup.Append>
          <button className='app-button' onClick={fetchInventory}>
            Fetch
          </button>
        </InputGroup.Append>
      </InputGroup>

      {loading && <LoadingIcon />}
      {!loading && error && <p>{error}</p>}

      {inventory.total === -1 && (
        <p>
          Oops! your <b>{props.app.gameList[props.app.gameList.findIndex(({ appid }) => appid === chosenGame.appid)].name}</b>{' '}
          inventory seems empty.
        </p>
      )}

      {Object.keys(inventory.items).length > 0 && inventory.total !== -1 && <InventoryContainer />}
    </PageWrapper>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Inventory);
