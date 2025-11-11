import { View } from "react-native";
import { Graph } from "@/components/app";
import shuffle from "@/util/shuffle";
const values = shuffle(Array.from({ length: 10 }, (_, i) => i + 1));

export default function Index() {
  return (
    <View>
      <Graph values={values} />
    </View>
  );
}
