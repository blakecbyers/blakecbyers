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
        this.calibration = { pitch: 0 };
        this.current = { beta: 0, gamma: 0, alpha: 0 };
        this.smoothed = { pitch: 0 };

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
        // Set calibration to current smoothed pitch
        this.calibration.pitch = this.smoothed.pitch;
        this.state = 'NEUTRAL';
    }

    /**
     * Process raw sensor data.
     */
    handleOrientation(event) {
        let { beta, gamma } = event;
        if (beta === null || gamma === null) return;

        // Store raw values
        this.current = { beta, gamma, alpha: event.alpha || 0 };

        // --- ROBUST GRAVITY VECTOR PROJECTION ---
        // Z-projection of gravity tells us how much the screen is tilted from vertical.
        const b = beta * (Math.PI / 180);
        const g = gamma * (Math.PI / 180);
        const gz = Math.cos(b) * Math.cos(g);

        // This gives -90 to 90 with 0 being perfectly vertical
        let rawPitch = -Math.asin(gz) * (180 / Math.PI);

        // Disambiguate forward/backward using gamma's sign
        // In landscape, gamma is the primary tilt axis.
        if (gamma < 0) {
            if (rawPitch > 0) rawPitch = 180 - rawPitch;
            else rawPitch = -180 - rawPitch;
        }

        // Apply smoothing
        this.smoothed.pitch = this.lerp(this.smoothed.pitch || rawPitch, rawPitch, this.options.smoothing);

        // Orientation aware flip
        const orientation = (screen.orientation || {}).type || window.orientation || 'landscape-primary';
        const isSecondary = String(orientation).includes('secondary') || orientation === -90 || orientation === 270;

        // Calculate delta from calibration
        let calibratedPitch = this.smoothed.pitch - this.calibration.pitch;

        // Normalize
        if (calibratedPitch > 180) calibratedPitch -= 360;
        if (calibratedPitch < -180) calibratedPitch += 360;

        // Final sign correction for YES/SKIP mapping
        const finalPitch = isSecondary ? -calibratedPitch : calibratedPitch;

        this.checkTriggers(finalPitch);

        // Notify update with all relevant data
        this.onUpdate({
            raw: this.current,
            pitch: finalPitch,
            state: this.state
        });
    }

    /**
     * State machine to handle discrete triggers with hysteresis.
     */
    checkTriggers(pitch) {
        if (this.state === 'NEUTRAL') {
            // Forward tilt = Correct (Yes)
            if (pitch > this.options.threshold) {
                this.state = 'TRIGGERED_YES';
                this.onYes();
            }
            // Backward tilt = Skip
            else if (pitch < -this.options.threshold) {
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
        return start + (end - start) * amt;
    }
}

export default TiltLogic;
