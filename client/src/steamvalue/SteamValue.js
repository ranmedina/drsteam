import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import PageWrapper from '../layout/PageWrapper';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Table from 'react-bootstrap/Table';
import { Helmet } from 'react-helmet';
import userApi from '../api/user';
import LoadingIcon from '../layout/LoadingIcon';
import Pagination from '../layout/Pagination';
import './SteamValue.scss';

const mapStateToProps = (state) => ({
  app: state.app,
  user: state.user,
});

const SteamValue = (props) => {
  const [steamid, setSteamid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameList, setGameList] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [total, setTotal] = useState(0);
  const inputRef = useRef();
  const tableHeaders = ['#', 'Game', 'AppID', 'Price'];

  const fetchSteamId = async () => {
    setLoading(true);
    try {
      const { data } = await userApi.getGamesWorth(steamid);
      setGameList(data.data.games);
      setTotal(data.data.total);
    } catch ({ response: { data } }) {
      setError(data.description);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setSteamid(e.target.value);
    localStorage.setItem('steamid', e.target.value);
  };

  useEffect(() => {
    if (props.user.steamid) {
      setSteamid(props.user.steamid);
    } else if (localStorage.getItem('steamid')) {
      setSteamid(localStorage.getItem('steamid'));
    }
    inputRef.current.focus();
  }, [props.user.steamid]);

  const handlePageChange = (data) => setDisplayed(data);

  return (
    <PageWrapper>
      <Helmet>
        <title>Dr.Steam | Steam Value</title>
        <meta
          name='description'
          content='How much is your Steam account worth? Steam Value values your steam account by calculating all of your games price.'
        ></meta>
      </Helmet>

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

      {error && <p>{error}</p>}

      {!loading && total > 0 && (
        <div className='account_container'>
          <h2>Your account is valued at ${Number(total.toFixed()).toLocaleString('en')}</h2>
          <p className='total'>Total of {Number(gameList.length).toLocaleString('en')} games</p>
          <Table responsive striped bordered hover variant='dark'>
            <thead>
              <tr>
                {tableHeaders.map((e, _idx) => (
                  <th key={e}>{e}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map(({ appid, name, price }, idx) => (
                <tr key={appid}>
                  <td>{idx + 1}</td>
                  <td>
                    <span onClick={() => window.open(`https://store.steampowered.com/app/${appid}/`, '_blank')}>{name}</span>
                  </td>
                  <td>{appid}</td>
                  <td>{price === 0 ? 'Free' : '$' + price}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination data={gameList} onPageChange={handlePageChange} startPage={1} pageSize={15} />
        </div>
      )}
    </PageWrapper>
  );
};

export default connect(mapStateToProps)(SteamValue);
