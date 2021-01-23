# LiGround

> A free, open-source and modern Chess Variant Analysis GUI for the 21st century

<img src="./media/screenshots/liground-0.0.1.png" alt="LiGround screenshot" title="LiGround screenshot." />

### Build Setup

``` bash
# install dependencies
npm install

# run dev server with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

# lint all JS/Vue component files
npm run lint
```

### Post-Installation Actions

* [Download](https://github.com/ianfab/Fairy-Stockfish/releases/) a **largeboard** binary of _Fairy-Stockfish_ or build it from scratch.

* Rename the _Fairy-Stockfish_ binary to `stockfish` and move it to `./engines/`.

### Libraries

The following libraries or assets are used in **LiGround**:

Library | Description | Usage
--- | --- | ---
[**ffish.js**](https://www.npmjs.com/package/ffish) | A high performance WebAssembly chess variant library based on [_Fairy-Stockfish_](https://github.com/ianfab/Fairy-Stockfish). | Used in the GUI for legal move generation, FEN parsing & validation, pocket pieces, etc.
[**ChessgroundX**](https://github.com/gbtami/chessgroundx) | A free/libre open source chess UI developed for [lichess.org](https://lichess.org/) and [pychess.org](https://www.pychess.org/). | Used as the main UI board element.
[**ornicar/lila**](https://github.com/ornicar/lila) | The forever free, adless and open source chess server | Many high quality assets from [lichess.org](https://lichess.org/) (e.g. piece styles, board styles, chess fonts, ...) are used within this GUI.
[**Vue.js**](https://vuejs.org/) | The Progressive JavaScript Framework | Used as the main JavaScript Framework.
[**Electron**](https://www.electronjs.org/) | Build cross-platform desktop apps with JavaScript, HTML, and CSS | Used for exporting the GUI to the desktop.
[**electron-vue**](https://github.com/SimulatedGREG/electron-vue) | An Electron & Vue.js quick start boilerplate | Used for the boilerplate code.

### Related

Projects that influenced the creation of **LiGround**:

Project | Description
--- | ---
[**tinyChessServer**](https://github.com/MoritzWillig/tinyChessServer) | An xboard server for playing bughouse games via websockets
[**lichess.org/analysis**](https://lichess.org/analysis) | The forever free, adless and open source chess server
[**vue-chessboard**](https://github.com/vitogit/vue-chessboard) | Chessboard vue component to load positions, create positions and see threats
[**cutechess**](https://github.com/cutechess/cutechess) | A graphical user interface, command-line interface and a library for playing chess.
[**XBoard**](https://www.gnu.org/software/xboard/) / [**WinBoard**](http://hgm.nubati.net/) | A graphical user interface for chess in all its major forms.
[**Nibbler**](https://github.com/fohristiwhirl/nibbler) | Leela Chess Zero (Lc0) interface.
[**chess.js**](https://github.com/jhlywa/chess.js) |  A Javascript chess library for chess move generation/validation, piece placement/movement, and check/checkmate/draw detection

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[45a3e22](https://github.com/SimulatedGREG/electron-vue/tree/45a3e224e7bb8fc71909021ccfdcfec0f461f634) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
