import { useState, useEffect } from "react";
import { Dimensions } from "react-native";

export function useWindowSize() {
  const [size, setSize] = useState(Dimensions.get("window"));
  useEffect(() => {
    const onChange = ({ window }: any) => {
      setSize(window);
    };
    const sub = Dimensions.addEventListener("change", onChange);
    return () => sub?.remove();
  }, []);
  return size;
}
