import { forceSimulation, forceLink, forceManyBody, forceCenter } from "d3";
import BST from "./bst";
import useWindowSize from "@/hooks/use-window-size";

const bst = BST();

const baseRadius = 24;

type Props = {
  values: number[];
};

export function Graph({ values }: Props) {
  const { width, height } = useWindowSize();
  const graph = useMemo(() => {
    let { nodes, links } = bst.makeGraph(values);
    const sim = forceSimulation(nodes as any)
      .force(
        "link",
        forceLink(links as any)
          .id((d: any) => d.id)
          .distance(80),
      )
      .force("charge", forceManyBody().strength(-120))
      .force("center", forceCenter(width / 2, height / 2))
      .stop();

    for (let i = 0; i < 300; i++) sim.tick();
    return { nodes, links };
  }, []);
  const [nodes, setNodes] = useState(graph.nodes);
  const [links, setLinks] = useState(graph.links);
  return (
      <group>
            {/* Links */}
            {links.map(({ id, source, target }) => {
              const s = nodes.find(
                (n) => n.id === source.id || n.id === source,
              );
              const t = nodes.find(
                (n) => n.id === target.id || n.id === target,
              );
              if (!s || !t) return null;
              return (
                <Line
                  key={id}
                  x1={s.x!}
                  y1={s.y!}
                  x2={t.x!}
                  y2={t.y!}
                  stroke="#999"
                  strokeOpacity={0.7}
                  strokeWidth={4}
                />
              );
            })}
            {/* Nodes */}
            {nodes.map(({ id, x, y, value }) => (
              <Vertex key={id} x={x!} y={y!} value={value} />
            ))}
          </G>
        </Svg>
      </View>
    </group>
  );
}

const styles = StyleSheet.create({
  hitbox: {
    position: "absolute",
    height: 120,
    width: 120,
    backgroundColor: "#b58df1",
    borderRadius: 20,
    marginBottom: 30,
  },
});

type Point = Required<{ x: number; y: number }>;

function distance(a: Point, b: Point) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
