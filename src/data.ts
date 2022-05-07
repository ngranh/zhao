/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

export class Person implements d3.SimulationNodeDatum {
  index?: number; x?: number; y?: number; fx?: number; fy?: number;
  readonly id: string;
  readonly name: string;
  readonly nameFull: string;
  readonly sex: "F" | "M";
  readonly dob?: string;
  readonly dod?: string;
  readonly desc: string[];
  readonly links: string[];
  relationsIn: Relation[];
  relationsOut: Relation[];

  constructor(_: {
    id: string; name: string; nameFull?: string; sex: "F" | "M"; dob?: string;
    dod?: string; desc: string[]; links?: string[]; relationsOut?: Relation[];
  }) {
    this.id = _.id;
    this.name = _.name;
    this.nameFull = _.nameFull ?? _.name;
    this.sex = _.sex;
    this.dob = _.dob;
    this.dod = _.dod;
    this.desc = _.desc;
    this.links = _.links ?? [];
    this.relationsIn = [];
    this.relationsOut = _.relationsOut ?? [];
  }
}

export class Company implements d3.SimulationNodeDatum {
  index?: number; x?: number; y?: number; fx?: number; fy?: number;
  readonly id: string;
  readonly name: string;
  readonly nameFull: string;
  readonly dob?: string;
  readonly dod?: string;
  readonly desc: string[];
  readonly links: string[];
  relationsIn: Relation[];
  relationsOut: Relation[];

  constructor(_: {
    id: string; name: string; nameFull?: string; sex: "F" | "M"; dob?: string;
    dod?: string; desc: string[]; links?: string[]; relationsOut?: Relation[];
  }) {
    this.id = _.id;
    this.name = _.name;
    this.nameFull = _.nameFull ?? _.name;
    this.dob = _.dob;
    this.dod = _.dod;
    this.desc = _.desc;
    this.links = _.links ?? [];
    this.relationsIn = [];
    this.relationsOut = _.relationsOut ?? [];
  }
}

export class Relation implements d3.SimulationLinkDatum<Person | Company> {
  index?: number;
  source: Person | Company;
  target: Person;
  relationship: string;

  constructor(source: Person | Company, target: Person, relationship: string) {
    this.source = source;
    this.target = target;
    this.relationship = relationship;
  }
}

const loadFromCtx = <T>(
  context: __WebpackModuleApi.RequireContext, type: new (_: any) => T,
): Map<string, T> =>
    new Map(
      context.keys().map((s) => {
        const k = s.slice(2, -5);
        return [k, new type({ id: k, ...context(s).default })];
      })
    );

export const getData = () => {
  const mP =
    loadFromCtx(require.context("../data/people/", false, /\.yaml$/), Person);
  const mC = loadFromCtx(
    require.context("../data/companies/", false, /\.yaml$/), Company,
  );
  [...mP, ...mC].forEach(([, v]: [string, Person | Company]) => {
    v.relationsOut = v.relationsOut
      .map(([t, r]: any) => new Relation(v, mP.get(t)!, r));
  });
  [...mP, ...mC].forEach(([, v]) => {
    v.relationsOut.forEach((r: Relation) => {
      mP.get(r.target.id)!.relationsIn.push(r);
    });
  });
  return [mP, mC] as const;
};
