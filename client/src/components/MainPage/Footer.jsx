import React from "react";
import Typography from "@material-ui/core/Typography";

function MaterialFooter({ color = "textSecondary" }) {
  return (
    <footer>
      <Typography variant="body2" color={color} align="center">
        Blockchain-based Crowdfunding Platform
      </Typography>
    </footer>
  );
}

export default MaterialFooter;
