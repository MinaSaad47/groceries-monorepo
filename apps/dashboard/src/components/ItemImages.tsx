const ItemImages = ({ item }: { item: any }) => {
  const images = [item.thumbnail, ...item.images];

  const renderIndicators = images.map((_, index) => {
    return (
      <button
        type="button"
        key={index}
        data-bs-target="#carouselExampleIndicators"
        data-bs-slide-to={index}
        className={index === 0 ? "active" : ""}
        aria-current={index === 0 ? "true" : "false"}
        aria-label={`Slide ${index + 1}`}></button>
    );
  });

  const renderImages = images.map((image, index) => {
    return (
      <div
        className={`carousel-item ${index === 0 ? "active" : ""}`}
        key={index}>
        <img
          src={image}
          className="d-block w-100"
          style={{ height: "400px" }}
          alt="item image"
        />
      </div>
    );
  });

  return (
    <div id="carouselExampleIndicators" className="carousel slide" style={{marginLeft: "10%", marginRight: "10%"}}>
      <div className="carousel-indicators">{renderIndicators}</div>
      <div className="carousel-inner">{renderImages}</div>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleIndicators"
        data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleIndicators"
        data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default ItemImages;
