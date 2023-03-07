import 'rc-slider/assets/index.css';

import { ZoomInIcon, ZoomOutIcon } from '@heroicons/react/outline';
import Cropper from '@lib/image-cropper/Cropper';
import type { Area, Point, Size } from '@lib/image-cropper/types';
import Slider from 'rc-slider';
import type { Dispatch, FC } from 'react';
import { useRef, useState } from 'react';

interface Props {
  size: Size;
  imageSrc: string;
  setCroppedAreaPixels: Dispatch<Area>;
}

const ImageCropper: FC<Props> = ({ size, imageSrc, setCroppedAreaPixels }) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  const cropper = useRef<Cropper>(null);

  const onSliderChange = (value: number | number[]) => {
    const logarithmicZoomValue = Array.isArray(value) ? value[0] : value;
    const zoomValue = Math.exp(logarithmicZoomValue);
    setZoom(zoomValue);
    cropper.current?.setNewZoom(zoomValue, null);
  };

  const borderSize = 20;

  return (
    <>
      <Cropper
        ref={cropper}
        image={imageSrc}
        cropSize={size}
        borderSize={borderSize}
        cropPosition={crop}
        zoom={zoom}
        zoomSpeed={1.2}
        onCropChange={setCrop}
        onCropComplete={setCroppedAreaPixels}
        onZoomChange={(zoomValue, maxZoomValue) => {
          setZoom(zoomValue);
          setMaxZoom(maxZoomValue);
        }}
      />
      <div className="flex pt-2 pb-2" style={{ width: size.width + borderSize * 2 }}>
        <ZoomOutIcon className="m-1 h-6 w-6" />
        <Slider
          className="m-2"
          min={0}
          max={Math.log(maxZoom)}
          step={0.001}
          onChange={onSliderChange}
          value={Math.log(zoom)}
        />
        <ZoomInIcon className="m-1 h-6 w-6" />
      </div>
    </>
  );
};

export default ImageCropper;
