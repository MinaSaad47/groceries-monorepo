const Spinner = ({ text }: { text?: string }) => {
  text = text ?? "Loading...";
  return (
    <div
      className="d-flex justify-content-center align-items-center gap-2"
      style={{ margin: "auto" }}>
      <div></div>
      <div className="spinner-border text-secondary" role="status"></div>
      <span className="sr-only">{text}</span>
    </div>
  );
};

export default Spinner;
