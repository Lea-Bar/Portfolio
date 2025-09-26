import { BackgroundService } from "./background/backgroundservice.js";
import { LanguageService } from "./lang/langservice.js";

const langService = new LanguageService();

document.addEventListener("DOMContentLoaded", () => {
    langService.load();

    const container = document.getElementsByClassName("background")[0];
    const backgroundService = new BackgroundService(container);
    backgroundService.load();
})