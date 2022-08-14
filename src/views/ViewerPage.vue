<template>
  <section
    :style="{
      backgroundImage: verses?.length ? '' : 'url(https://wallpaperaccess.com/full/2366116.jpg)',
    }"
  >
    <div class="verse-text"
      :style="{
        fontSize: this.fontSize + 'vw'
      }"
    >
      <div>
        <span v-for="verse in verses" :key="verse.pk">
          {{ verse.text }}
        </span>
      </div>
    </div>
    <div class="verse-book"
      v-if="verses?.length"
      :style="{
        fontSize: 5 + 'vw'
      }"
    >
      <div class="flex items-center justify-center">
        {{ completeBooks }}
      </div>
    </div>
  </section>
</template>

<script>
import { io } from 'socket.io-client';

export default {
  name: 'ViewerPage',
  data: () => ({
    verses: null,
    completeBooks: '',
    fontSize: 5,
  }),
  watch: {
    verses: function(verses) {
      this.getCompleteBooks(verses);

      let tempValue = 0;
      verses.forEach((verse) => tempValue += verse.text.length);

      switch(true) {
        case tempValue < 100:
          this.fontSize = 6;
          break;
        case tempValue < 200:
          this.fontSize = 5.5;
          break;
        case tempValue < 400:
          this.fontSize = 4;
          break;
        case tempValue < 600:
          this.fontSize = 3.3;
          break;
        case tempValue < 800:
          this.fontSize = 3;
          break;
        case tempValue < 1000:
          this.fontSize = 2.5;
          break;
        case tempValue < 1200:
          this.fontSize = 2.25;
          break;
        default:
          this.fontSize = 2;
          break;
      }
    }
  },
  created() {
    io(process.env.VUE_APP_SOCKET_ENDPOINT).on('back', (data) => {
      this.verses = data;
    })
  },
  methods: {
    getCompleteBooks(verses) {
      if (!verses?.length) return;

      const bookName = verses[0].bookName;
      const chapter = verses[0].chapter;

      if (verses.length === 1) {
        this.completeBooks = `${bookName} ${chapter}:${verses[0].verse}`;
        return;
      }

      const sumVerse = [...verses.map((verse) => verse.verse)];

      sumVerse.sort((a, b) => a - b);

      console.log(sumVerse);
      
      this.completeBooks = `${bookName} ${chapter}:${sumVerse[0]}-${sumVerse[sumVerse.length - 1]}`;
    }
  }
}
</script>

<style scoped>
section {
  width: 100vw;
  height: 100vh;
  background-size: cover;
  background-position: center;
  font-family: 'Montserrat';
}
.verse-text {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 0 30px;
  font-weight: 400;
  line-height: 1.2;
  /* text-shadow: 0px 2px 2px #00000057; */
}
.verse-book {
  position: fixed;
  bottom: 10px;
  left: 0;
  right: 0;
  font-weight: 800;
  text-decoration: underline;
  /* box-shadow: inset 0px -23px 13px #8cf2a3; */
}
</style>