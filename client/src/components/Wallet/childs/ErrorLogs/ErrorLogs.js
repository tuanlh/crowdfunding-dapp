import React, { Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import _ from 'lodash'

import MuiVirtualizedTable from './MuiVirtualizedTable'

const styles = theme => ({
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  root: {
    marginTop: theme.spacing(3),
  },
  tableRow: {
    // cursor: 'pointer',
  },
  tableRowHover: {
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
  tableCell: {
    flex: 1,
  },
  noClick: {
    // cursor: 'initial',
  },
});

const VirtualizedTable = withStyles(styles)(MuiVirtualizedTable);

class ErrorLogs extends React.Component {
  render() {
    const { logs } = this.props
    let data = {...logs}
    data = _.orderBy(data, ['timestamp'], 'desc')
    return (
      <Fragment>
        {
          <Paper style={{ height: 400, width: '100%' }}>
            <VirtualizedTable
              rowCount={data.length}
              data={data}
              rowGetter={({ index }) => data[index]}
              columns={[
                {
                  width: 220,
                  label: 'ID',
                  dataKey: 'id',
                },
                {
                  width: 50,
                  label: 'Date and Time',
                  dataKey: 'timestamp',
                },
                {
                  width: 50,
                  label: 'Message',
                  dataKey: 'amount',
                },
                {
                  width: 220,
                  label: 'txHash',
                  dataKey: 'txHash',
                },
              ]}
            />
          </Paper>
        }
      </Fragment>
    )
  };
}

ErrorLogs.propTypes = {
};

export default ErrorLogs

