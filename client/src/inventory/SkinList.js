import React, { useState, useCallback, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Pagination from '../layout/Pagination';
import SkinListRow from './SkinListRow';
import './SkinList.scss';

export default (props) => {
  const { data, chosenGame } = props;
  const tableHeaders = chosenGame.appid === 753 ? ['name', 'game', 'rarity', 'count', 'price'] : ['name', 'rarity', 'count', 'price'];
  const [skinList, setSkinList] = useState(null);
  const [indexes, setIndexes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortingMethod, setSortingMethod] = useState({
    name: null,
    game: null,
    rarity: null,
    count: null,
    price: null,
  });
  const [lastSorted, setLastSorted] = useState('');

  const sort = useCallback(
    (a, b) => {
      if (lastSorted === 'name' || lastSorted === 'rarity' || lastSorted === 'game') {
        return sortingMethod[lastSorted] === 'desc'
          ? a[lastSorted].localeCompare(b[lastSorted])
          : b[lastSorted].localeCompare(a[lastSorted]);
      } else {
        switch (sortingMethod[lastSorted]) {
          case 'desc':
            return a[lastSorted] - b[lastSorted];
          case 'asce':
            return b[lastSorted] - a[lastSorted];
          default:
            return a.name - b.name;
        }
      }
    },
    [sortingMethod, lastSorted]
  );

  const handleSortClass = (e) => {
    if (lastSorted && lastSorted !== e) {
      return '';
    }
    if (sortingMethod[e]) {
      return sortingMethod[e] === 'asce' ? 'descending' : 'ascending';
    }
  };

  const handlePageChange = (data, start, end) => {
    setSkinList(data);
    setIndexes([start, end]);
  };

  useEffect(() => {
    if (skinList === null) {
      setSkinList(data);
      setLoading(false);
    }
  }, [data, skinList]);

  return (
    <>
      {!loading && (
        <div className='items_list_container'>
          <Table responsive striped bordered hover variant='dark'>
            <thead>
              <tr>
                {tableHeaders.map((e, idx) => (
                  <th
                    key={e}
                    style={{ width: idx ? `${60 / tableHeaders.length}%` : '40%' }}
                    className={handleSortClass(e)}
                    onClick={() => {
                      setSortingMethod({ ...sortingMethod, [e]: sortingMethod[e] === 'desc' ? 'asce' : 'desc' });
                      setLastSorted(e);
                    }}
                  >
                    {e}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data
                .sort((a, b) => sort(a, b))
                .slice(indexes[0], indexes[1])
                .map(({ market_hash_name, name, game, rarity, count, price, name_color, color }, idx) => (
                  <SkinListRow
                    key={name + idx}
                    chosenGame={chosenGame}
                    game={game}
                    market_hash_name={market_hash_name}
                    name={name}
                    rarity={rarity}
                    count={count}
                    price={price}
                    name_color={name_color}
                    color={color}
                  />
                ))}
            </tbody>
          </Table>

          <Pagination data={data} onPageChange={handlePageChange} startPage={1} />
        </div>
      )}
    </>
  );
};
