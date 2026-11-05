export const CURTAIN_KEY = "tysha-lang-swap";

/**
 * Runs before first paint:
 * - covers the page with the curtain while a new language loads;
 * - hides the header on the home page while the intro animation is about to play.
 */
export const curtainBootScript = `try{var d=document.documentElement;var l=sessionStorage.getItem("${CURTAIN_KEY}");if(l){d.setAttribute("data-swap","");d.style.setProperty("--swap-label",JSON.stringify(l));}else if(/^\\/(uk|en)\\/?$/.test(location.pathname)&&sessionStorage.getItem("tysha-intro-seen")!=="1"&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.setAttribute("data-intro","");}}catch(e){}`;
