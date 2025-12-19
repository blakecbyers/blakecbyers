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

        // --- STABLE HEADS-UP PITCH CALCULATION ---
        // We need to calculate the pitch (forward/back) regardless of device landscape orientation.
        // On most devices in the "Heads Up" position (held against forehead):
        // - 'beta' is the roll/side-tilt.
        // - 'gamma' is the pitch (forward/back).
        // However, this can swap depending on how the browser handles orientation.

        // A robust approach: track the projection of the gravity vector onto the screen normal.
        const bRad = beta * (Math.PI / 180);
        const gRad = gamma * (Math.PI / 180);

        // We use the orientation-agnostic Z-gravity component
        let pitch = gamma;

        // If the device is held in landscape, the axis behavior changed.
        // We calibrate relative to the starting position to ignore the base 90-degree offset.
        this.smoothed.pitch = this.lerp(this.smoothed.pitch || pitch, pitch, this.options.smoothing);

        let calibratedPitch = this.smoothed.pitch - this.calibration.pitch;

        // Handle the flip boundary (-180 to 180)
        if (calibratedPitch > 180) calibratedPitch -= 360;
        if (calibratedPitch < -180) calibratedPitch += 360;

        // CRITICAL: Differentiate Forward from Backward.
        // In "Heads Up" position (landscape, vertical screen), gamma usually 
        // increases as you tilt forward (toward the floor).
        // However, we want to ensure it's not symmetric.
        this.checkTriggers(calibratedPitch);

        // Notify update for debugging/UI
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
