const TextRow = ({ title, text, style, onClick, copy}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "10px",
        width: "100%",
        background: "#00ccff",
        boxSizing: "border-box",
        color: "white",
        borderRadius: "15px",
        fontWeight: "600",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
      onClick={onClick}
    >
      <div style={{ fontSize: "0.8rem" }}>{title}</div>
      <div style={{ fontSize: "1rem", overflowWrap: "break-word" }}>{text}</div>
      {copy && <div style={{ fontSize: "0.8rem", overflowWrap: "break-word", paddingTop:"10px" }}>Click to copy URL</div>}

    </div>
  );
};

export default TextRow;
