import React, { useState, useEffect } from 'react';
import userApi from '../../api/user';
import Pagination from '../../layout/Pagination';
import Table from 'react-bootstrap/Table';
import PageWrapper from '../../layout/PageWrapper';
import './Users.scss';

export default () => {
  const [userList, setUserList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [indexes, setIndexes] = useState([]);
  const [busy, setBusy] = useState(false);
  const tableHeaders = ['#', 'Username', 'Steam ID', 'Last Visit', 'Actions'];

  useEffect(() => {
    let isCancelled = false;
    const getUsers = async () => {
      const { data } = (await userApi.getAllUsers()).data;
      if (!isCancelled && userList === null) {
        setUserList(data.users);
        setLoading(false);
      }
    };

    getUsers();

    return () => (isCancelled = true);
  }, [userList]);

  const handlePageChange = (data, start, end) => {
    setUserList(data);
    setIndexes([start, end]);
  };

  const banUser = async (steamid, value) => {
    if (busy) {
      return;
    }
    try {
      setBusy(true);
      await userApi.banUser(steamid, value);
      const index = userList.findIndex((e) => e.steamid === steamid);
      if (index !== -1) {
        let items = [...userList];
        items[index].banned = !items[index].banned;
        setUserList(items);
      } else {
        window.location.reload();
      }
    } catch ({ reponse: data }) {
      console.error('banUser failed', data);
    } finally {
      setBusy(false);
    }
  };

  const setAdmin = async (steamid, value) => {
    if (busy) {
      return;
    }
    try {
      setBusy(true);
      await userApi.setAdmin(steamid, value);
      const index = userList.findIndex((e) => e.steamid === steamid);
      if (index !== -1) {
        let items = [...userList];
        items[index].admin = !items[index].admin;
        setUserList(items);
      } else {
        window.location.reload();
      }
    } catch ({ reponse: data }) {
      console.log('setAdmin faied', data);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageWrapper>
      {!loading && (
        <React.Fragment>
          <Table responsive striped bordered hover variant='dark'>
            <thead>
              <tr>
                {tableHeaders.map((e, _idx) => (
                  <th key={e}>{e}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {userList.slice(indexes[0], indexes[1]).map(({ username, steamid, last_visit, banned, admin }, idx) => (
                <tr key={steamid + last_visit + idx}>
                  <td>{idx + 1}</td>
                  <td>{username}</td>
                  <td>{steamid}</td>
                  <td>{last_visit}</td>
                  <td>
                    <span onClick={() => banUser(steamid, !banned)}>{banned ? 'Unban' : 'Ban'}</span> |{' '}
                    <span onClick={() => setAdmin(steamid, !admin)}>{admin ? 'Unset admin' : 'Set admin'}</span> |{' '}
                    <span onClick={() => window.open(`https://steamcommunity.com/profiles/${steamid}`, '_blank')}>Steam Profile</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination data={userList} onPageChange={handlePageChange} startPage={1} />
        </React.Fragment>
      )}
    </PageWrapper>
  );
};
