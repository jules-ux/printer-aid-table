<template>
  <div class="parent-container">
    <div class="topper">
      <Top class="sticky-top" />
      <SearchBar @update:search="updateSearchTerm" />
    </div>
    <Tabel :search="search" />
  </div>
</template>


<script>
import Top from './components/top-section.vue';
import Tabel from './components/PrintTable.vue';
import SearchBar from './components/search.vue';  // Voeg de zoekbalkcomponent toe

export default {
  name: 'ParentComponent',
  components: {
    Top,
    Tabel,
    SearchBar,  // Registreer de zoekbalkcomponent
  },
  data() {
    return {
      search: '',  // Zoekterm die we naar de tabel doorgeven
    };
  },
  methods: {
    updateSearchTerm(newTerm) {
      this.search = newTerm;  // Werk de zoekterm bij wanneer de zoekbalk verandert
    },
  },
};
</script>

<style>
html::-webkit-scrollbar {
  display: none; /* Hides the scrollbar */
}
.v-input__details {
  display: none !important;
}
@media (max-width: 768px) {
  .v-text-field>input {
    text-align: center;
  }
}
</style>

<style scoped>
.parent-container {
  display: flex;
  flex-direction: column;
}

.topper {
  height: 70px;
  display: flex;
  justify-content: space-between;  /* Centraal uitlijnen van de inhoud */
  align-items: center;      /* Verticaal centreren */
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
  padding: 0 20px;          /* Optioneel: wat padding aan de zijkanten */
  box-sizing: border-box;   /* Zorgt ervoor dat padding wordt meegenomen in de breedte */
}

.v-text-field {
  width: 100%;
  max-width: 500px;  /* Beperk de maximale breedte van de zoekbalk */
}

@media (max-width: 768px) {
  .topper {
  height: 110px;
  display: flex;
  flex-direction: column;
  justify-content: center;  /* Centraal uitlijnen van de inhoud */
  align-items: center;      /* Verticaal centreren */
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
  padding: 0 0px;          /* Optioneel: wat padding aan de zijkanten */
  box-sizing: border-box;   /* Zorgt ervoor dat padding wordt meegenomen in de breedte */
  margin-bottom: 10px;
}

}
</style>
