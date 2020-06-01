import React from 'react';
import './FloatBar.scss';

export default (props) => {
  const { float } = props;

  const floats = [
    ['fn', 0.0, 0.07],
    ['mw', 0.07, 0.15],
    ['ft', 0.15, 0.38],
    ['ww', 0.38, 0.45],
    ['bs', 0.45, 1.0],
  ];

  return (
    <div className='float_chart'>
      <span className='float_pointer' style={{ left: `calc(${float * 100}% - 1px)` }}></span>
      {floats.map((e) => {
        return (
          <React.Fragment key={e[0]}>
            <span className='float_divider'>{e[1].toFixed(2)}</span>
            <div className={e[0]}>{e[0]}</div>
          </React.Fragment>
        );
      })}
      <span className='float_divider'>1.00</span>
    </div>
  );
};
