import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import MenuItem from './MenuItem';
import './Menu.scss';

const mapStateToProps = (state) => state.app;

const Menu = (props) => {
  const [disabledPages, setDisabledPages] = useState([]);

  useEffect(() => {
    setDisabledPages(Object.keys(props.pages).filter((e) => props.pages[e] === false));
  }, [props.pages]);

  return (
    <div className='menu'>
      <MenuItem
        description='Convert your Steam ID/URL to ID32, ID64 and ID3'
        url='/steamid'
        disabled={disabledPages.includes('steamid')}
      >
        Steam ID
      </MenuItem>
      <MenuItem description='Check the value of your Steam, CS:GO and Dota 2 inventory' url='/inventory' disabled={disabledPages.includes('inventory')}>
        Inventory
      </MenuItem>
      <MenuItem description={`Check specific CS:GO's skin float wear value`} url='/floater' disabled={disabledPages.includes('floater')}>
        Floater
      </MenuItem>
      <MenuItem
        description='Values your steam account by calculating your games prices'
        url='/steamvalue'
        disabled={disabledPages.includes('steamvalue')}
      >
        Steam Value
      </MenuItem>
    </div>
  );
};

export default connect(mapStateToProps)(Menu);
