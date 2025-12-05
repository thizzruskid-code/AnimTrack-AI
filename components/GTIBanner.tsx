import React from "react";
import gtiLogo from "../gti.png"; // ensure your file is named gti.png in /src

export default function GTIBanner() {
  return (
    <div className="gti-banner">
      <img src={gtiLogo} alt="GTI Studios" className="gti-logo" />
    </div>
  );
}
