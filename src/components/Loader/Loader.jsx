import React from "react";

const Loader = ({ title }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 350,
        opacity: 0.5,
      }}
    >
      {title}
      {/* <PulseLoader color="#1976D2" size={10} /> */}
    </div>
  );
};

export default Loader;
