import { G, Circle, Text as SvgText } from "react-native-svg";
import Animated, { useAnimatedProps } from "react-native-reanimated";

const baseRadius = 24;

type Props = {
  value: number;
  x: number;
  y: number;
  backgroundColor?: string;
  color?: string;
};

export default function Vertex({
  x,
  y,
  value,
  backgroundColor = "black",
  color = "white",
}: Props) {
  const animatedProps = useAnimatedProps(() => {
    return { transform: `translate(${x}, ${y})` };
  });
  const AnimatedG = Animated.createAnimatedComponent(G);
  return (
    <AnimatedG animatedProps={animatedProps}>
      <Circle r={baseRadius + value} fill={backgroundColor} />
      <SvgText
        textAnchor="middle"
        alignmentBaseline="central"
        fontSize={24}
        fill={color}
        fontFamily="sans-serif"
      >
        {value}
      </SvgText>
    </AnimatedG>
  );
}
