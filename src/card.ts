/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Company, Person } from "./data";
import { convertListToElement, getTransform } from "./utils";

export class Card {
  readonly eCard = document.getElementById("card")!;
  readonly eCardTitle = document.getElementById("card-title")!;
  readonly eCardBody = document.getElementById("card-body")!;
  status: "inactive" | "idle" | "dragging" | "active" = "inactive";

  constructor() {
    let translateInit: number, mouseInit: number;
    const onStart = (e: MouseEvent | TouchEvent) => {
      if (this.status === "inactive")
        return;
      this.status = "dragging";
      translateInit =
        getTransform(getComputedStyle(this.eCard).transform).translateY;
      mouseInit =
        (e as MouseEvent).y || (e as TouchEvent).targetTouches[0].pageY;
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (this.status !== "dragging")
        return;
      const y = (e as MouseEvent).y || (e as TouchEvent).targetTouches[0].pageY;
      const translate = Math.max(
        translateInit + y - mouseInit,
        -document.documentElement.clientHeight,
      );
      this.eCard.style.transition = "none";
      this.eCard.style.transform = `translateY(${translate}px)`;
    };
    const onEnd = () => {
      if (this.status !== "dragging")
        return;
      const translate =
        getTransform(getComputedStyle(this.eCard).transform).translateY;
      if (-2 * translate < document.documentElement.clientHeight) {
        this.status = "idle";
        this.eCard.className = "idle";
      } else {
        this.status = "active";
        this.eCard.className = "active";
      }
      this.eCard.style.transition = "";
      this.eCard.style.transform = "";
    };
    this.eCard.addEventListener("mousedown", onStart);
    this.eCard.addEventListener("touchstart", onStart);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("touchmove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchend", onEnd);
  }

  hide() {
    this.status = "inactive";
    this.eCard.className = "inactive";
  }

  show(d: Person | Company) {
    this.status = "idle";
    this.eCard.className = "idle";
    this.eCardTitle.textContent = d.nameFull || d.name;
    if (d.dob || d.dod)
      this.eCardTitle.append(`（${d.dob ?? ""}–${d.dod ?? ""}）`);
    this.eCardBody.innerHTML = convertListToElement(d.desc);
  }
}
