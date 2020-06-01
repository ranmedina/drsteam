import React from 'react';
import './SkinListRow.scss';

export default (props) => {
  const { chosenGame, market_hash_name, name, game, name_color, color, rarity, count, price } = props;

  return (
    <tr onClick={() => window.open(`https://steamcommunity.com/market/listings/${chosenGame.appid}/${market_hash_name}`, '_blank')}>
      <td style={{ color: '#' + name_color }}>{name}</td>
      {chosenGame.appid === 753 && <td>{game}</td>}
      <td style={{ color: '#' + color }}>{rarity || '-'}</td>
      <td>{count || '-'}</td>
      <td>{price ? `$${price.toFixed(2)}` : 0}</td>
    </tr>
  );
};
