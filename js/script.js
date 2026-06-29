/* ============================================================
   Ben Airways - check-in system with seat selection, meal selection, flight amenities, duty free and pet option.
   ============================================================ */

let takenSeats = [];
const PET_SEAT_IDS = ["seat-1A", "seat-1B"];
const ALL_SEAT_IDS = [
    "seat-1A", "seat-1B", "seat-1C", "seat-1D",
    "seat-2A", "seat-2B", "seat-2C", "seat-2D",
    "seat-3A", "seat-3B", "seat-3C", "seat-3D",
    "seat-4A", "seat-4B", "seat-4C", "seat-4D",
    "seat-5A", "seat-5B", "seat-5C", "seat-5D"
];

/* ── פונקציות עזר ────────────────────────────────────────── */

/* האם ערך קיים במערך */
function inArray(val, arr) {
    for (let i = 0; i < arr.length; i++) { if (arr[i] === val) return true; }
    return false;
}

/* אוסף ומפצל בין ציוד לדיוטי פרי בלולאה אחת */
function collectSplit() {
    const ids = ["blanket", "pillow", "chocolates", "perfumes", "alcohol"];
    let a = [], d = [];
    for (let i = 0; i < ids.length; i++) {
        const el = document.getElementById(ids[i]);
        if (el && el.checked) {
            if (i < 2) a.push(el.value);
            else d.push(el.value);
        }
    }
    return { a: a, d: d };
}

/* מסיר עיצוב פעיל מכל הלייבלים */
function clearLabels() {
    const ids = ["label-blanket", "label-pillow", "label-chocolates", "label-perfumes", "label-alcohol", "label-pet"];
    for (let i = 0; i < ids.length; i++)
        document.getElementById(ids[i]).classList.remove("amenity-active");
}

/* יוצר שורת סיכום לכרטיס */
function bpRow(key, val) {
    return "<div class='bp-row'><span class='bp-key'>" + key +
        "</span><span class='bp-value'>" + val + "</span></div>";
}

/* ── בדיקת תקינות ועדכון מפה ────────────────────────────── */
function checkFormValidity() {
    const pet = document.getElementById("petCabin");
    const petW = document.getElementById("petWeight");
    const errEl = document.getElementById("petWeightError");
    const noteEl = document.getElementById("petSeatNote");
    let petOk = true;

    /* עדכון מפת המושבים לפי סטטוס תפוס או הגבלת בעל חיים */
    for (let i = 0; i < ALL_SEAT_IDS.length; i++) {
        const radio = document.getElementById(ALL_SEAT_IDS[i]);
        const label = radio.parentElement;

        if (inArray(radio.value, takenSeats)) {
            /* מושב תפוס - תמיד חסום ומסומן באדום */
            radio.disabled = true;
            label.classList.add("taken-seat");
            label.classList.remove("pet-restricted");
        } else {
            /* מושב פנוי - מסירים את סימון התפוס ומעדכנים הגבלות חיות מחמד */
            label.classList.remove("taken-seat");

            if (pet.checked && !inArray(ALL_SEAT_IDS[i], PET_SEAT_IDS)) {
                /* במצב חיות מחמד - שורות 2-5 חסומות */
                radio.disabled = true;
                label.classList.add("pet-restricted");
                if (radio.checked) radio.checked = false;
            } else {
                /* מושב מותר ומסומן כפנוי - מאפשרים בחירה */
                radio.disabled = false;
                label.classList.remove("pet-restricted");
            }
        }
    }

    /* בדיקת משקל בעל חיים */
    if (pet.checked) {
        const w = parseFloat(petW.value);
        petOk = petW.value !== "" && !isNaN(w) && w > 0 && w <= 9;
    }
    errEl.style.display = (pet.checked && !petOk) ? "block" : "none";
    noteEl.style.display = (pet.checked && petOk) ? "block" : "none";

    /* בדיקת שדות חובה ושילוב תנאים */
    const name = document.getElementById("passengerName").value.trim();
    const meal = document.getElementById("mealSelect").value;
    const seat = document.querySelector('input[name="seatGroup"]:checked');

    let seatOk = seat !== null && !inArray(seat.value, takenSeats);
    if (seatOk && pet.checked)
        seatOk = inArray("seat-" + seat.value, PET_SEAT_IDS);

    const btn = document.getElementById("summaryBtn");
    const valid = name !== "" && meal !== "" && seatOk && petOk;
    btn.disabled = !valid;
    btn.style.opacity = valid ? "1" : "0.5";

    /* עדכון תצוגה חזותית של מושבים, ארוחה, בעלי חיים ודיוטי פרי */
    const seatContainer = document.getElementById("seatImageContainer");
    const seatImg = document.getElementById("seatImage");
    const mealContainer = document.getElementById("mealImageContainer");
    const petContainer = document.getElementById("petImageContainer");
    const dutyFreeContainer = document.getElementById("dutyFreeImageContainer");

    // 1. עדכון תמונת מושב (חלון או מעבר)
    if (seat) {
        seatContainer.style.display = "inline-block";
        const val = seat.value;
        const lastChar = val.charAt(val.length - 1);
        if (lastChar === "A" || lastChar === "D") {
            // מושב חלון - פינה שמאלית עליונה
            seatImg.style.top = "0px";
            seatImg.style.left = "0px";
        } else {
            // מושב מעבר - פינה ימנית עליונה
            seatImg.style.top = "0px";
            seatImg.style.left = "-70px";
        }
    } else {
        seatContainer.style.display = "none";
    }

    // 2. עדכון תמונת ארוחה
    if (meal !== "") {
        mealContainer.classList.add("highlighted-img");
    } else {
        mealContainer.classList.remove("highlighted-img");
    }

    // 3. עדכון תמונת בעלי חיים
    if (pet.checked) {
        petContainer.classList.add("highlighted-img");
    } else {
        petContainer.classList.remove("highlighted-img");
    }

    // 4. עדכון תמונת דיוטי פרי (במידה ואחד מהמוצרים מסומן)
    const chocolates = document.getElementById("chocolates");
    const perfumes = document.getElementById("perfumes");
    const alcohol = document.getElementById("alcohol");
    if ((chocolates && chocolates.checked) || (perfumes && perfumes.checked) || (alcohol && alcohol.checked)) {
        dutyFreeContainer.classList.add("highlighted-img");
    } else {
        dutyFreeContainer.classList.remove("highlighted-img");
    }

    const formError = document.getElementById("formError");
    if (valid) {
        formError.style.display = "none";
    } else {
        formError.style.display = "block";
    }
}

