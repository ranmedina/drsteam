import React from 'react';
import './SiteStats.scss';
import { connect } from 'react-redux';
import LoadingIcon from '../layout/LoadingIcon';
import CountUp from 'react-countup';

const mapStateToProps = (state) => state.app.app_data;
const mapDispatchToProps = (dispatch) => ({
  setAppData: (payload) => dispatch({ type: 'SET_APP_DATA', payload }),
});

class SiteStats extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      calculations: 0,
      totalValue: 0,
      totalValueAdd: 0,
      propsUpdated: false,
    };

    this.socket = this.props.socket;

    this.socket.on('inventory total update', ({ before, after, addition, calculations }) => {
      if (Math.round(addition) === 0) {
        return;
      }
      this.setState({
        ...this.state,
        calculations: calculations + 1,
        totalValue: before,
        totalValueAdd: Math.round(addition),
      });
    });
  }

  componentWillUnmount() {
    this.socket.off('inventory total update');
  }

  static getDerivedStateFromProps(props, state) {
    // Incase of state already updated to the right values, no need to do so again
    if (state.propsUpdated) {
      return null;
    }

    return {
      totalValue: props.inventory_totalvalue,
      totalValueAdd: state.totalValueAdd,
      calculations: props.inventory_calculations,
      propsUpdated: props.inventory_totalvalue > 0 ? true : false,
    };
  }

  render() {
    return (
      <div className='sitestats_container'>
        <div className='statistics'>
          {this.state.totalValue === 0 && <LoadingIcon />}
          {this.state.totalValue !== 0 && (
            <React.Fragment>
              <p>
                {this.state.calculations} <span>inventories calculated</span>
              </p>
              <p>
                <CountUp
                  onEnd={() => {
                    console.log('Ended! 👏');
                    this.setState({
                      ...this.state,
                      totalValue: this.state.totalValue + this.state.totalValueAdd,
                      totalValueAdd: 0,
                    });
                  }}
                  onStart={() => console.log('Started! 💨')}
                  start={this.state.totalValue}
                  end={this.state.totalValue + this.state.totalValueAdd}
                  duration={2.75}
                  separator=','
                  decimals={0}
                  decimal=','
                  prefix='$'
                  suffix=''
                >
                  {({ countUpRef }) => (
                    <>
                      <span style={{ color: 'white' }} ref={countUpRef} />
                    </>
                  )}
                </CountUp>{' '}
                <span>total value</span>
              </p>
            </React.Fragment>
          )}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SiteStats);
