import { WebHaptics } from 'https://esm.sh/web-haptics@0.0.6';

// showSwitch: true keeps the input[switch] element NOT display:none,
// which is required for iOS to fire haptic feedback on programmatic .click().
// We visually hide it ourselves immediately after the DOM is ready.
window.haptics = new WebHaptics({ showSwitch: true });

// Visually hide the switch UI without display:none so iOS haptics still fire.
function hideHapticsSwitch() {
    const label = document.querySelector('label[for^="web-haptics-"]');
    if (label) {
        Object.assign(label.style, {
            position: 'fixed',
            bottom: '0', right: '0',
            width: '1px', height: '1px',
            opacity: '0',
            pointerEvents: 'none',
            overflow: 'hidden',
            padding: '0',
            zIndex: '-1',
        });
    }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideHapticsSwitch);
} else {
    setTimeout(hideHapticsSwitch, 0);
}

const originalTrigger = window.haptics.trigger.bind(window.haptics);
window.haptics.trigger = (type) => {
    if (type === 'selection') {
        originalTrigger([{ duration: 10, intensity: 0.3 }]);
        return;
    }
    originalTrigger(typeof type === 'string' ? type : 'medium');
};
