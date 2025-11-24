<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Blake Byers</title>
<style>
    body {
        margin: 0;
        background: black;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        font-family: Arial, sans-serif;
    }
    .name {
        font-size: 6rem;
        color: white;
        letter-spacing: 0.2em;
        animation: flash 1.2s infinite alternate;
    }
    @keyframes flash {
        0% { opacity: 0; transform: scale(0.8); filter: blur(6px); }
        100% { opacity: 1; transform: scale(1); filter: blur(0); }
    }
</style>
</head>
<body>
    <div class="name">BLAKE</div>
</body>
</html>
