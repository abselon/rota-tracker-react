declare module 'react-color' {
  import { Component } from 'react';

  interface Color {
    hex: string;
    rgb: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
    hsl: {
      h: number;
      s: number;
      l: number;
      a: number;
    };
  }

  interface SketchPickerProps {
    color?: string | Color;
    onChange?: (color: Color) => void;
    onChangeComplete?: (color: Color) => void;
    presetColors?: string[];
    width?: string | number;
    disableAlpha?: boolean;
    className?: string;
    styles?: Record<string, any>;
  }

  export class SketchPicker extends Component<SketchPickerProps> {}
}
