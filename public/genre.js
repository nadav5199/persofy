document.addEventListener('DOMContentLoaded', function() {
    const genreCards = document.querySelectorAll('.genre-card');

    genreCards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('selected');
            const checkbox = this.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
        });
    });
});