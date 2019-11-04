import React from "react";
import clsx from "clsx";
import { withStyles } from "@material-ui/core/styles";
import TimeFormatter from "../../../utils/TimeFormatter";
import _ from "lodash";
import TableCell from "@material-ui/core/TableCell";
import { AutoSizer, Column, Table } from "react-virtualized";

const styles = theme => ({
  root: {},
  flexContainer: {
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box"
  },
  tableRow: {
    cursor: "pointer"
  },
  tableRowHover: {
    "&:hover": {
      backgroundColor: theme.palette.grey[200]
    }
  },
  tableCell: {
    flex: 1
  },
  noClick: {
    cursor: "initial"
  }
});
class MuiVirtualizedTable extends React.PureComponent {
  static defaultProps = {
    headerHeight: 48,
    rowHeight: 48
  };

  getRowClassName = ({ index }) => {
    const { classes, onRowClick } = this.props;

    return clsx(classes.tableRow, classes.flexContainer, {
      [classes.tableRowHover]: index !== -1 && onRowClick != null
    });
  };

  renderChildsCell = (index, dataKey) => {
    const { data } = this.props;
    if (_.isEmpty(data)) {
      return;
    }
    let value = _.get(data, [index, dataKey]);
    let action = _.get(data, [index, "did"]);
    switch (dataKey) {
      case "timestamp":
        return <TimeFormatter time={value} />;
      case "amount":
        return `You ${action} ${value} ETH`;
      case "txHash":
        let temp = (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://ropsten.etherscan.io/tx/${value}`}
          >
            {_.truncate(value, 20)}
          </a>
        );
        return temp;
      default:
        return value;
    }
  };

  cellRenderer = (dataKey, params) => {
    const { classes, rowHeight, onRowClick } = this.props;
    let keyIndex = params.rowIndex;
    return (
      <TableCell
        component="div"
        className={clsx(classes.tableCell, classes.flexContainer, {
          [classes.noClick]: onRowClick == null
        })}
        variant="body"
        style={{ height: rowHeight }}
        // align={(columnIndex != null && columns[columnIndex].numeric) || false ? 'right' : 'left'}
      >
        {this.renderChildsCell(keyIndex, dataKey)}
      </TableCell>
    );
  };

  headerRenderer = ({ columnIndex, node }) => {
    const { headerHeight, columns, classes } = this.props;
    return (
      <TableCell
        component="div"
        className={clsx(
          classes.tableCell,
          classes.flexContainer,
          classes.noClick
        )}
        variant="head"
        style={{ height: headerHeight }}
        align={columns[columnIndex].numeric || false ? "right" : "left"}
      >
        <span>{node.label}</span>
      </TableCell>
    );
  };

  render() {
    const {
      classes,
      columns,
      rowHeight,
      headerHeight,
      ...tableProps
    } = this.props;
    return (
      <AutoSizer>
        {({ height, width }) => (
          <Table
            height={height}
            width={width}
            key={Math.random()}
            rowHeight={rowHeight}
            headerHeight={headerHeight}
            {...tableProps}
            rowClassName={this.getRowClassName}
          >
            {columns.map((node, index) => {
              return (
                <Column
                  key={index}
                  headerRenderer={headerProps =>
                    this.headerRenderer({
                      ...headerProps,
                      columnIndex: index,
                      node
                    })
                  }
                  width={node.width || "auto"}
                  flexGrow={1}
                  className={classes.flexContainer}
                  cellRenderer={params =>
                    this.cellRenderer(node.dataKey, params)
                  }
                  dataKey={node}
                />
              );
            })}
          </Table>
        )}
      </AutoSizer>
    );
  }
}

MuiVirtualizedTable.propTypes = {};

export default withStyles(styles)(MuiVirtualizedTable);
