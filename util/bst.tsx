import { randomUUID } from "expo-crypto";
import type { VertexType, EdgeType } from "@/types/graph";

type Node = {
  uuid: string;
  value: number;
  left?: Node;
  right?: Node;
};

type BSTModule = {
  makeGraph: (values: number[]) => {
    vertices: VertexType[];
    edges: EdgeType[];
  };
};

export default function BinarySearchTree(): BSTModule {
  const makeNode = (value: number) => {
    return {
      uuid: randomUUID(),
      value,
      left: undefined,
      right: undefined,
    };
  };

  const fromArray = (nums: number[]): Node => {
    const root = makeNode(nums[0]);
    for (let i = 1; i < nums.length; i++) {
      insert(root, nums[i]);
    }
    return root;
  };

  const insert = (node: Node, value: number) => {
    if (value < node.value) {
      if (node.left === undefined) {
        node.left = makeNode(value);
      } else {
        insert(node.left, value);
      }
      return;
    }
    if (value > node.value) {
      if (node.right === undefined) {
        node.right = makeNode(value);
      } else {
        insert(node.right, value);
      }
    }
    // ignore duplicates
    return;
  };

  const traverse = (node: Node, callback: (n: Node) => void) => {
    if (!node) return;
    node && callback && callback(node);
    if (node.left != undefined) {
      traverse(node.left, callback);
    }
    if (node.right != undefined) {
      traverse(node.right, callback);
    }
  };

  const nodeToVertex = (node: Node): VertexType => {
    return {
      uuid: node.uuid,
      value: node.value,
      x: 0,
      y: 0,
      z: 0,
    };
  };

  const makeGraph = (
    values: number[],
  ): { vertices: VertexType[]; edges: EdgeType[] } => {
    const root = fromArray(values);
    const vertices: VertexType[] = [];
    const edges: EdgeType[] = [];
    // TODO: edges is just a hashmap of node uuid to left uuid & right uuid

    traverse(root, (n) => {
      const v = nodeToVertex(n);
      vertices.push(v);
      if (n.left !== undefined) {
        edges.push({
          uuid: randomUUID(),
          source: n.uuid,
          target: n.left!.uuid,
        });
      }
      if (n.right !== undefined) {
        edges.push({
          uuid: randomUUID(),
          source: n.uuid,
          target: n.right!.uuid,
        });
      }
    });

    return { vertices, edges };
  };

  return { makeGraph };
}
