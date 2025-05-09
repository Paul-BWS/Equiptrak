interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number;
  height?: number;
}

const Image = ({ width, height, ...props }: ImageProps) => {
  return (
    <img
      {...props}
      style={{
        width: width ? `${width}px` : 'auto',
        height: height ? `${height}px` : 'auto',
        ...props.style,
      }}
    />
  );
};

export default Image;