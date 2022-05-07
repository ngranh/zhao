/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-this-alias */
import "./styles.scss";
import * as d3 from "d3";
import { Company, Person, Relation } from "./data";
import { getTransform } from "./utils";

export class Chart {
  readonly mP: Map<string, Person>;
  readonly mC: Map<string, Company>;
  readonly onDefocus: () => void;
  readonly onFocus: (_: Person | Company) => void;
  readonly simulation: d3.Simulation<Person | Company, Relation>;
  sLinks: d3.Selection<SVGGElement, Relation, SVGGElement, unknown>;
  sNodes: d3.Selection<SVGGElement, Person | Company, SVGGElement, unknown>;
  sFocus?: d3.Selection<SVGGElement, Person | Company, SVGGElement, unknown>;

  constructor(
    mP: Map<string, Person>, mC: Map<string, Company>, idFocus: string,
    onDefocus: () => void, onFocus: (_: Person | Company) => void,
  ) {
    this.mP = mP;
    this.mC = mC;
    this.onDefocus = onDefocus;
    this.onFocus = onFocus;
    const self = this;
    const svg = d3.select<SVGSVGElement, unknown>("svg#chart");
    const root = d3.select<SVGGElement, unknown>("svg#chart>g#root");
    /* Initializing links */
    this.sLinks = root.append("g").attr("id", "links").selectAll("g");
    /* Initializing nodes */
    this.sNodes = root.append("g").attr("id", "nodes").selectAll("g");
    /* Initializing simulation */
    this.simulation = d3.forceSimulation<Person | Company>()
      .force("charge", d3.forceManyBody().strength(-2000))
      .force(
        "links", d3.forceLink().id((p: any) => p.id).distance(16 * 6 * 1.5),
      )
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .on("tick", () => {
        this.sLinks.selectChild().attr(
          "d",
          (d: any) =>
            `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`,
        );
        this.sNodes.attr("transform", (d: any) => `translate(${d.x}, ${d.y})`);
      });
    /* Listening to dragging events */
    svg.call(
      d3.drag<SVGSVGElement, unknown>().on("start", () => self.defocus())
        .on("drag", (e) => {
          const { translateX, translateY } = getTransform(
            root.attr("transform"),
          );
          root.attr(
            "transform",
            `translate(${translateX + e.dx}, ${translateY + e.dy})`,
          );
        }),
    );
    /* Focusing */
    this.focusId(idFocus);
  }

  static getComponent(n: Person | Company, limit = 64) {
    const sN = new Set<Person | Company>();
    const sL = new Set<Relation>();
    const queue = new Array<Person | Company>();
    queue.push(n);
    while (queue.length) {
      const pN = queue.shift()!;
      if (sN.has(pN))
        continue;
      sN.add(pN);
      if (sN.size > limit)
        continue;
      pN.relationsIn.forEach((r) => {
        sL.add(r);
        queue.push(r.source);
      });
      pN.relationsOut.forEach((r) => {
        sL.add(r);
        queue.push(r.target);
      });
    }
    return [sN, sL] as const;
  }

  defocus() {
    if (!this.sFocus)
      return;
    const d = this.sFocus.datum();
    delete d.fx;
    delete d.fy;
    this.sFocus.classed("focused", false);
    this.onDefocus();
    this.sFocus = undefined;
  }

  focusId(id: string) {
    const m = new Map<string, Person | Company>([...this.mP, ...this.mC]);
    const n = m.get(id) ?? m.get("習近平")!;
    this.focusNode(n);
  }

  focusNode(n: Person | Company) {
    const self = this;
    const [sN, sL] = Chart.getComponent(n);
    this.defocus();
    /* Updating simulation */
    this.simulation.nodes([...sN]);
    this.simulation.force<d3.ForceLink<Person | Company, Relation>>("links")!
      .links([...sL]);
    this.simulation.alpha(1).restart();
    /* Updating links */
    this.sLinks = this.sLinks
      .data(sL, (l) => `link-${l.source.id}-${l.target.id}`)
      .join((enter) => {
        const g = enter.append("g").attr(
          "class", (n) => n.source instanceof Person ? "link-p" : "link-c"
        );
        g.append("path").attr(
          "id", (l) => `link-${l.source.id}-${l.target.id}`,
        );
        g.append("text").append("textPath")
          .attr("xlink:href", (l) => `#link-${l.source.id}-${l.target.id}`)
          .attr("startOffset", "50%")
          .html((l) => l.relationship);
        return g;
      });
    /* Updating nodes */
    this.sNodes = this.sNodes.data(sN, (n) => n.id).join((enter) => {
      const g = enter.append("g").attr(
        "class", (n) => (n instanceof Person ? "node-p" : "node-c")
      );
      g.append("circle");
      g.append("text").html((p) => p.name);
      return g;
    });
    /* Focusing */
    this.sFocus = this.sNodes.filter((_) => n.id === _.id);
    this.sFocus.classed("focused", true);
    n.fx = n.x;
    n.fy = n.y;
    d3.select("g#root").transition().duration(1000)
      .attr("transform", `translate(${-n.x!}, ${-n.y!})`);
    this.onFocus(n);
    /* Listening to clicking events */
    this.sNodes.on("click", function () {
      self.focusNode(d3.select<SVGGElement, Person | Company>(this).datum());
    });
  }
}
