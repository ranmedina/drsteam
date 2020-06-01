import React, { forwardRef } from 'react';
import { connect } from 'react-redux';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import './GameList.scss';

const mapStateToProps = (state) => ({
  ...state.app,
});

const GameList = (props) => {
  const RenderTooltip = forwardRef((options, ref) => {
    return (
      <Tooltip ref={ref} id='button-tooltip' {...options}>
        {options.name}
      </Tooltip>
    );
  });

  return (
    <div className='gamelist'>
      {props.gameList.map(({ name, appid, short_name, image }, idx) => (
        <div key={short_name} className={`image ${props.chosenGame.appid === appid ? 'chosen' : ''}`}>
          <OverlayTrigger placement='bottom' delay={{ show: 50, hide: 50 }} overlay={<RenderTooltip name={name} />}>
            <img alt={name} src={image} onClick={() => props.onGameChange(appid)} />
          </OverlayTrigger>
        </div>
      ))}
    </div>
  );
};

export default connect(mapStateToProps, null)(GameList);
