import * as d3 from "d3";

const width = document.body.clientWidth;
const height = document.body.clientHeight;

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
  const links = [];
  traverse(node, (n) => {
    if (n.left !== null) {
      links.push({ source: n.id, target: n.left.id });
    }
    if (n.right !== null) {
      links.push({ source: n.id, target: n.right.id });
    }
  });
  return links;
};

const makeGraph = (values) => {
  const root = bst(values);
  const nodes = [];
  traverse(root, (n) => nodes.push(n));
  const links = makeLinks(root);
  return { nodes, links };
};

const values = Array.from({ length: 13 }, (_, i) => i);
const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
const graph = makeGraph(shuffle(values));

function clamp(x, lo, hi) {
  return x < lo ? lo : x > hi ? hi : x;
}

export function setupApp() {
  const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]),
    link = svg
      .selectAll(".link")
      .data(graph.links)
      .join("line")
      .classed("link", true),
    node = svg
      .selectAll(".node")
      .data(graph.nodes)
      .join((enter) => {
        const g = enter.append("g").attr("class", "node");
        g.append("circle").attr("r", 20);
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .text((d) => d.value ?? "");
        return g;
      })
      .classed("red", (d) => d.red);

  const simulation = d3
    .forceSimulation()
    .nodes(graph.nodes)
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force(
      "link",
      d3
        .forceLink(graph.links)
        .id((d) => d.id)
        .distance(50),
    )
    .stop();
  for (let i = 0; i < 300; i++) simulation.tick();
  tick();

  const drag = d3.drag().on("start", dragstart).on("drag", dragged);

  node
    .call(drag)
    .on("click", toggleRed)
    .on("mouseover", hover)
    .on("mouseout", unhover);

  function tick() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);
    node.attr("transform", (d) => `translate(${d.x},${d.y})`);
  }

  function toggleRed(_, d) {
    d.red = !d.red;
    d3.select(this).classed("red", (d) => d.red);
  }

  function hover(_, d) {
    d3.select(this).classed("hover", true);
  }

  function unhover(_, d) {
    d3.select(this).classed("hover", false);
  }

  function dragstart() {
    return;
  }

  function dragged(event, d) {
    d.x = clamp(event.x, 0, width);
    d.y = clamp(event.y, 0, height);
    tick();
  }
  return svg.node();
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
