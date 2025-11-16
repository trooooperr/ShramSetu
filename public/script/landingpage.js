let signup_user=document.querySelector(".signup_user");
let login_user=document.querySelector(".login_user");
let findjob=document.querySelector(".findjob");
let hireworker=document.querySelector(".hireworker");
let profile=document.querySelector(".profile");
let service=document.querySelector(".service");
let about=document.querySelector(".about");


signup_user.addEventListener("click",()=>
{
    window.location.href='signup_user';
    
})

login_user.addEventListener("click",()=>
{
    window.location.href='login_user';
    
})

findjob.addEventListener("click",()=>
{
    window.location.href='signup_worker';
    
})

hireworker.addEventListener("click",()=>
{
    window.location.href='categorySelector';
    
})

profile.addEventListener("click",()=>
{
    window.location.href='profile';
    
})

service.addEventListener("click",()=>
{
    window.location.href='service';
    
})
about.addEventListener("click",()=>
{
    window.location.href='about';
    
})
let currentIndex = 0;
const images = document.querySelectorAll(".image-wrapper");

function updateSlider() {
  images.forEach((img, index) => {
    img.classList.toggle("active", index === currentIndex);
  });
}

function scrollLeft() {
  currentIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
  updateSlider();
}

function scrollRight() {
  currentIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
  updateSlider();
}

// Initialize slider
updateSlider();

const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  const formData = new FormData(form);

  try {
    // Send form data to your backend, which has the Formspree secret in .env
    const response = await fetch('/api/send-email', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      showMessage('Message sent successfully! We will get back to you soon.', true);
      form.reset();
    } else {
      showMessage('Oops! Something went wrong. Please try again later.', false);
    }
  } catch (err) {
    showMessage('Oops! An error occurred. Please try again later.', false);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  }
});

function showMessage(msg, success) {
  formStatus.textContent = msg;
  formStatus.classList.remove('hidden');
  formStatus.style.color = success ? '#16a34a' : '#dc2626'; // green for success, red for error
}
