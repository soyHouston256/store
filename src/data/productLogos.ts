import angular from "@/assets/logos/angular.svg";
import aws from "@/assets/logos/aws.svg";
import code from "@/assets/logos/code.svg";
import css from "@/assets/logos/css.svg";
import docker from "@/assets/logos/docker.svg";
import firebase from "@/assets/logos/firebase.svg";
import github from "@/assets/logos/github.svg";
import golang from "@/assets/logos/golang.svg";
import hackerRank from "@/assets/logos/hacker-rank.svg";
import java from "@/assets/logos/java.svg";
import laravel from "@/assets/logos/laravel.svg";
import nodeJs from "@/assets/logos/node-js.svg";
import python from "@/assets/logos/python.svg";
import react from "@/assets/logos/react.svg";
import redis from "@/assets/logos/redis.svg";
import redux from "@/assets/logos/redux.svg";
import springBoot from "@/assets/logos/spring-boot.svg";
import ubuntu from "@/assets/logos/ubuntu.svg";
import vue from "@/assets/logos/vue.svg";

const logos: Record<string, string> = {
    "angular": angular,
    "aws": aws,
    "code": code,
    "css": css,
    "dev retro": code,
    "docker": docker,
    "firebase": firebase,
    "github": github,
    "golang": golang,
    "hacker rank": hackerRank,
    "java": java,
    "laravel": laravel,
    "node.js": nodeJs,
    "python": python,
    "react": react,
    "redis": redis,
    "redux": redux,
    "spring boot": springBoot,
    "ubuntu": ubuntu,
    "vue": vue
}

export const getProductLogo = (name?: string): string | undefined => {
    if (!name) return undefined
    const key = name.trim().toLowerCase().replace(/^(polo|taza|mousepad|mouse pad)\s+/, "")
    return logos[key]
}
