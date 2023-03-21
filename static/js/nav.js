// Toggle the navbar menu on small screens
const toggleNavbar = () => {
  const navbarMenu = document.querySelector('.navbar-menu');
  navbarMenu.classList.toggle('active');
  const navbarToggle = document.querySelector('#navbar-toggle');
  navbarToggle.classList.toggle('active');
}

// Add click event listener to the hamburger button
const navbarToggle = document.querySelector('#navbar-toggle');
navbarToggle.addEventListener('click', toggleNavbar);

// Hide the navbar menu when a link is clicked
const navbarLinks = document.querySelectorAll('.navbar-menu li a');
navbarLinks.forEach(link => {
  link.addEventListener('click', () => {
    const navbarMenu = document.querySelector('.navbar-menu');
    navbarMenu.classList.remove('active');
    const navbarToggle = document.querySelector('#navbar-toggle');
    navbarToggle.classList.remove('active');
  })
})