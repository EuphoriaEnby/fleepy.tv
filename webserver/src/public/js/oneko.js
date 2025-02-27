const b64toBlob = (base64, type = "application/octet-stream") =>
  fetch(`data:${type};base64,${base64}`).then(res => res.blob());
(function oneko() {
  const nekoEl = document.createElement("div");
  let nekoPosX = 32;
  let nekoPosY = 32;
  let mousePosX = 0;
  let mousePosY = 0;
  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;
  let nekoSpeed = 10;
  let defaultNekoSpeed = 10;
  let idleTripped = false;
  let treats = []; // Array of divs representing treats
  let treatsEaten = 0;
  let treatBlobUrl;
  let showingAffection = false;
  fetch(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAoUlEQVQ4T42TLQ6AMAyFN0eC5RRguBoeiedqGDgFlgQ3UtGlK6/d6rbuff1dDA22T0Nazjuip/BSPiQxnxHEBZB47t/MO54uaIgJ0GKmaAgEWGIE+QG0eL1S2MZ/HM6k8NQiy+YSgCwDvMgoiyIDLzKJyWQZspGR5yzH5e0WnEJr7e4e1CBIXDSRDq3LI0us7oEVmSHmJnofyM2And4XloAPYApt3qtwL7wAAAAASUVORK5CYII=",
  ).then(res => {
    res.blob().then(blob => {
      treatBlobUrl = window.URL.createObjectURL(blob);
    });
  });
  const spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratch: [
      [-5, 0],
      [-6, 0],
      [-7, 0],
    ],
    tired: [[-3, -2]],
    sleeping: [
      [-2, 0],
      [-2, -1],
    ],
    N: [
      [-1, -2],
      [-1, -3],
    ],
    NE: [
      [0, -2],
      [0, -3],
    ],
    E: [
      [-3, 0],
      [-3, -1],
    ],
    SE: [
      [-5, -1],
      [-5, -2],
    ],
    S: [
      [-6, -3],
      [-7, -2],
    ],
    SW: [
      [-5, -3],
      [-6, -1],
    ],
    W: [
      [-4, -2],
      [-4, -3],
    ],
    NW: [
      [-1, 0],
      [-1, -1],
    ],
  };
  function create() {
    nekoEl.id = "oneko";
    nekoEl.style.width = "32px";
    nekoEl.style.height = "32px";
    nekoEl.style.position = "fixed";
    nekoEl.style.zIndex = "100";
    nekoEl.style.backgroundImage =
      "url('data:image/gif;base64,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')";
    nekoEl.style.imageRendering = "pixelated";
    nekoEl.style.left = "16px";
    nekoEl.style.top = "16px";
    nekoEl.style.cursor = "grab";

    document.body.appendChild(nekoEl);

    document.onmousemove = event => {
      mousePosX = event.clientX;
      mousePosY = event.clientY;
    };

    let resetMouseMovementsTimeout;
    const resetMouseMovements = () => {
      mousemovements.length = 0;
      clearTimeout(resetMouseMovementsTimeout);
    };

    const mousemovements = [];
    nekoEl.onmousemove = function (ev) {
      const { x, y } = getOffset(ev);
      if (showingAffection) {
        return;
      }
      mousemovements.push([x, y]);
      clearTimeout(resetMouseMovementsTimeout);
      resetMouseMovementsTimeout = setTimeout(resetMouseMovements, 1000);
      if (mousemovements.length > 64) {
        // Calculate if the x coordinates in the array are very vigerous

        showAffection();
        mousemovements.length = 0;
      }
    };

    const speedValue = 1000 / nekoSpeed;

    window.onekoInterval = setInterval(frame, speedValue);
  }

  function setSprite(name, frame) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
  }

  function resetIdleAnimation() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function idle() {
    idleTime += 1;

    // every ~ 20 seconds
    if (idleTime > 10 && Math.floor(Math.random() * 200) == 0 && idleAnimation == null) {
      idleAnimation = ["sleeping", "scratch"][Math.floor(Math.random() * 2)];
    }

    switch (idleAnimation) {
      case "sleeping":
        if (idleAnimationFrame < 8) {
          setSprite("tired", 0);
          break;
        }
        setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
        if (idleAnimationFrame > 192) {
          resetIdleAnimation();
        }
        break;
      case "scratch":
        setSprite("scratch", idleAnimationFrame);
        if (idleAnimationFrame > 9) {
          resetIdleAnimation();
        }
        break;
      default:
        setSprite("idle", 0);
        return;
    }
    idleAnimationFrame += 1;
  }

  window.setOnekoSpeed = function (speed) {
    nekoSpeed = speed;
    if (!idleTripped) {
      clearInterval(window.onekoInterval);
      window.onekoInterval = setInterval(frame, 1000 / speed);
    }
  };

  function getOffset(evt) {
    var el = evt.target,
      x = 0,
      y = 0;

    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      x += el.offsetLeft - el.scrollLeft;
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }

    x = evt.clientX - x;
    y = evt.clientY - y;

    return { x: x, y: y };
  }

  let affectionAnimationFrame = 0;
  let affectionIdle = 0;
  // Creates a new heart element to thje top right of the neko
  function showAffection() {
    if (showingAffection) {
      return;
    }
    showingAffection = true;
    // Create a new div element inside nekoEl
    const nekoAffectionEl = document.createElement("div");
    nekoAffectionEl.style.position = "absolute";
    nekoAffectionEl.style.top = "-4px";
    nekoAffectionEl.style.left = "24px";
    nekoAffectionEl.style.width = "24px";
    nekoAffectionEl.style.height = "24px";
    // background is a spritesheet, all one row, 12 frames.
    nekoAffectionEl.style.backgroundImage =
      " url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASAAAAAYCAMAAABtA9DGAAAAD1BMVEUAAAAAAAD/ExP/yMi7ExMAQYTfAAAAAXRSTlMAQObYZgAAARVJREFUWMPtWMsOwzAIw+T/Pzllh2VTWuGtVV574ENVWS0mhAKNSCAQGAh8gL6V6xl+OjRy5DMyyM8I7Hh7yy/IrEkBQrUwawgQsfNVAYKY4FhRUDHPlUGwe/IRCsYzO1x3bQ2CG14UTK8VVBdNaaCNHjmsAOVbqMA+iF4802V+jg/Q3SFHeVVbtot+dgyQKn1TmUGlMkosn7lndqgu95OuK+agWV0Mfq9F2kRE86HFJNnKhuRdm6/4XZv3eWaH6nI/xxdpM1VH17K6fg4vQUyX+DljDiJTB5I4+yhJtmM+dOSZ7gs/x/+LkX2xnJd0MqrbNHPPG+ggydv3bvwPHHf4qX49EFh9BDL/L+EaH+dBgUDgb3ADb7yGY51HfjMAAAAASUVORK5CYII=')";
    nekoAffectionEl.style.imageRendering = "pixelated";

    // Heart animation
    const interval = setInterval(() => {
      if (affectionIdle > 0) {
        affectionIdle -= 1;
        return;
      }
      nekoAffectionEl.style.backgroundPosition = `${affectionAnimationFrame * 24}px 0px`;
      affectionAnimationFrame += 1;
      if (affectionAnimationFrame > 11) {
        affectionAnimationFrame = 0;
        nekoAffectionEl.style.backgroundPosition = "0px 0px";
        clearInterval(interval);
        showingAffection = false;
      }

      if (affectionAnimationFrame == 8) {
        affectionIdle = 5;
      }
    }, 100);
    nekoEl.appendChild(nekoAffectionEl);
  }

  function frame() {
    frameCount += 1;
    let toTreat = false;
    let posX;
    let posY;
    // Before checking where the mouse is, check if there are any treats
    if (treats.length > 0) {
      toTreat = true;
      // Get the first treat
      const treat = treats[0];
      // Get the position of the treat
      const treatPos = [treat.style.left.slice(0, -2), treat.style.top.slice(0, -2)];
      posX = treatPos[0];
      posY = treatPos[1];
    } else {
      posX = mousePosX;
      posY = mousePosY;
    }

    const diffX = nekoPosX - posX;
    const diffY = nekoPosY - posY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < nekoSpeed || (toTreat ? distance < 12 : distance < 48)) {
      if (treats.length > 0) {
        const treat = treats[0];
        treat.remove();
        treats.splice(0, 1);
        treatsEaten += 1;
        // document.getElementById("eaten").innerHTML = eaten;
      }
      idle();
      // If the idleTime is greater than 0
      if (idleTime > 1 && !idleTripped) {
        idleTripped = true;
        clearInterval(window.onekoInterval);
        window.onekoInterval = setInterval(frame, 1000 / defaultNekoSpeed);
      }

      return;
    }

    idleAnimation = null;
    idleAnimationFrame = 0;

    if (idleTime > 1) {
      setSprite("alert", 0);
      // count down after being alerted before moving
      idleTime = Math.min(idleTime, 7);
      idleTime -= 1;
      return;
    }
    //   If we are no longer idling, set the interval back to nekoSpeed
    if (idleTripped) {
      idleTripped = false;
      clearInterval(window.onekoInterval);
      window.onekoInterval = setInterval(frame, 1000 / nekoSpeed);
    }

    direction = diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";
    setSprite(direction, frameCount);

    // nekoPosX -= (diffX / distance) * nekoSpeed;
    // nekoPosY -= (diffY / distance) * nekoSpeed;

    // If the neko's scale is bigger, we must adjust the speed
    // to make sure it moves at the correct speed.
    const scale = parseFloat(nekoEl.style.transform.substring(6, nekoEl.style.transform.length - 1)) || 1;
    nekoPosX -= (diffX / distance) * (nekoSpeed * scale);
    nekoPosY -= (diffY / distance) * (nekoSpeed * scale);

    // nekoPosX -= (diffX / distance) * (nekoSpeed * 0.75);
    // nekoPosY -= (diffY / distance) * (nekoSpeed * 0.75);

    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
  }

  function placeTreat(x, y) {
    const treat = document.createElement("div");
    treat.className = "oneko-treat";
    treat.style.left = `${x}px`;
    treat.style.top = `${y}px`;
    treat.style.backgroundImage = `url(${treatBlobUrl})`;
    document.body.appendChild(treat);
    treats.push(treat);
  }

  function resize(num) {
    const scaleFactor = 0.2;
    const scale = num * scaleFactor - scaleFactor + 1;

    nekoEl.style.transform = `scale(${scale})`;
    treats.forEach(treat => {
      treat.style.transform = `scale(${scale})`;
    });
  }

  create();

  document.addEventListener("keyup", event => {
    // if the key is "t"
    if (event.key === "t") {
      placeTreat(mousePosX, mousePosY);
    }
  });

  const body = document.querySelector(".body");

  const hrefElement = document.createElement("a");
  hrefElement.href = "javascript:void(0)";
  hrefElement.innerText = "just let me play with the cat";
  hrefElement.classList.add("link");
  hrefElement.addEventListener("click", () => {
    body.classList.toggle("hidden");
  });

  const div = document.createElement("div");
  div.appendChild(hrefElement);
  div.classList.add("topmargin");
  div.style.textAlign = "center";
  body.appendChild(div);

  // Create a new number tick box and append it to a div called "onekoSettings"
  // The number tick box will be called "nekoSpeed" and will be set to the value of the global variable "nekoSpeed"

  const onekoSettings = document.createElement("div");
  onekoSettings.classList.add("onekoSettings");
  onekoSettings.style.textAlign = "center";

  const onekoHeader = document.createElement("h2");
  onekoHeader.innerText = "Oneko Settings";

  // Create a subtitle that says "Oneko port by Adryd", with an anchor link
  const adrydLink = document.createElement("a");
  adrydLink.href = "https://github.com/adryd325/oneko.js/";
  adrydLink.innerText = "Oneko port by Adryd";
  adrydLink.classList.add("link");

  const speedInput = document.createElement("input");
  speedInput.type = "number";
  speedInput.min = "1";
  speedInput.max = "100";
  speedInput.step = "1";
  speedInput.id = "nekoSpeed";
  speedInput.onchange = () => {
    setOnekoSpeed(Number(speedInput.value));
  };
  speedInput.value = nekoSpeed.toString();

  // Prepend labels before the input
  const speedLabel = document.createElement("label");
  speedLabel.innerText = "Neko Speed";
  speedLabel.htmlFor = "nekoSpeed";

  const sizeInput = document.createElement("input");
  sizeInput.type = "number";
  sizeInput.min = "1";
  sizeInput.max = "64";
  sizeInput.step = "1";
  sizeInput.value = "1";
  sizeInput.id = "nekoSize";
  sizeInput.onchange = () => {
    resize(Number(sizeInput.value));
  };

  // Resets neko settings
  const resetNeko = document.createElement("button");
  resetNeko.innerText = "Reset\nNeko";
  resetNeko.onclick = () => {
    setOnekoSpeed(defaultNekoSpeed);
    resize(1);

    sizeInput.value = "1";
    speedInput.value = defaultNekoSpeed;
  };

  // Prepend labels before the input
  const sizeLabel = document.createElement("label");
  sizeLabel.innerText = "Neko Size";
  sizeLabel.htmlFor = "nekoSize";

  const unhidePage = document.createElement("button");
  unhidePage.innerText = "Unhide Page";
  unhidePage.onclick = () => {
    body.classList.remove("hidden");
    onekoSettings.classList.add("hidden");
  };

  const placeTreatButton = document.createElement("button");
  placeTreatButton.innerText = "Place Treats";
  placeTreatButton.mode = false;
  const placeTreatButtonMouseUp = () => {
    // if the element that the mouse is hovering over is a button

    if (placeTreatButton.mode && placeTreatButton.tripped == false) {
      placeTreat(mousePosX, mousePosY);
    }
  };

  placeTreatButton.onmousedown = e => {
    e.preventDefault();
    placeTreatButton.tripped = true;

    if (placeTreatButton.mode) {
      placeTreatButton.innerText = "Place Treats";
      placeTreatButton.mode = false;
      document.removeEventListener("mouseup", placeTreatButtonMouseUp);
    } else {
      placeTreatButton.innerText = "Stop Placing treats";
      document.addEventListener("mouseup", placeTreatButtonMouseUp);
      placeTreatButton.mode = true;
    }
    setTimeout(() => (placeTreatButton.tripped = false), 200);
  };

  const br = () => document.createElement("br");
  const children = [
    onekoHeader,
    adrydLink,
    br(),

    speedLabel,
    speedInput,
    br(),
    sizeLabel,
    sizeInput,
    br(),
    resetNeko,
    placeTreatButton,
    unhidePage,
  ];

  children.forEach(child => onekoSettings.appendChild(child));

  onekoSettings.classList.add("hidden");

  // When the "hidden" class is added to the body, remove "hidden" from onekoSettings
  // Use mutaitonobserver
  const mut = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.target.classList.contains("hidden")) {
        onekoSettings.classList.remove("hidden");
      } else {
        onekoSettings.classList.add("hidden");
      }
    });
  });

  mut.observe(body, {
    attributes: true,
    attributeFilter: ["class"],
  });

  document.body.appendChild(onekoSettings);
})();
