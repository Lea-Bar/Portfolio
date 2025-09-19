export class LanguageService {
    constructor(initialLang = "fr", storageKey = "lang") {
        this.initialLang = initialLang;
        this.storageKey = storageKey;
        this.allowed = ["fr", "en"];

        this.items = document.querySelectorAll("[data-key]");
        this.activeLang = localStorage.getItem(this.storageKey) || this.initialLang;
    }

    async load(lang = this.activeLang) {
        try {
            const response = await fetch(`assets/lang/${lang}.json`);
            const data = await response.json();

            this.items.forEach(node => {
                const key = node.getAttribute("data-key");
                if (data[key]) node.textContent = data[key];
            });

            this.activeLang = lang;

            localStorage.setItem(this.storageKey, lang);
            document.documentElement.lang = lang;

        } catch (error) {
            console.error("Can't load language file:", error);
        }
    }

    switch() {
        const next = this.activeLang === "fr" ? "en" : "fr";
        this.load(next);
    }

    current() {
        return this.activeLang;
    }
}
