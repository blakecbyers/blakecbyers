/**
 * TiltLogic - A standalone engine for device orientation game mechanics.
 * 
 * Maps device rotation to "Yes" (forward) and "Skip" (backward) actions.
 * Optimized for "Heads-up" style gameplay where the phone is held in landscape 
 * against the forehead, screen facing away.
 */
class TiltLogic {
    constructor(options = {}) {
        this.options = {
            threshold: options.threshold || 45,      // Degrees to trigger action
            neutralZone: options.neutralZone || 20,  // Degrees to return to neutral
            smoothing: options.smoothing || 0.3,     // Low-pass filter (0 to 1)
            ...options
        };

        this.onYes = options.onYes || (() => { });
        this.onSkip = options.onSkip || (() => { });
        this.onUpdate = options.onUpdate || (() => { });
        this.onNeutral = options.onNeutral || (() => { });

        this.state = 'NEUTRAL'; // NEUTRAL, TRIGGERED_YES, TRIGGERED_SKIP
        this.calibration = { beta: 0, gamma: 0, alpha: 0 };
        this.current = { beta: 0, gamma: 0, alpha: 0 };
        this.smoothed = { beta: 0, gamma: 0, alpha: 0 };

        this.handleOrientation = this.handleOrientation.bind(this);
        this.isActive = false;
    }

    /**
     * Start the sensor listeners.
     */
    start() {
        if (this.isActive) return;
        window.addEventListener('deviceorientation', this.handleOrientation);
        this.isActive = true;
    }

    /**
     * Stop the sensor listeners.
     */
    stop() {
        if (!this.isActive) return;
        window.removeEventListener('deviceorientation', this.handleOrientation);
        this.isActive = false;
    }

    /**
     * Capture current angles as the baseline "neutral" position.
     */
    calibrate() {
        // Set calibration to current raw values
        this.calibration = { ...this.current };
        // Reset smoothed values to speed up recovery to stabilized state
        this.smoothed = { ...this.current };
        this.state = 'NEUTRAL';
    }

    /**
     * Process raw sensor data.
     */
    handleOrientation(event) {
        const { alpha, beta, gamma } = event;
        if (beta === null || gamma === null) return;

        // Store raw values
        this.current = { alpha, beta, gamma };

        // Apply low-pass filter for smoothing
        this.smoothed.alpha = this.lerp(this.smoothed.alpha, alpha, this.options.smoothing);
        this.smoothed.beta = this.lerp(this.smoothed.beta, beta, this.options.smoothing);
        this.smoothed.gamma = this.lerp(this.smoothed.gamma, gamma, this.options.smoothing);

        // Calculate delta from calibration
        // In landscape (heads-up), gamma is typically the "pitch" (forward/backward)
        // However, this can depend on the device's default orientation and how browser handles landscape.
        // We'll calculate the relative gamma.
        let pitch = this.smoothed.gamma - this.calibration.gamma;

        // Handle wrap-around for degrees (-180 to 180)
        if (pitch > 180) pitch -= 360;
        if (pitch < -180) pitch += 360;

        this.checkTriggers(pitch);

        // Notify update with all relevant data
        this.onUpdate({
            raw: this.current,
            smoothed: this.smoothed,
            pitch: pitch,
            state: this.state
        });
    }

    /**
     * State machine to handle discrete triggers with hysteresis.
     */
    checkTriggers(pitch) {
        if (this.state === 'NEUTRAL') {
            if (pitch > this.options.threshold) {
                this.state = 'TRIGGERED_YES';
                this.onYes();
            } else if (pitch < -this.options.threshold) {
                this.state = 'TRIGGERED_SKIP';
                this.onSkip();
            }
        } else {
            // Must return to neutral zone before another trigger is possible
            if (Math.abs(pitch) < this.options.neutralZone) {
                const prevState = this.state;
                this.state = 'NEUTRAL';
                this.onNeutral(prevState);
            }
        }
    }

    /**
     * Linear interpolation helper.
     */
    lerp(start, end, amt) {
        // Handle wrap-around for degrees during lerp if necessary
        // (Simple lerp for now, as gamma usually doesn't flip frequently in this use case)
        return start + (end - start) * amt;
    }
}

export default TiltLogic;
