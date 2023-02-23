import React from "react";

const ItemsLeftBar = ({ itemsLeft, totalItems }) => {
  const barWidth = (itemsLeft / totalItems) * 100;

  return (
    <div
      style={{
        marginTop: "8px",
        width: "100%",
        height: "5px",
        backgroundColor: "#f1f1f1",
        borderRadius: "5px",
      }}
    >
      <div
        style={{
          width: `${barWidth}%`,
          height: "100%",
          backgroundColor: barWidth < 25 ? "red" : "green",
          borderRadius: "5px",
        }}
      ></div>
      <p style={{ color: "#f0c040", textAlign: "center", fontSize: "11px" }}>
        {itemsLeft === 0
          ? "No items left"
          : itemsLeft === 1
          ? "1 item left"
          : `${itemsLeft} items left`}{" "}
      </p>
    </div>
  );
};

export default ItemsLeftBar;
