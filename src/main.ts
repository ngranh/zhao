import { Card } from "./card";
import { Chart } from "./chart";
import { getData } from "./data";

const main = () => {
  const [mP, mC] = getData(), card = new Card();
  new Chart(
    mP, mC, decodeURIComponent(location.hash).substring(1),
    () => { window.location.hash = ""; card.hide(); },
    (n) => { window.location.hash = `#${n.id}`; card.show(n); },
  );
};

main();
