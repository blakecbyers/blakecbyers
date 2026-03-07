/**
 * WebHaptics - A simple library for haptic feedback on the web.
 * Based on the pattern by Lochie Axon (haptics.lochie.me).
 */
class WebHaptics {
    constructor() {
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        this.hapticElement = null;
        if (this.isIOS) {
            this.initIOSElement();
        }
    }

    initIOSElement() {
        if (typeof document === 'undefined' || this.hapticElement) return;

        // The "iOS Hack": Toggling a checkbox triggers native haptics in Mobile Safari
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.style.position = 'absolute';
        input.style.opacity = '0';
        input.style.pointerEvents = 'none';
        input.style.width = '1px';
        input.style.height = '1px';
        input.setAttribute('aria-hidden', 'true');
        input.tabIndex = -1;
        
        document.body.appendChild(input);
        this.hapticElement = input;
    }

    trigger(type = 'medium') {
        if (this.isIOS) {
            this.triggerIOS();
        } else if ('vibrate' in navigator) {
            this.triggerAndroid(type);
        }
    }

    triggerIOS() {
        if (!this.hapticElement) this.initIOSElement();
        if (this.hapticElement) {
            this.hapticElement.click();
        }
    }

    triggerAndroid(type) {
        const patterns = {
            light: 10,
            medium: 20,
            heavy: 50,
            success: [10, 50, 10],
            warning: [15, 100, 15],
            error: [20, 100, 20, 100, 20],
            selection: 1,
        };

        navigator.vibrate(patterns[type] || patterns.medium);
    }
}

window.haptics = new WebHaptics();
