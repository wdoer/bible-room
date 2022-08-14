<template>
  <section id="panelpage">
    <div class="flex ma-5">
      <v-card
        max-width="300"
        height="500"
        style="overflow: hidden"
      > 
        <v-list height="455" style="overflow-y: auto" dense>
          <v-list-item-group v-model="selectedBookIndex">
            <v-list-item
              v-for="book in usedBooks"
              :key="book.book"
              :id="`book-${book.book}`"
            >
              <v-list-item-content>
                <v-list-item-title class="text-left" v-text="book.name"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
        <v-text-field
          v-model="searchBook"
          label="Книга"
          outlined
          dense
          hide-details
          single-line
        ></v-text-field>
      </v-card>
      <v-card
        width="75"
        height="500"
        style="overflow: hidden"
      >
        <v-list height="100%" style="overflow-y: auto" dense>
          <v-list-item-group v-model="selectedBookChapterIndex">
            <v-list-item
              v-for="chapter in selectedBookChapters"
              :key="chapter"
              :id="`chapter-${chapter}`"
            >
              <v-list-item-content>
                <v-list-item-title class="text-left" v-text="chapter"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-card>
      <v-card
        width="100%"
        max-height="500"
        style="overflow: hidden"
      >
        <v-list height="455" style="overflow-y: auto" dense>
          <v-list-item-group v-model="selectedBookChapterVersesIndex" multiple>
            <v-list-item
              v-for="verse in selectedBookChapterVerses"
              :key="verse.pk"
              :id="`verse-${verse.verse}`"
            >
              <v-list-item-content>
                <v-list-item-title class="text-left" v-text="verse.text"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
        <div class="flex justify-between">
          <v-autocomplete
            v-model="searchInCompleteBible"
            label="Поиск по Библии"
            :items="completeBible"
            item-text="text"
            outlined
            dense
            clearable
            single-line
            allow-overflow
            @focus="searchBook = ''"
          >
            <template v-slot:selection="{ item }">
              {{ getCompleteVerse(item) }}
            </template>
            <template v-slot:item="{ item }">
              <p
                class="text-left w-full py-[10px] px-[20px] my-0 mx-[-15px] h-full"
                @click="selectVerseFromGlobalSearching(item)"
              >
                {{ getCompleteVerse(item) }}
              </p>
            </template>
          </v-autocomplete>
          <v-btn @click="addVerseToPlan()" class="ml-2">Добавить</v-btn>
        </div>
      </v-card>
    </div>
    <div class="flex justify-between ma-5">
      <v-card width="75%" class="flex w-full flex-column align-start justify-start pa-2">
        <div class="flex w-full justify-between">
          План:
        </div>
        <v-list width="100%" height="435" style="overflow-y: auto" dense>
          <v-list-item-group v-model="selectedPlanVerseIndex" multiple>
            <v-list-item
              v-for="(verse, i) in planVerses"
              :key="verse.pk + verse.verse + i"
              :id="`verse-${verse.verse}`"
            >
              <v-list-item-content>
                <v-list-item-title class="text-left flex items-center">
                  <v-btn small icon @click.stop="removeVerseFromPlan(verse)">
                    <v-icon small>mdi-close-circle</v-icon>
                  </v-btn>
                  {{ verse.completeText }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-card>
      <v-card width="25%" class="flex w-full justify-end pa-2">
        <v-btn
          small
          @click="resetSlides()"
        >
          Сбросить
        </v-btn>
        <v-btn
          class="ml-2"
          small
          @click="hideSlide()"
        >
          Скрыть
        </v-btn>
        <v-btn
          class="ml-2"
          small
          color="primary"
          @click="showSlide()"
        >
          Показать
        </v-btn>
      </v-card>
    </div>
  </section>
</template>

<script>
import SocketioService from '../services/socketio.service.js';

export default {
  name: 'PanelPage',
  data: () => ({
    selectedBook: {}, // selected book
    selectedBookChapters: [], // array of chapters [1, 2, 3 ... etc]
    selectedBookChapterVerses: [], // array of verses
    selectedBookIndex: null, // index of selected book
    selectedBookChapterIndex: null,  // index of selected book, chapter
    selectedBookChapterVersesIndex: [], // index of selected chapter, verse

    searchBook: '',
    searchedBooks: [], // searched books
    searchInCompleteBible: '',

    selectedPlanVerseIndex: [],
    planVerses: [],

    SocketioService,
  }),
  computed: {
    bibleBooks() {
      return this.$store.state.bibleBooks; // return all bible books from store
    },
    usedBooks() {
      return (this.searchedBooks.length && this.searchBook) ? this.searchedBooks : this.bibleBooks; // used searched books or all bible books
    },
    completeBible() {
      return this.$store.state.bible;
    }
  },
  watch: {
    searchBook(val) {
      this.selectedBookIndex = null;
      this.searchedBooks = this.bibleBooks.filter((book) => book.name.toLowerCase().includes(val.toLowerCase())); // searching books

      this.searchInCompleteBible = '';
    },
    selectedBookIndex(val) {
      if (val === undefined || val === null) return this.selectedBookChapters = [];

      const tempSelectedBook = this.usedBooks[val];

      this.selectedBook = tempSelectedBook;
      this.selectedBookChapters = [...Array(tempSelectedBook.chapters).keys()].map(x => ++x); // create array of chapters with selected book

      // clear other params

      this.selectedBookChapterIndex = null;
      this.selectedBookChapterVersesIndex = [];
    },
    selectedBookChapterIndex(val) {
      if (val === undefined || val === null) return this.selectedBookChapterVerses = [];

      
      const tempSelectedBookChapterVerses = JSON.stringify(this.completeBible.filter(
        (el) => (
          (el.book === this.selectedBook.book) && 
          (el.chapter === this.selectedBookChapters[this.selectedBookChapterIndex])
        )
      ));

      this.selectedBookChapterVerses = JSON.parse(tempSelectedBookChapterVerses);

      this.selectedBookChapterVerses.forEach((el) => el.text = `${el.verse}. ` + el.text); // add to every verse, prefix index
    },
  },
  created() {
    this.SocketioService.connection();
  },
  beforeUnmount() {
    this.SocketioService.disconnect();
  },
  mounted() {
    this.getPlanFromLS();
  },
  methods: {
    getCompleteVerse(verse) {
      const verseBookName = this.bibleBooks.find((book) => book.book === verse.book).name;

      return `${verseBookName}, ${verse.chapter}:${verse.verse} - ${verse.text}`;
    },
    selectVerseFromGlobalSearching(verse) {
      const tempBookIndex = this.usedBooks.findIndex((book) => book.book === verse.book);
      this.selectedBookIndex = tempBookIndex;

      this.scrollToSelectedBook(tempBookIndex + 1);

      setTimeout(() => {
        this.selectedBookChapterIndex = verse.chapter - 1;
        this.scrollToSelectedBookChapter(verse.chapter);
        setTimeout(() => {
          this.selectedBookChapterVersesIndex = [verse.verse - 1];
          this.scrollToSelectedBookChapterVerse(verse.verse);
        }, 0);
      }, 0);
    },
    scrollToSelectedBook(bookIndex) {
      const book = document.getElementById(`book-${bookIndex}`);

      book.scrollIntoView({ block: "center" });
    },
    scrollToSelectedBookChapter(chapterIndex) {
      const chapter = document.getElementById(`chapter-${chapterIndex}`);

      chapter.scrollIntoView({ block: "center" });
    },
    scrollToSelectedBookChapterVerse(verseIndex) {
      const verse = document.getElementById(`verse-${verseIndex}`);

      verse.scrollIntoView({ block: "center" });
    },
    addVerseToPlan() {
      const tempVerses = [...this.selectedBookChapterVersesIndex.map((el) => this.selectedBookChapterVerses[el])];

      const getVerseBookName = (verse) => {
        return this.bibleBooks.find((book) => book.book === verse.book).name;
      }

      tempVerses.forEach((verse) => {
        verse.completeText = `${getVerseBookName(verse)} ${verse.chapter}:${verse.verse} | ${verse.text}`
        verse.prefixText = `${getVerseBookName(verse)} ${verse.chapter}:${verse.verse}`;
        verse.bookName = getVerseBookName(verse);
      });

      this.planVerses = [...this.planVerses, ...tempVerses];
      
      this.savePlanToLS(this.planVerses);

      this.selectedBookIndex = null;
      this.selectedBookChapterIndex = null;
      this.selectedBookChapterVersesIndex = [];
      this.searchBook = '';
      this.searchInCompleteBible = '';
    },
    removeVerseFromPlan(verse) {
      this.planVerses = this.planVerses.filter((planVerse) => !((planVerse.book === verse.book ) && (planVerse.chapter === verse.chapter) && (planVerse.verse === verse.verse)));

      this.savePlanToLS(this.planVerses);
    },
    savePlanToLS(data) {
      const dataJSON = JSON.stringify(data);
      localStorage.setItem('plan', dataJSON);
    },
    getPlanFromLS() {
      const dataJSON = JSON.parse(localStorage.getItem('plan'));
      this.planVerses = dataJSON ? dataJSON : [];
    },
    showSlide() {
      if(!this.selectedPlanVerseIndex?.length) return;

      this.selectedPlanVerseIndex.sort((a, b) => a - b);

      this.SocketioService.viewVerses(
        [...this.selectedPlanVerseIndex.map((el) => this.planVerses[el])]
      );
    },
    hideSlide() {
      this.SocketioService.viewVerses(
        []
      );
    },
    resetSlides() {
      this.selectedPlanVerseIndex = [];
    }
  }
}
</script>
