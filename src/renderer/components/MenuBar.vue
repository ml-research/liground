<template>
  <div>
  <nav>
    <a href="#" @click="openPgn"><i slot="extra" class="icon mdi mdi-checkerboard"/> Open PGN</a>
    <a href="#"><i slot="extra" class="icon mdi mdi-robot"/> Engines</a>
    <a href="#"><i slot="extra" class="icon mdi mdi-hammer-screwdriver"/> Settings </a>
    <a href="#"><i slot="extra" class="icon mdi mdi-information-outline"/> About <i slot="extra" class="icon mdi mdi-github"/></a>
    <div class="animation start-home"></div>
  </nav>
</div>
</template>

<script>
import fs from 'fs'
import ffish from 'ffish'

export default {
  name: 'MenuBar',
  components: {
  },
  methods: {
    openPgn () {
      let regex = /(?:\[.+ ".*"\]\r?\n)+\r?\n+(?:.+\r?\n)*/gm

      this.$electron.remote.dialog.showOpenDialog({
        title: 'Open PGN file',
        properties: ['openFile'], 
        filters: [
          { name: 'PGN Files', extensions: ['pgn'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      }).then(result => {
        if (!result.canceled) {
          fs.readFile(result.filePaths[0], 'utf8', (err, data) => {
            if (err) {
              return console.log(err);
            }

            let m
            while ((m = regex.exec(data)) !== null) {
              if (m.index === regex.lastIndex) {
                  regex.lastIndex++;
              }
              
              m.forEach((match, groupIndex) => {
                  console.log(`Found match, group ${groupIndex}: ${match}`);
              });
            }

            //console.log(data)
            let game = ffish.readGamePGN(data)
            this.$store.dispatch('loadGame', {game: game})    
          })
        }
      }).catch(err => {
        console.log(err)
      })
    }  
  }
}
</script>

<style scoped>
 nav {
  margin: 10px auto 0;
  position: relative;
  width: 500px;
  height: 20px;
  background-color: #34495e;
  border-radius: 8px;
  font-size: 11px;
}
nav a {
  line-height: 10px;
  /* height: 100%; */
  height: 20px;
  font-size: 8px;
  display: inline-block;
  position: relative;
  z-index: 1;
  text-decoration: none;
  text-align: center;
  color: white;
  cursor: pointer;
}

a:nth-child(1) {
  width: 100px;
}
a:nth-child(2) {
  width: 100px;
}
a:nth-child(3) {
  width: 100px;
}
a:nth-child(4) {
  width: 100px;
}
a:nth-child(5) {
  width: 100px;
}
a:hover {
  color: #688cb0;
}
</style>
