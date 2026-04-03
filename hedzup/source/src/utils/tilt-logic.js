/**
 * TiltLogic - Device orientation engine for game mechanics.
 * Maps rotation to "Yes" (forward) and "Skip" (backward) actions.
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
     * Prefers `deviceorientationabsolute` (Chrome/Android) and falls back to
     * `deviceorientation` (Safari/iOS).
     */
    start() {
        if (this.isActive) return;
        // Safari only fires `deviceorientation`; Chrome fires both but
        // `deviceorientationabsolute` is more stable for heading.
        // For our use case (relative tilt only) `deviceorientation` is fine.
        window.addEventListener('deviceorientation', this.handleOrientation, true);
        this.isActive = true;
    }

    /**
     * Stop the sensor listeners.
     */
    stop() {
        if (!this.isActive) return;
        window.removeEventListener('deviceorientation', this.handleOrientation, true);
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
        // We want to know how much the face of the phone is tilted towards or away from the user.
        // Even if the phone is rotated, the gravity vector stays constant.

        // Convert to radians
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

        // Orientation-aware flip (landscape-primary vs landscape-secondary).
        // screen.orientation.type is unsupported in Safari < 16.4, so we
        // fall back to the legacy window.orientation (0 / 90 / -90 / 180).
        let orientationType = 'landscape-primary';
        if (screen.orientation && screen.orientation.type) {
            orientationType = screen.orientation.type;
        } else if (typeof window.orientation === 'number') {
            // window.orientation: 90 = landscape-left, -90 = landscape-right
            orientationType = (window.orientation === -90 || window.orientation === 270)
                ? 'landscape-secondary'
                : 'landscape-primary';
        }
        const isSecondary = orientationType === 'landscape-secondary';

        // Calculate delta from calibration
        let calibratedPitch = this.smoothed.pitch - this.calibration.pitch;

        // Normalize to -180 to 180
        if (calibratedPitch > 180) calibratedPitch -= 360;
        if (calibratedPitch < -180) calibratedPitch += 360;

        // Final sign correction
        // Action Mapping:
        // Forward (Nod Down) = Positive Pitch = Correct
        // Backward (Nod Up) = Negative Pitch = Skip
        const finalPitch = isSecondary ? -calibratedPitch : calibratedPitch;

        this.checkTriggers(finalPitch);

        // Notify update
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
        // Handle wrap-around for angles in lerp
        let diff = end - start;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        return start + diff * amt;
    }
}

export default TiltLogic;