/* ── הצגת/הסתרת שדה משקל ───────────────────────────────── */
function handlePetChange() {
    const pet = document.getElementById("petCabin");
    const sec = document.getElementById("petWeightSection");
    const lbl = document.getElementById("label-pet");
    if (pet.checked) {
        sec.classList.add("visible");
        lbl.classList.add("amenity-active");
    } else {
        sec.classList.remove("visible");
        lbl.classList.remove("amenity-active");
        document.getElementById("petWeight").value = "";
    }
    checkFormValidity();
}

/* ── בחירת פריט (עיצוב) ────────────────────────────────── */
function handleAmenity(labelId) {
    document.getElementById(labelId).classList.toggle("amenity-active");
}

/* ── כרטיס סיכום ────────────────────────────────────────── */
function showSummary() {
    const name = document.getElementById("passengerName").value.trim();
    const seat = document.querySelector('input[name="seatGroup"]:checked').value;
    const mealEl = document.getElementById("mealSelect");
    const meal = mealEl.options[mealEl.selectedIndex].text;
    const pet = document.getElementById("petCabin");
    const petText = pet.checked
        ? "כן — " + document.getElementById("petWeight").value + " ק\"ג"
        : "ללא";

    const items = collectSplit();
    const amenities = items.a;
    const duty = items.d;

    const html = "<div class='boarding-card'><h3>סיכום הזמנה</h3>" +
        bpRow("שם נוסע", name) +
        bpRow("מושב", seat) +
        bpRow("ארוחה", meal) +
        bpRow("ציוד טיסה", amenities.length ? amenities.join(", ") : "ללא") +
        bpRow("מוצרי דיוטי פרי שהוזמנו", duty.length ? duty.join(", ") : "לא נבחרו מוצרים") +
        bpRow("הטסת בעל חיים", petText) +
        "<button type='button' class='issue-btn' onclick='issueFinalBoardingPass()'>הנפקת בורדינג</button></div>";

    const c = document.getElementById("boardingPassContainer");
    c.innerHTML = html;
    c.classList.add("visible-pass");
    c.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ── הנפקת כרטיס סופי ואיפוס ─────────────────────────────── */
function issueFinalBoardingPass() {
    const name = document.getElementById("passengerName").value.trim();
    const seatEl = document.querySelector('input[name="seatGroup"]:checked');
    const mealEl = document.getElementById("mealSelect");
    const pet = document.getElementById("petCabin");
    const duty = collectSplit().d;
    const petTxt = pet.checked
        ? "כן — " + document.getElementById("petWeight").value + " ק\"ג"
        : "ללא";

    alert("כרטיס הטיסה הונפק בהצלחה!\n"
        + "-----------------------------\n"
        + "שם: " + name + "\n"
        + "מושב: " + seatEl.value + "\n"
        + "ארוחה: " + mealEl.options[mealEl.selectedIndex].text + "\n"
        + "דיוטי פרי: " + (duty.length ? duty.join(", ") : "ללא") + "\n"
        + "בעל חיים: " + petTxt + "\n"
        + "-----------------------------\n"
        + "טיסה טובה, " + name + "!");

    takenSeats.push(seatEl.value);
    document.getElementById("checkinForm").reset();

    clearLabels();
    document.getElementById("petWeightSection").classList.remove("visible");

    const c = document.getElementById("boardingPassContainer");
    c.classList.remove("visible-pass");
    c.innerHTML = "";

    checkFormValidity();
}
