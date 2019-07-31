//import React from 'react';
const TimeFormatter = (props) => {
    return new Date(props.time).toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
}

export default TimeFormatter;