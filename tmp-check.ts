import BinarySearchTree from "./util/bst";
import spaceGraph from "./util/separate-vertices";

const values = Array.from({ length: 10 }, (_, i) => i + 1);
const graph = BinarySearchTree().makeGraph(values);
graph.vertices = spaceGraph(graph, 400, 800);
console.log(graph.vertices.map((v) => ({ uuid: v.uuid, x: v.x, y: v.y })));
