import { WebHaptics } from 'https://esm.sh/web-haptics@0.0.6';

window.haptics = new WebHaptics({ showSwitch: false });

const originalTrigger = window.haptics.trigger.bind(window.haptics);
window.haptics.trigger = (type) => {
    // Fidget and dog-baseball sometimes use specific strings.
    // Ensure we delegate them cleanly or use defaults.
    // web-haptics supports: success, warning, error, light, medium, heavy, soft, rigid, selection, nudge, buzz
    if (type === 'selection') {
        originalTrigger([{ duration: 10, intensity: 0.3 }]);
        return;
    }

    // Fallback trigger
    originalTrigger(typeof type === 'string' ? type : 'medium');
};
