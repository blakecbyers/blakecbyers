(function () {
    let initialDist = 0;
    const PINCH_THRESHOLD = 50; // Pixels to pinch in to trigger
    let isPinching = false;

    document.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            initialDist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            isPinching = true;
        }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (isPinching && e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );

            // Pinch In (Distance getting smaller)
            if (initialDist - dist > PINCH_THRESHOLD) {
                isPinching = false;
                // Visual Feedback
                const overlay = document.createElement('div');
                overlay.style.position = 'fixed';
                overlay.style.inset = '0';
                overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
                overlay.style.zIndex = '10000';
                overlay.style.transition = 'opacity 0.3s';
                overlay.style.display = 'flex';
                overlay.style.alignItems = 'center';
                overlay.style.justifyContent = 'center';
                overlay.innerHTML = '<div style="color:white; font-family:system-ui; font-weight:bold; font-size:24px;">Going Home...</div>';
                document.body.appendChild(overlay);

                // Vibrate
                if (navigator.vibrate) navigator.vibrate(50);

                // Go Home (check if we are in a subdir or root)
                // If we are in root (index.html), maybe do nothing or reload?
                // Assuming we are in subdirs mostly. "Up one level" is safer.
                // But if we are deeper? best to just go to root.
                // Assuming site structure is flat subfolders.

                setTimeout(() => {
                    window.location.href = '../';
                }, 100);
            }
        }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            isPinching = false;
        }
    });
})();
