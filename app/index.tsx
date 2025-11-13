import { Graph } from "@/components/app";
import shuffle from "@/util/shuffle";
import { GestureHandlerRootView } from "react-native-gesture-handler";
const values = shuffle(Array.from({ length: 10 }, (_, i) => i + 1));

export default function Index() {
  return (
    <GestureHandlerRootView>
      <Graph values={values} />
    </GestureHandlerRootView>
  );
}
