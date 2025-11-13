/// <reference types="@react-three/fiber" />
import { Object3DNode } from "@react-three/fiber";
import * as THREE from "three";

declare module "@react-three/fiber" {
  interface ThreeElements {
    group: Object3DNode<THREE.Group, typeof THREE.Group>;
    directionalLight: Object3DNode<
      THREE.DirectionalLight,
      typeof THREE.DirectionalLight
    >;
    // add more if needed
  }
}
