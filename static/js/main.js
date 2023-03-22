window.addEventListener('load', () => {
    const particlesDiv = document.getElementById('particles-js');
    const section2 = document.getElementById('industries');
    const pageHeight = particlesDiv.offsetHeight + section2.offsetHeight;
    particlesDiv.style.height = pageHeight + 'px';
});
