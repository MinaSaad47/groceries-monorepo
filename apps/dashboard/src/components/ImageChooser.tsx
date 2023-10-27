import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { Constants } from "../constants";

type Props = {
  src?: string;
  alt?: string;
  onChange?: (image: File) => void;
};

const ImageChooser = ({ src, alt, onChange }: Props) => {
  const [hover, setHover] = useState(false);

  const [image, setImage] = useState(src ?? "/assets/500.png");
  useEffect(() => {
    setImage(src ?? Constants.fallbackImage);
  }, [src]);

  const handleOnChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      setImage(reader.result as string);
      onChange?.(file);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <input
        id="image"
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleOnChange}
      />
      <label htmlFor="image">
        <div
          role="button"
          style={{ position: "relative" }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}>
          <img
            className="img-fluid rounded-start w-100 h-100"
            style={{ opacity: hover ? 0.5 : 1 }}
            src={image}
            alt={alt}
          />
          {hover && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}>
              <FaEdit size={100} />
            </div>
          )}
        </div>
      </label>
    </>
  );
};

export default ImageChooser;
