export function speak(text, lang = 'en-US') {
    if (!('speechSynthesis' in window))
        return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    window.speechSynthesis.speak(u);
}
export const stopSpeaking = () => window.speechSynthesis.cancel();
