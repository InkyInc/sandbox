import { jsx as _jsx } from "react/jsx-runtime";
import * as BABYLON from '@babylonjs/core';
import { Component } from 'react';


var __rest = (this && this.__rest) || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};

export default class BabylonScene extends Component {
  constructor() {
    // private scene: BABYLON.Scene;
    // private engine: BABYLON.Engine;
    // private canvas: HTMLCanvasElement;
    super(...arguments);
    this.onResizeWindow = () => {
      if (this.engine) {
        this.engine.resize();
        this.forceUpdate();
      }
    };
    this.onCanvasLoaded = (c) => {
      if (c !== null) {
        this.canvas = c;
      }
    };
  }
  componentDidMount() {
    this.engine = new BABYLON.Engine(this.canvas, true, this.props.engineOptions, this.props.adaptToDeviceRatio);
    let scene = new BABYLON.Scene(this.engine);
    this.scene = scene;
    if (typeof this.props.onSceneMount === 'function') {
      this.props.onSceneMount({
        scene,
        engine: this.engine,
        canvas: this.canvas
      });
    }
    else {
      console.error('onSceneMount function not available');
    }
    // Resize the babylon engine when the window is resized
    window.addEventListener('resize', this.onResizeWindow);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.onResizeWindow);
  }
  render() {
    // 'rest' can contain additional properties that you can flow through to canvas:
    // (id, className, etc.)
    const _a = this.props, { width, height } = _a, rest = __rest(_a, ["width", "height"]);
    const opts = {};
    if (width !== undefined && height !== undefined) {
      opts.width = width;
      opts.height = height;
    }
    else {
      opts.width = window.innerWidth;
      opts.height = window.innerHeight;
    }
    return (_jsx("canvas", Object.assign({}, opts, { ref: this.onCanvasLoaded }), void 0));
  }
}