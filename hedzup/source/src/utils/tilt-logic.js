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
        // We want to know how much the face of the phone is tilted towards or away from the user.
        // Even if the phone is rotated, the gravity vector stays constant.

        // Convert to radians
        const b = beta * (Math.PI / 180);
        const g = gamma * (Math.PI / 180);

        // Gravity vector in device coordinates (assuming unit gravity)
        const gx = -Math.sin(g);
        const gy = Math.sin(b) * Math.cos(g);
        const gz = Math.cos(b) * Math.cos(g);

        // Normalize device-relative gravity to the plane of play (landscape)
        // In "Heads Up" mode (phone on forehead), the action is a "nod".
        // This is a rotation around the device's long axis (if landscape).

        // We use Math.atan2 to get a full 360 range and avoid gimbal lock issues.
        // For landscape forehead play, we care about the relationship between gy and gz.
        let rawPitch = Math.atan2(gy, gz) * (180 / Math.PI);

        // Apply smoothing
        this.smoothed.pitch = this.lerp(this.smoothed.pitch || rawPitch, rawPitch, this.options.smoothing);

        // Orientation aware flip (handle landscape-primary vs landscape-secondary)
        const orientation = (screen.orientation || {}).type || window.orientation || 'landscape-primary';
        const isSecondary = String(orientation).includes('secondary') || orientation === -90 || orientation === 270;

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
