<template>
    <div class="upperLeftText">
        <div class="funnel-sans">MakerMonitor </div>
    </div>
</template>



<script>
export default {
    name: 'Top',
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Funnel+Sans:ital,wght@0,300..800;1,300..800&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');

.funnel-sans {
    font-family: "Funnel Sans", sans-serif;
    font-optical-sizing: auto;
    font-weight: 600;
    font-size: 1.6rem;

}

.upperLeftText>*{
    height: 50px;
    margin-left: 20px;
    display: flex;
    align-items: center;
}

@media (max-width: 768px) {
    .upperLeftText>*{
    height: 50px;
    margin-left: 0px;
    display: flex;
    align-items: center;
}
}
</style>