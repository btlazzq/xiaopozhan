
import { createRouter, createWebHistory } from "vue-router";
import index from "../view/index"
import catalogue from "../view/catalogue.vue"
import liberty from "../view/liberty.vue"
import leaveWords from "../view/leaveWords.vue"
import commentWall from "../view/commentWall.vue"
import music from "../view/music.vue"
import musicTime from "@/view/musicTime.vue";
import videoTime from "@/view/videoTime.vue";
import postcard from "@/view/postcard.vue";


const routes = [
    {
        path: "/",
        component: index
    },

    {
        path: "/catalogue",
        component: catalogue
    },
    {
        path: "/liberty",
        component: liberty
    },
    {
        path: "/leaveWords",
        component: leaveWords
    },
    {
        path: "/commentWall",
        component: commentWall
    },
    {
        path: "/postcard",
        component: postcard
    }, {
        path: "/music",
        component: music
    },
    {
        path: "/musicTime",
        component: musicTime
    }, {
        path: "/videoTime",
        component: videoTime
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    },
]


const router = createRouter({

    history: createWebHistory(),
    routes
})

export default router
