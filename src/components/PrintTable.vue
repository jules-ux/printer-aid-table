<template>
    <v-data-table :headers="headers" :items="items" :search="search" item-value="name" class="main">
        <template v-slot:top>
            <v-text-field v-model="search" class="pa-2" label="Search"></v-text-field>
        </template>

        <!-- Status kolom met dynamische kleur en icoon -->
        <template v-slot:item.status="{ item }">
            <v-chip :color="item.status === 'Active print' ? 'green' : 'red'" label dark >
                <v-icon>{{ item.status === 'Active print' ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
                {{ item.status }}
            </v-chip>
        </template>
    </v-data-table>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import PubNub from 'pubnub';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, onSnapshot } from "firebase/firestore";

// Firebase-configuratie
const firebaseConfig = {
    apiKey: "AIzaSyAIpUdHpSEk8ahMIO59T-BAx7n5_BcRYW4",
    authDomain: "printer-aid.firebaseapp.com",
    databaseURL: "https://printer-aid-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "printer-aid",
    storageBucket: "printer-aid.firebasestorage.app",
    messagingSenderId: "636113573034",
    appId: "1:636113573034:web:ece0d1f5733050f432acd3",
    measurementId: "G-C8D4N5PT0S"
};

// Initialiseer Firebase en Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data voor de tabel
const search = ref('');
const headers = ref([
    { title: 'First Name', align: 'start', key: 'namefirst' },
    { title: 'Last Name', align: 'end', key: 'namelast' },
    { title: 'Printer', align: 'end', key: 'printer' },
    { title: 'Email', align: 'end', key: 'email' },
    { title: 'Start Time', align: 'end', key: 'timestart' },
    { title: 'End Time', align: 'end', key: 'timeend' },
    { title: 'Print Time', align: 'end', key: 'timeprint' },
    { title: 'Date', align: 'end', key: 'date' },
    { title: 'Status', align: 'end', key: 'status' },
]);
const items = ref([]);

// PubNub configuratie
const pubnub = new PubNub({
    publishKey: 'pub-c-c99cf8bb-3a00-4f2c-a061-2f58c92b61ef',
    subscribeKey: 'sub-c-83e02d99-84e9-4b1a-afed-b953fe0c2141',
    userId: 'printer-aid',
});

// Vlag om te controleren of een print bezig is
let isPrinting = ref(false); // Gebruik een vlag om te voorkomen dat de volgende print automatisch start
let currentPrintId = ref(null); // Sla het ID op van de huidige print

// Functie om de Firestore-database te laden
async function loadItems() {
    const querySnapshot = await getDocs(collection(db, "prints"));
    items.value = [];
    querySnapshot.forEach((doc) => {
        items.value.push({ id: doc.id, ...doc.data() });
    });
}

// Abonneer je op updates van de Firestore-collectie
function listenForChanges() {
    const unsub = onSnapshot(collection(db, "prints"), (querySnapshot) => {
        items.value = [];
        querySnapshot.forEach((doc) => {
            items.value.push({ id: doc.id, ...doc.data() });
        });
    });

    // Dit zorgt ervoor dat de listener kan worden gestopt als dat nodig is
    return unsub;
}

// Laad items wanneer de pagina wordt geladen (herstart of voor de eerste keer)
onMounted(async () => {
    await loadItems();
    listenForChanges();
});

// PubNub configuratie en berichten afhandelen
pubnub.subscribe({ channels: ['jobs'] });

pubnub.addListener({
    message: async (event) => {
        const message = event.message;
        const now = new Date();
        console.log("Ontvangen bericht:", message);

        if (message === 'on' && !isPrinting.value) {
            // Als er geen print bezig is, start een nieuwe print
            isPrinting.value = true;

            // Stel een standaardprinter in
            const defaultPrinter = "Printer1"; // Standaardprinter voor 'on' berichten

            // Voeg een nieuw print-item toe
            const newItem = {
                namefirst: 'Unknown',
                namelast: 'Unknown',
                printer: defaultPrinter,  // Gebruik de standaardprinter
                email: 'unknown@example.com',
                timestart: now.toLocaleTimeString(),
                timeend: null,
                timeprint: null,
                date: now.toLocaleDateString(),
                status: 'Active print',
            };

            items.value.push(newItem);

            try {
                const docRef = await addDoc(collection(db, "prints"), newItem);
                console.log("Document geschreven met ID:", docRef.id);
                // Sla het ID van de nieuwe print op om het later bij te werken
                currentPrintId.value = docRef.id;
            } catch (error) {
                console.error("Error bij het toevoegen van document:", error);
            }
        } else if (message === 'off' && isPrinting.value && currentPrintId.value) {
            // Als het 'off' bericht wordt ontvangen, beëindig de print en werk het juiste item bij
            const lastItem = items.value.find(item => item.id === currentPrintId.value && item.status === 'Active print' && !item.timeend);

            if (lastItem) {
                lastItem.timeend = now.toLocaleTimeString();

                const startTime = new Date(`1970-01-01T${lastItem.timestart}`);
                const endTime = new Date(`1970-01-01T${lastItem.timeend}`);
                const diffMs = endTime - startTime;
                const diffMinutes = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMinutes / 60);
                lastItem.timeprint = `${diffHours}h ${diffMinutes % 60}min`;
                lastItem.status = 'Inactive';

                // Update Firestore document met hetzelfde ID
                try {
                    const docRef = doc(db, "prints", lastItem.id);
                    await updateDoc(docRef, {
                        timeend: lastItem.timeend,
                        timeprint: lastItem.timeprint,
                        status: lastItem.status,
                    });
                    console.log('Document geüpdatet met ID:', lastItem.id);
                } catch (error) {
                    console.error("Error bij het updaten van document:", error);
                }

                // Reset de vlag om een nieuwe print te starten
                isPrinting.value = false;
                currentPrintId.value = null; // Reset het ID voor de volgende print
            }
        }
    },
});
</script>

<style>
html,
body {
    margin: 0px;
    padding: 0;
    overflow: hidden;
    height: 100%;
}



</style>