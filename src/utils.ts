/* eslint-disable @typescript-eslint/no-non-null-assertion */

export const convertListToElement = (list: string[]) => {
  const res = list.map(s => `<li>${s}</li>`).join("");
  return `<ul>${res}</ul>`;
};

export const getTransform = (transform: string) => {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttributeNS(null, "transform", transform);
  const { matrix } = g.transform.baseVal.consolidate()!;
  return { translateX: matrix.e, translateY: matrix.f };
};
