// Show quiz popup after 5 seconds
setTimeout(() => {
    document.querySelector('.quiz-popup').style.display = 'block';
}, 5000);

// Open quiz form
document.getElementById('take-quiz-btn').onclick = () => {
    document.querySelector('.quiz-popup').style.display = 'none';
    document.querySelector('.quiz-form-popup').style.display = 'block';
};

// Close popups
document.getElementById('close-quiz-popup').onclick = () => {
    document.querySelector('.quiz-popup').style.display = 'none';
};
document.getElementById('close-quiz-form-popup').onclick = () => {
    document.querySelector('.quiz-form-popup').style.display = 'none';
};

// Quiz cost slider initialization
$(document).ready(function() {
    $("#quiz-cost-slider").ionRangeSlider({
        min: 0,
        max: 200,
        from: 0,
        to: 200,
        prefix: "$"
    });
});

// Handle quiz form submit
document.getElementById('quiz-preferences-form').onsubmit = function (e) {
    e.preventDefault();

    const childAge = document.getElementById('child-age').value.trim();
    const suburb = document.getElementById('quiz-suburb').value.trim();

    const activityType = Array.from(document.querySelectorAll("#activity-type input[name='activity']:checked"))
        .map(input => input.value);

    const quizSlider = $("#quiz-cost-slider").data("ionRangeSlider");

    const preferences = {
        childAge,
        minPrice: quizSlider.result.from,
        maxPrice: quizSlider.result.to,
        activityType,
        suburb
    };

    // Save preferences
    localStorage.setItem('quizPreferences', JSON.stringify(preferences));
    console.log("✅ Saved preferences:", preferences);

    // Close quiz form popup
    document.querySelector('.quiz-form-popup').style.display = 'none';

    // Show "Apply saved preferences" toggle
    const $prefToggle = $("#preference-toggle");
    $prefToggle.show();

    // Optionally auto-check and apply preferences
    $("#apply-preferences-checkbox").prop("checked", true);
    applyPreferences();
    renderSelectedFiltersFromPreferences();

    alert('Preferences saved!');
};

// Apply saved preferences to filters
function applyPreferences() {
    const preferences = JSON.parse(localStorage.getItem('quizPreferences'));
    if (!preferences) return;

    // Age
    if (preferences.childAge) {
        const ages = preferences.childAge.split(",").map(a => a.trim());
        $("#age option").each(function () {
            const [min, max] = this.value.split("-").map(Number);
            const match = ages.some(age => {
                const num = parseInt(age, 10);
                return num >= min && num <= max;
            });
            this.selected = match;
        });
    }

    // Cost slider
    if (preferences.minPrice !== undefined && preferences.maxPrice !== undefined) {
        const filterSlider = $("#cost-slider").data("ionRangeSlider");
        if (filterSlider) {
            filterSlider.update({
                from: preferences.minPrice,
                to: preferences.maxPrice
            });
        }
    }

    // Activity checkboxes
    if (preferences.activityType && preferences.activityType.length > 0) {
        $("#activity-filter input[name='activity']").each(function () {
            this.checked = preferences.activityType.includes(this.value);
        });
    }

    // Suburb
    if (preferences.suburb) {
        $("#suburb").val(preferences.suburb);
    }

    if (typeof filterEvents === "function") {
        filterEvents();
    }
}

// Render selected filters from preferences
function renderSelectedFiltersFromPreferences() {
    const container = $("#selected-filters");
    container.empty();

    const preferences = JSON.parse(localStorage.getItem('quizPreferences'));
    const applyPrefChecked = $("#apply-preferences-checkbox").is(":checked");

    if (preferences && applyPrefChecked) {
        // Age
        if(preferences.childAge){
            const ages = preferences.childAge.split(",").map(a => a.trim());
            ages.forEach(val => {
                const tag = $('<div class="filter-tag"><span>Age: ' + val + '</span><button>&times;</button></div>');
                tag.find("button").click(function(){
                    const ageArr = preferences.childAge.split(",").map(a => a.trim());
                    const index = ageArr.indexOf(val);
                    if(index > -1){
                        ageArr.splice(index,1);
                        preferences.childAge = ageArr.join(",");
                        localStorage.setItem('quizPreferences', JSON.stringify(preferences));
                        renderSelectedFiltersFromPreferences();
                        applyPreferences();
                    }
                });
                container.append(tag);
            });
        }

        // Cost
        if(preferences.minPrice !== undefined && preferences.maxPrice !== undefined){
            const val = `$${preferences.minPrice} - $${preferences.maxPrice}`;
            const tag = $('<div class="filter-tag"><span>Cost: ' + val + '</span><button>&times;</button></div>');
            tag.find("button").click(function(){
                preferences.minPrice = 0;
                preferences.maxPrice = 200;
                localStorage.setItem('quizPreferences', JSON.stringify(preferences));
                renderSelectedFiltersFromPreferences();
                applyPreferences();
            });
            container.append(tag);
        }

        // Activities
        if(preferences.activityType && preferences.activityType.length > 0){
            preferences.activityType.forEach(val => {
                const tag = $('<div class="filter-tag"><span>Activity: ' + val + '</span><button>&times;</button></div>');
                tag.find("button").click(function(){
                    const index = preferences.activityType.indexOf(val);
                    if(index > -1){
                        preferences.activityType.splice(index,1);
                        localStorage.setItem('quizPreferences', JSON.stringify(preferences));
                        renderSelectedFiltersFromPreferences();
                        applyPreferences();
                    }
                });
                container.append(tag);
            });
        }

        // Suburb
        if(preferences.suburb){
            const tag = $('<div class="filter-tag"><span>Suburb: ' + preferences.suburb + '</span><button>&times;</button></div>');
            tag.find("button").click(function(){
                preferences.suburb = "";
                localStorage.setItem('quizPreferences', JSON.stringify(preferences));
                renderSelectedFiltersFromPreferences();
                applyPreferences();
            });
            container.append(tag);
        }

    } else {
        renderSelectedFilters(); // fallback to normal filters
    }
}

// Apply preferences checkbox toggle
$("#apply-preferences-checkbox").on("change", function () {
    if(this.checked){
        applyPreferences();
        renderSelectedFiltersFromPreferences();
    } else {
        clearPreferencesUI();
        renderSelectedFiltersFromPreferences();
        filterEvents();
    }
});

// Clear filters UI without removing localStorage
function clearPreferencesUI() {
    $("#age option").prop("selected", false);
    const costSlider = $("#cost-slider").data("ionRangeSlider");
    if (costSlider) costSlider.update({ from: costSlider.options.min, to: costSlider.options.max });
    $("#suburb").val("");
    $("#date-range").val("");
    $("#activity-filter input[name='activity']").prop("checked", false);
}

// Clear quiz preferences on tab close
window.addEventListener("beforeunload", function () {
    localStorage.removeItem("quizPreferences");
});

// Show toggle on page load if preferences exist
$(document).ready(function () {
    const hasPreferences = !!localStorage.getItem("quizPreferences");
    if (hasPreferences) $("#preference-toggle").show();
});
