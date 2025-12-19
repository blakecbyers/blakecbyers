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
        const { alpha, beta, gamma } = event;
        if (beta === null || gamma === null) return;

        // Store raw values for reference
        this.current = { alpha, beta, gamma };

        // --- FIRST PRINCIPLES PITCH CALCULATION ---
        // For a heads-up game, "Pitch" is the angle of the screen normal relative to the horizon.
        // We use the Z-component of the gravity vector in the device's coordinate frame.
        // g_z = cos(beta) * cos(gamma)

        const bRad = beta * (Math.PI / 180);
        const gRad = gamma * (Math.PI / 180);
        const zComponent = Math.cos(bRad) * Math.cos(gRad);

        // This gives us a 1D "pitch" value:
        // 0 = perfectly vertical (screen facing straight ahead)
        // Positive = tilted "Forward" (screen toward floor / Correct)
        // Negative = tilted "Backward" (screen toward ceiling / Skip)
        // (Note: We negate it to make "Forward" positive for intuitive thresholds)
        const rawPitch = -Math.asin(zComponent) * (180 / Math.PI);

        // Apply smoothing to the final pitch value instead of raw angles
        // This prevents "jumps" when Euler angles flip at the 90-degree boundaries.
        this.smoothed.pitch = this.lerp(this.smoothed.pitch || rawPitch, rawPitch, this.options.smoothing);

        // Calculate delta from calibration
        const calibratedPitch = this.smoothed.pitch - this.calibration.pitch;

        this.checkTriggers(calibratedPitch);

        // Notify update with all relevant data
        this.onUpdate({
            raw: this.current,
            pitch: calibratedPitch,
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
        // Handle wrap-around for degrees during lerp if necessary
        // (Simple lerp for now, as gamma usually doesn't flip frequently in this use case)
        return start + (end - start) * amt;
    }
}

export default TiltLogic;
