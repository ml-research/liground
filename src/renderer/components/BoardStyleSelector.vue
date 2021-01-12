<template>
    <div>
        <multiselect class= "multiselect" v-model="selected" :options="boardStyles" :allow-empty="false" :show-labels="false" :placeholder="selected"> </multiselect>
    </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import {mapGetters} from 'vuex'

export default {
    name: 'boardStyleSelector',
    components: {
        Multiselect
    }, 
    data() {
        return {
            internationalVariants: [
                'chess', 'crazyhouse', 'horde', 'kingofthehill', '3check', 'racingkings', 'antichess'
            ],
            seaVariants: [
                'makruk'
            ],
            xiangqiVariants: [
                'xiangqi',
            ],
            janggiVariants: [
                'janggi',
            ],
            shogiVariants: [
                'shogi',
            ],
            boardStyles: [
                'blue',
                'brown',
                'green',
                'lightgreen',
                'purple',
            ],
            internationalStyles: [
                'blue',
                'brown',
                'green',
                'lightgreen',
                'purple',
            ],
            seaStyles: [
                'orange',
                'yellow',
            ],
            shogiStyles: [
                'bluechess',
                'traditional',
            ],
            janggiStyles: [
                'brown',
                'dark',
                'darkwood',
                'lightbrown',
                'stone',
            ],
            xiangqiStyles: [
                'dark',
                'lightbrown',
                'orange',
                'riverbanks',
            ],
            selected: 'blue'
        }
    },
    computed: {
        ...mapGetters(['variant'])
    },
    watch: {
        selected: function() {
            this.$store.dispatch('boardStyle', this.selected)
        },
        variant () {
            if (this.internationalVariants.includes(this.variant)) {
                this.selected = this.internationalStyles[0]
                this.boardStyles = []
                this.internationalStyles.forEach(element => {
                    this.boardStyles.push(element)
                });
            }else 
            if (this.shogiVariants.includes(this.variant)) {
                this.selected = this.shogiStyles[1]
                this.boardStyles = []
                this.shogiStyles.forEach(element => {
                    this.boardStyles.push(element)
                });
            }else 
            if (this.seaVariants.includes(this.variant)) {
                this.selected = this.seaStyles[1]
                this.boardStyles = []
                this.seaStyles.forEach(element => {
                    this.boardStyles.push(element)
                });
            }else 
            if (this.xiangqiVariants.includes(this.variant)) {
                this.selected = this.xiangqiStyles[1]
                this.boardStyles = []
                this.xiangqiStyles.forEach(element => {
                    this.boardStyles.push(element)
                });
            }else
            if (this.janggiVariants.includes(this.variant)) {
                this.selected = this.janggiStyles[3]
                this.boardStyles = []
                this.janggiStyles.forEach(element => {
                    this.boardStyles.push(element)
                })
            }
        }
    }
}
</script>
<style scoped>

</style>