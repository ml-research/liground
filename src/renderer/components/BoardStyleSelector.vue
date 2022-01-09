<template>
  <div>
    <Multiselect
      class="multiselect"
      :value="displayStyle"
      :options="boardStyles"
      :allow-empty="false"
      :show-labels="false"
      @input="updateBoardStyle"
    >
      <template slot="option" slot-scope="props">
        <div class="item">
          <div class="preview">
            <div
              class="image"
              :style="{ backgroundImage: preview(props.option) }"
            />
          </div>
          <span class="name">{{ props.option }}</span>
        </div>
      </template>
      <template slot="singleLabel" slot-scope="props">
        <div class="item">
          <div class="preview">
            <div
              class="image"
              :style="{ backgroundImage: preview(props.option) }"
            />
          </div>
          <span class="name">{{ props.option }}</span>
        </div>
      </template>
    </Multiselect>
  </div>
</template>

<script>
import Multiselect from "vue-multiselect";
import { mapGetters } from "vuex";
import fs from "fs";
export default {
  name: "BoardStyleSelector",
  components: {
    Multiselect,
  },
  data() {
    return {
      counter: 0,
      boardStyles: [
        "Add Custom",
        "blue",
        "brown",
        "green",
        "lightgreen",
        "purple",
      ],
      internationalStyles: [
        "Add Custom",
        "blue",
        "brown",
        "green",
        "lightgreen",
        "purple",
      ],
      seaStyles: ["Add Custom","orange", "yellow"],
      shogiStyles: ["Add Custom","bluechess", "traditional"],
      janggiStyles: ["Add Custom","brown", "dark", "darkwood", "lightbrown", "stone"],
      xiangqiStyles: ["Add Custom","dark", "lightbrown", "orange", "riverbanks"],
    };
  },
  computed: {
    ...mapGetters([
      "variant",
      "boardStyle",
      "isInternational",
      "isShogi",
      "isXiangqi",
      "isSEA",
      "isJanggi",
    ]),
    displayStyle() {
      return this.boardStyle;
    },
  },
  watch: {
    variant() {
      if (this.isInternational) {
        if (localStorage.internationalBoardStyle) {
          this.$store.dispatch(
            "boardStyle",
            localStorage.internationalBoardStyle
          );
        } else {
          this.updateBoardStyle(this.internationalStyles[0]);
        }
        this.boardStyles = [];
        let i;
        for (i = 0; i < this.counter; i++) {
          let custom = "custom" + (i + 1);
          this.internationalStyles.push(custom);
          console.log("test");
        }
        this.internationalStyles.forEach((element) => {
          this.boardStyles.push(element);
        });
      } else if (this.isShogi) {
        if (localStorage.shogiBoardStyle) {
          this.$store.dispatch("boardStyle", localStorage.shogiBoardStyle);
        } else {
          this.updateBoardStyle(this.shogiStyles[1]);
        }
        this.boardStyles = [];
        this.shogiStyles.forEach((element) => {
          this.boardStyles.push(element);
        });
      } else if (this.isSEA) {
        if (localStorage.seaBoardStyle) {
          this.$store.dispatch("boardStyle", localStorage.seaBoardStyle);
        } else {
          this.updateBoardStyle(this.seaStyles[1]);
        }
        this.boardStyles = [];
        this.seaStyles.forEach((element) => {
          this.boardStyles.push(element);
        });
      } else if (this.isXiangqi) {
        if (localStorage.xiangqiBoardStyle) {
          this.$store.dispatch("boardStyle", localStorage.xiangqiBoardStyle);
        } else {
          this.updateBoardStyle(this.xiangqiStyles[1]);
        }
        this.boardStyles = [];
        this.xiangqiStyles.forEach((element) => {
          this.boardStyles.push(element);
        });
      } else if (this.isJanggi) {
        if (localStorage.janggiBoardStyle) {
          this.$store.dispatch("boardStyle", localStorage.janggiBoardStyle);
        } else {
          this.updateBoardStyle(this.janggiStyles[3]);
        }
        this.boardStyles = [];
        this.janggiStyles.forEach((element) => {
          this.boardStyles.push(element);
        });
      }
    },
  },
  methods: {
    preview(name) {
      let board = "";
      if (name == "Add Custom") {
        board = "addCustom";
      } else if (this.isInternational) {
        board = name === "lightgreen" ? "lightgreen" : `${name}`;
      } else if (this.isShogi) {
        const conv = {
          traditional: "shogi",
          bluechess: "shogic",
        };
        board = conv[name];
      } else if (this.isSEA) {
        const conv = {
          yellow: "makruk",
          orange: "makruk2",
        };
        board = conv[name];
      } else if (this.isXiangqi) {
        const conv = {
          dark: "xiangqiDark",
          lightbrown: "xiangqi",
          orange: "xiangqiWikimedia",
          riverbanks: "xiangqic",
        };
        board = conv[name];
      } else if (this.isJanggi) {
        const conv = {
          brown: "JanggiBrown",
          dark: "JanggiDark",
          darkwood: "JanggiWoodDark",
          lightbrown: "Janggi",
          stone: "JanggiStone",
        };
        board = conv[name];
      }
      return `url(static/board/svg/${board}.svg`;
    },

    async reWriteSvgs() {
      const svgFile = await this.addCustom();
      if (svgFile === undefined) {
        return false;
      }
      if (!svgFile.canceled) {
        fs.readFile(svgFile.filePaths[0], "utf-8", (err, data) => {
          if (err) {
            alert("An error ocurred reading the file :" + err.message);
            return;
          }
          const path = "static/board/svg/custom" + this.counter + ".svg";
          fs.writeFile(path, data, (err) => {
            if (err) {
              alert("An error ocurred updating the file" + err.message);
              console.log(err);
              return;
            }
          });
        });
        return true;
      } else if (svgFile.canceled) {
        this.counter--;
        return false;
      }
    },
    async updateCustom(counter) {
      const reWritten = await this.reWriteSvgs(counter);
      if (reWritten) {
        setTimeout(() => {
          const boardStyleCustom = "custom" + counter;
          this.boardStyles.push(boardStyleCustom);
          localStorage.internationalBoardStyle = boardStyleCustom;
          this.$store.dispatch("boardStyle", boardStyleCustom);
        }, 50);
      }
    },
    addCustom() {
      if (this.counter > 5) {
        alert("You can't add more than 5 Custom Designs");
        return;
      }
      return this.$electron.remote.dialog.showOpenDialog({
        title: "Choose Custom Board Style",
        properties: ["openFile"],
        filters: [{ name: "SVG Files", extensions: ["svg"] }],
      });
    },
    updateBoardStyle(payload) {
      if (payload === "Add Custom") {
        this.counter++;
        this.updateCustom(this.counter);
        return;
      } else if (this.isInternational) {
        // localStorage for all different groups of board stylings
        localStorage.internationalBoardStyle = payload;
      } else if (this.isShogi) {
        localStorage.shogiBoardStyle = payload;
      } else if (this.isSEA) {
        localStorage.seaBoardStyle = payload;
      } else if (this.isXiangqi) {
        localStorage.xiangqiBoardStyle = payload;
      } else if (this.isJanggi) {
        localStorage.janggiBoardStyle = payload;
      }
      this.$store.dispatch("boardStyle", payload);
    },
  },
};
</script>

<style scoped>
.item {
  display: flex;
  flex-direction: row;
  font-size: 0.9em;
}
.item .preview {
  margin-top: -8px;
  margin-bottom: -8px;
  margin-left: -4px;
  margin-right: 1ch;
  display: flex;
  flex-direction: row;
  align-items: center;
}
.item .preview .image {
  width: 35px;
  height: 35px;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
}
</style>
