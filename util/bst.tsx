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
    traverse(root, (n) => {
      const v = nodeToVertex(n);
      vertices.push(v);
    });

    const edges: EdgeType[] = [];
    traverse(root, (n) => {
      const source = vertices.find((v) => v.uuid === n.uuid)!;
      if (n.left !== undefined) {
        const target = vertices.find((v) => v.uuid === n.left!.uuid)!;
        edges.push({ uuid: randomUUID(), source, target });
      }
      if (n.right !== undefined) {
        const target = vertices.find((v) => v.uuid === n.right!.uuid)!;
        edges.push({ uuid: randomUUID(), source, target });
      }
    });

    return { vertices, edges };
  };

  return { makeGraph };
}
