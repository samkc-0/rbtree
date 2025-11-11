export default function BST() {
  const uuid = Uuid();
  const newNode = (value) => {
    return {
      id: uuid.gen(),
      value,
      left: null,
      right: null,
      red: false,
    };
  };

  const bst = (arr) => {
    const root = newNode(arr[0]);
    for (let i = 1; i < arr.length; i++) {
      insert(root, arr[i]);
    }
    return root;
  };

  const insert = (node, value) => {
    if (value < node.value) {
      if (node.left === null) {
        node.left = newNode(value);
      } else {
        insert(node.left, value);
      }
      return;
    }
    if (value > node.value) {
      if (node.right === null) {
        node.right = newNode(value);
      } else {
        insert(node.right, value);
      }
    }
    // ignore duplicates
    return;
  };

  const traverse = (node, callback) => {
    if (!node) return;
    node && callback && callback(node);
    if (node.left != null) {
      traverse(node.left, callback);
    }
    if (node.right != null) {
      traverse(node.right, callback);
    }
  };

  const makeLinks = (node) => {
    let links = [];
    traverse(node, (n) => {
      if (n.left !== null) {
        links.push({ id: uuid.gen(), source: n.id, target: n.left.id });
      }
      if (n.right !== null) {
        links.push({ id: uuid.gen(), source: n.id, target: n.right.id });
      }
    });
    return links;
  };

  const makeGraph = (values) => {
    const root = bst(values);
    const nodes = [];
    traverse(root, (n) => nodes.push(n));
    let links = makeLinks(root);
    return { nodes, links };
  };

  return { makeGraph, uuid };
}

function Uuid() {
  const existing = new Set();
  const gen = () => {
    let val;
    let tries = 0;
    do {
      val = Math.floor(Math.random() * 10000);
      tries++;
      if (tries > 1000) {
        throw new Error("Could not generate unique id");
      }
    } while (existing.has(val) && tries < 1000);

    existing.add(val);
    return val;
  };
  return { gen };
}
