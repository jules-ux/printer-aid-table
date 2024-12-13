<template>
    <v-data-table :headers="headers" :items="items" :search="search" item-value="name" class="main">
        <!-- Status kolom met dynamische kleur en icoon -->
        <template v-slot:item.status="{ item }" class="pa-3">
            <v-chip :color="item.status === 'Active' ? 'green' : 'red'" label dark>
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
import { v4 as uuidv4 } from 'uuid'; // Voeg de UUID-bibliotheek toe

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
    { title: 'Last Name', align: 'start', key: 'namelast' },
    { title: 'Printer', align: 'start', key: 'printer' },
    { title: 'Email', align: 'start', key: 'email' },
    { title: 'Start Time', align: 'start', key: 'timestart' },
    { title: 'End Time', align: 'start', key: 'timeend' },
    { title: 'Print Time', align: 'start', key: 'timeprint' },
    { title: 'Date', align: 'start', key: 'date' },
    { title: 'Status', align: 'start', key: 'status' },
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

// Firebase: Referentie naar het document in de 'global' collectie
const printStatusRef = doc(db, "global", "printStatus");

pubnub.addListener({
    message: async (event) => {
        const message = event.message;
        const now = new Date();
        console.log("Ontvangen bericht:", message);

        if (message === 'on') {
            // Lees de globale printstatus vanuit Firestore
            const docSnap = await getDoc(printStatusRef);
            if (docSnap.exists()) {
                const printStatus = docSnap.data().isPrinting;

                // Als er al een print bezig is, doe dan niets
                if (printStatus) {
                    console.log("Er is al een print bezig.");
                    return;
                }

                // Als er geen print bezig is, start dan een print
                console.log("Print wordt gestart...");
                
                // Update de globale printstatus naar 'true' om aan te geven dat er een print bezig is
                await updateDoc(printStatusRef, {
                    isPrinting: true
                });

                // Voeg een nieuw print-item toe in Firestore
                const newItem = {
                    namefirst: 'Unknown',
                    namelast: 'Unknown',
                    printer: 'Printer1',
                    email: 'unknown@example.com',
                    timestart: now.toLocaleTimeString(),
                    timeend: null,
                    timeprint: null,
                    date: now.toLocaleDateString(),
                    status: 'Active',
                };

                try {
                    const docRef = await addDoc(collection(db, "prints"), newItem);
                    console.log("Document geschreven met ID:", docRef.id);
                    currentPrintId.value = docRef.id;
                } catch (error) {
                    console.error("Error bij het toevoegen van document:", error);
                }
            } else {
                console.log("Geen globale printstatus gevonden.");
            }
        } else if (message === 'off') {
            // Bij het ontvangen van een 'off' bericht, beëindig de print en werk de status bij
            const lastItem = items.value.find(item => item.id === currentPrintId.value && item.status === 'Active' && !item.timeend);

            if (lastItem) {
                const now = new Date();
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

                    // Reset de globale printstatus naar 'false'
                    await updateDoc(printStatusRef, {
                        isPrinting: false
                    });
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

<style scoped>
html,
body {
    margin: 0px;
    padding: 0;
    height: 100%;
}

.pa-2 {
    margin-inline: 12px;
}

.v-data-table-footer {
    margin-inline: 12px;
}

thead {
    background-color: #f9fafc;
}

tr>*>* {
    display: flex;
    justify-content: left;
    font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
    font-weight: 900;
    font-size: 1.02rem;
    color: #5a5b5c
}

.v-data-table__tr>*>*>* {
    display: flex;
    flex-direction: row;
    justify-content: left;
}

.v-data-table__td {
    color: black;
    font-weight: 200;
}
</style>
