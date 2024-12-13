<template>
    <div class="search-container">
        <div class="search-wrapper">
            <input v-model="searchTerm" type="text" placeholder="Search here" class="new-search-bar" @focus="onFocus"
                @blur="onBlur" />
        </div>
    </div>
</template>

<script>
export default {
    name: 'SearchBar',
    data() {
        return {
            searchTerm: '',  // De zoekterm wordt hier opgeslagen
            isFocused: false,  // Houdt bij of de zoekbalk in focus is
        };
    },
    watch: {
        searchTerm(newVal) {
            this.$emit('update:search', newVal);  // Emiteer de zoekterm naar de ouder
        },
    },
    methods: {
        onFocus() {
            this.isFocused = true;  // Markeer dat de zoekbalk in focus is
        },
        onBlur() {
            this.isFocused = false;  // Markeer dat de zoekbalk niet meer in focus is
        },
    },
};
</script>

<style>
html, body{user-select: none;}
</style>

<style scoped>
/* Styling voor de zoekbalk-container */
.search-container {
    display: flex;
    justify-content: center;
    align-items: center;
    /* Zorg voor wat ruimte boven de zoekbalk */
}

/* Wrapper voor zoekbalk en het icoon */
.search-wrapper {
    position: relative;
    width: 100%;
    max-width: 600px;
    /* Limiteer de breedte van de zoekbalk */
}

/* Styling voor de zoekbalk */
.new-search-bar {
    width: 100%;
    padding: 10px 15px;
    background-color: #f0f0f0;
    border-radius: 50px;
    font-size: 16px;
    transition: background-color 0.3s ease, border-color 0.3s ease;
}

.new-search-bar:focus {
    outline: none;
    /* Verwijder de standaard focus rand */
}
</style>