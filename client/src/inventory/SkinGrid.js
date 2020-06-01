import React from 'react';
import './SkinGrid.scss';
import SkinGridItem from './SkinGridItem';

export default (props) => {
  return (
    <div className='items_grid_container'>
      {props.data.map(({name, icon_url, market_hash_name, color, price, exterior, game}, idx) => (
        <SkinGridItem
          key={name + idx}
          chosenGame={props.chosenGame}
          title={name}
          image={icon_url}
          market_hash_name={market_hash_name}
          color={color}
          price={price}
          exterior={exterior ? exterior : game}
        />
      ))}
    </div>
  );
};
