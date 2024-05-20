/**
 * To start:
 * npx vite
 */

import "./style.css";
import { flowers } from "./flowers.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <canvas id="canvas" />
  </div>
`;

flowers();
