import React from 'react';
import './SkinGridItem.scss';

export default (props) => {
  const { chosenGame, market_hash_name, title, color, image, price, exterior } = props;

  return (
    <div
      className='item__box'
      style={{ borderBottom: `4px solid #${color}` }}
      onClick={() => window.open(`https://steamcommunity.com/market/listings/${chosenGame.appid}/${market_hash_name}`, '_blank')}
    >
      <div className='price'>
        <p>{`$${price}`}</p>
      </div>
      <div className='image'>
        <img alt={title} src={'https://steamcommunity-a.akamaihd.net/economy/image/' + image} />
      </div>
      <div className='exterior'>
        <p>{exterior}</p>
      </div>
    </div>
  );
};
