import React, { Component } from 'react';
import { Pagination } from 'react-bootstrap';

class Paginator extends Component {
    static defaultProps = {
        limit: 4,
        numberOfItem: 0,
        callback: () => { }
    }
    state = {
        current: 1,
    }

    
    handlePage = (e) => {
        const current = parseInt(e.target.id);
        this.props.callback(current);
        this.setState({ current })
    };

    render() {
        const { current } = this.state;
        const { limit, numberOfItem } = this.props;
        const totalPages = Math.ceil(numberOfItem / limit);
        //page.lastIndex = page.current * page.limit;
        //page.firstIndex = page.lastIndex - page.limit;
        const isFirstButton = (current >= 5 && totalPages >= 5);
        const isLastButton = (totalPages - current > 4)
        const start = isFirstButton ? current - 2 : 1;
        let numPageDisp = totalPages - start + 1;
        numPageDisp = numPageDisp >= 5 ? 5 : numPageDisp;
        if (numPageDisp + start === totalPages) {
            numPageDisp += 1;
        }
        let list = [];
        for (let i = start; i < start + numPageDisp; i++) {
            list.push(<Pagination.Item
                key={i}
                id={i}
                active={current === i}
                onClick={this.handlePage}
            >{i}</Pagination.Item>);
        }

        return totalPages > 1 && (
            <Pagination>
                {isFirstButton ?
                    <Pagination.Item
                        id={1}
                        onClick={this.handlePage}>First</Pagination.Item> : ''}
                {isFirstButton ?
                    <Pagination.Ellipsis disabled /> : ''}
                {list}
                {isLastButton ?
                    <Pagination.Ellipsis disabled /> : ''}
                {isLastButton ?
                    <Pagination.Item
                        id={totalPages}
                        onClick={this.handlePage}>Last</Pagination.Item> : ''}
            </Pagination>
        );
    }

}
// export default Paginator;
