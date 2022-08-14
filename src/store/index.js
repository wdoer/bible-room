import Vue from 'vue'
import Vuex from 'vuex'

import Bible from './bible.json'
import BibleBooks from './bible-books.json'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    bible: Bible,
    bibleBooks: BibleBooks,
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
